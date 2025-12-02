import Errors from '~/lib/Errors'
import { isEqual, updateProps } from '~/helpers/object'
import type { AnyObject } from '~/types/utils'
import ValidationError from '~/error/ValidationError'
import { getObjectProp } from '~/utils/object'
import { isRecordableErrorsObject } from '~/utils/validation'
import {
    reactive,
    type Ref,
    ref,
    type ShallowRef,
    shallowRef,
    toRaw,
} from 'vue'

type UseSubmitOptions = {
    /**
     * Called after validation is performed.
     * If it returns false, the submission is aborted.
     * If errors are cleared during this callback, submit handler will receive form data instead of validated data.
     */
    onAfterValidate?: () => void | false
    /**
     * Called when an error occurs during submission, after error has been parsed and recorded.
     * If it returns false, further error handling is aborted and no error is thrown.
     */
    onError?: (e: unknown) => void | false
    /**
     * Resets the form upon successful submission.
     * @default false
     */
    resetOnSuccess?: boolean
    /**
     * Whether to perform validation before submission.
     * @default true
     */
    validate?: boolean
    /**
     * If true, suppresses throwing errors after submission failure.
     * @default false
     */
    silent?: boolean
    /**
     * Function to parse errors from submission failures.
     * If not provided, the default `parseError` method will be used.
     */
    errorParser?: (error: unknown) => ValidationError | undefined
}

export type ValidationFn<TValidatedData> = (data: unknown) => TValidatedData

/**
 * Represents a Form object that handles form data, validation, and form state.
 */
export default class Form<
    TData extends AnyObject = AnyObject,
    TValidatedData = unknown,
> {
    declare public data: TData
    declare public initialData: TData

    public errors: Errors<Extract<keyof TData, string>> = reactive(new Errors<Extract<keyof TData, string>>()) as Errors<Extract<keyof TData, string>>

    public loading: Ref<boolean> = ref(false)
    public sent: Ref<boolean> = ref(false)
    public error: ShallowRef<unknown> = shallowRef<unknown>()

    //

    public constructor(
        initialData: TData,
        private validationFn?: ValidationFn<TValidatedData> | undefined,
    ) {
        const rawInitialData: any = toRaw(initialData)

        this.data = reactive(structuredClone(rawInitialData))
        this.initialData = structuredClone(rawInitialData)
    }

    // Initial data

    private initialDataChangeCount = ref(0)

    /**
     * Updates the initial data.
     * If no data is provided, the current data will be used.
     */
    public updateInitialData(newData?: TData): void {
        this.initialData = structuredClone(toRaw(newData ?? this.data)) as TData

        this.initialDataChangeCount.value++

        if (newData) {
            this.updateData(newData)
        }
    }

    //

    /**
     * Update the data in the object with new values.
     */
    public updateData(newData: Partial<TData>): void {
        updateProps(this.data, newData)
    }

    /**
     * Resets the form to its initial state.
     */
    public reset(): void {
        Object.keys(this.initialData).forEach(key => {
            // @ts-ignore
            this.data[key] = structuredClone(this.initialData?.[key])
        })

        this.errors.clear()
    }

    //

    /**
     * Checks if there are any changes in the data compared to the initial data.
     */
    public get hasChanges(): boolean {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.initialDataChangeCount.value // Keep this to track changes in computed

        return !isEqual(this.data, this.initialData)
    }

    // Validation

    /**
     * Validates the given field value against the specified or default validation rules set.
     *
     * Full validation is performed using the `validationFn` provided during form initialization, but
     * only errors related to the specified field are updated.
     *
     * @return {boolean} - Returns true if the field is valid, false otherwise.
     */
    public validateField(
        field: string,
    ): boolean {
        if (!this.validationFn) {
            return true
        }

        try {
            this.validationFn(this.data)

            this.errors.clear(field)

            return true
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                const fieldErrors = e.errors.get(field)

                if (fieldErrors.length) {
                    this.errors.clear(field)
                    this.errors.add({ [field]: fieldErrors })

                    return false
                } else {
                    this.errors.clear(field)

                    return true
                }
            } else {
                throw e
            }
        }
    }

    /**
     * Validates the data against the provided validation rules.
     * Every call updates form internal errors state.
     *
     * @return Validated data if validation passes, Errors otherwise.
     */
    public validate(): TValidatedData | Errors {
        if (!this.validationFn) {
            return this.data as unknown as TValidatedData
        }

        try {
            const validatedData = this.validationFn(this.data)

            this.errors.clear()

            return validatedData
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                const allErrors = e.errors.all()

                this.errors.record(allErrors)

                return this.errors
            } else {
                throw e
            }
        }
    }

    /**
     * Returns a function that can be used to submit the form.
     */
    public useSubmit<Result>(
        resolver: (data: TValidatedData) => Promise<Result> | Result,
        options: UseSubmitOptions = {},
    ): (() => Promise<void>) {
        return this.debounce(async () => {
            this.sent.value = false

            let validatedData: TValidatedData = this.data as unknown as TValidatedData

            if ((options.validate ?? true)) {
                const validationResult = this.validate()

                const onAfterValidateResult = options.onAfterValidate?.()

                if (this.errors.any() || onAfterValidateResult === false) {
                    return
                }

                if (!(validationResult instanceof Errors)) {
                    validatedData = validationResult
                }
            }

            try {
                await resolver(validatedData)

                this.error.value = undefined
                this.sent.value = true

                if (options.resetOnSuccess) {
                    this.reset()
                }
            } catch (e: unknown) {
                const errorParser = options.errorParser ?? this.parseErrorsObjectFromHttpError.bind(this)

                const parsedError = errorParser(e)

                if (parsedError) {
                    this.errors.record(parsedError.errors.all())
                    this.error.value = parsedError
                } else {
                    this.error.value = e
                }

                if (options.onError) {
                    const result = options.onError(e)

                    if (result === false) {
                        return
                    }
                }

                if (!options.silent) {
                    throw this.error.value
                }
            }
        })
    }

    /**
     * Default error parser to extract validation errors from various error response structures.
     *
     * Expects error to potentially contain validation errors in nested properties and follow UnparsedErrorsObject type
     * Checks multiple common paths to locate validation errors.
     */
    protected parseErrorsObjectFromHttpError(
        error: unknown,
    ): ValidationError | undefined {
        if (error instanceof ValidationError) {
            return error
        }

        if (typeof error !== 'object' || error === null) {
            return
        }

        const paths = [
            'data.errors',
            'data.validationErrors',
            'data.data.errors',
            'data.data.validationErrors',

            'response.data.errors',
            'response.data.validationErrors',

            'response._data.errors',
            'response._data.validationErrors',
            '_data.errors',
            '_data.validationErrors',
        ]

        for (const path of paths) {
            const raw = getObjectProp(error, path)

            if (!raw || !isRecordableErrorsObject(raw)) {
                continue
            }

            const errors = new Errors(raw)

            if (!errors.any()) {
                continue
            }

            const message = error instanceof Error ? error.message : undefined

            return new ValidationError(errors, message)
        }
    }

    //

    private debounce(fn: () => any) {
        return async () => {
            if (this.loading.value) {
                return
            }

            this.loading.value = true

            let result = null

            try {
                result = await fn()

                return result
            } catch (e: unknown) {
                throw e
            } finally {
                this.loading.value = false
            }
        }
    }
}
