import Errors, { type ErrorsObject } from '~/lib/Errors'
import { templateString, toHumanPhrase } from '~/helpers/string'
import { getProp, isEqual, makeDestructurableClass, updateProps } from '~/helpers/object'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { reactive, ref, toRaw, toValue } from 'vue'
import type { AnyObject } from '~/types/utils'

type UseSubmitOptions = {
    onError?: (e: unknown) => void | false
    onValidate?: () => void | false
    resetOnSuccess?: boolean
    validate?: boolean
    silent?: boolean
}

type UseSubmitResolverOptions<Result, TData = unknown> = {
    resolver: (data: TData) => Promise<Result> | Result
}

/**
 * Represents a Form object that handles form data, validation, and form state.
 */
export default class Form<
    TData extends AnyObject = AnyObject,
> {
    declare public data: TData
    declare public initialData: TData

    public errors: Errors<Extract<keyof TData, string>> = reactive(new Errors<Extract<keyof TData, string>>()) as Errors<Extract<keyof TData, string>>

    public loading: Ref<boolean> = ref(false)
    public error: Ref<unknown> = ref<unknown>()
    public sent: Ref<boolean> = ref(false)

    //

    public constructor(initialData: TData, private validationRules?: MaybeRefOrGetter<ValidationRulesSet> | undefined) {
        const rawInitialData: any = toRaw(initialData)

        this.data = reactive(structuredClone(rawInitialData))
        this.initialData = structuredClone(rawInitialData)
    }

    protected logger: typeof console = console

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
     * @return {boolean} - Returns true if the field is valid, false otherwise.
     */
    public validateField(
        field: string,
        value?: any,
        validationRulesSet?: ValidationRulesSet,
    ): boolean {
        const fieldErrors = this.getFieldValidationErrors(field, value, validationRulesSet, [], new Errors())

        if (this.errors.any()) {
            this.errors.clear(field)
        }

        this.errors.add(fieldErrors.all())

        return !fieldErrors.any()
    }

    /**
     * Validates the data against the provided validation rules.
     * If no data or validation rules are provided, it uses the default data and validation rules from the class.
     *
     * @return {boolean} True if the validation was successful, false otherwise.
     */
    public validate(dataToValidate: AnyObject | null = null, validationRulesSet?: ValidationRulesSet): boolean {
        const useData = dataToValidate ?? this.data

        if (!useData) {
            throw new Error('No data provided to validate')
        }

        const fields = Object.keys(useData)

        let cleared = false
        let hasErrors = false

        fields.forEach(field => {
            const calculatedErrors = this.getFieldValidationErrors(field, useData[field], validationRulesSet ?? undefined)

            if (calculatedErrors.any()) {
                hasErrors = true

                if (!cleared) {
                    this.errors.clear()
                    cleared = true
                }

                this.errors.add(calculatedErrors.all())
            }
        })

        if (!cleared) {
            this.errors.clear()
        }

        if (hasErrors) {
            this.logger.warn('Validation failed', this.errors.all())
        }

        return !hasErrors
    }

    protected defaultValidationRules = {
        //
    }

    private getFieldValidationErrors(
        field: string,
        value?: any,
        validationRulesSet?: ValidationRulesSet,
        path: string[] = [],
        calculatedErrors = new Errors(),
    ): Errors {
        value ??= this.data[field]

        if (!validationRulesSet) {
            validationRulesSet = toValue(this.validationRules) || this.defaultValidationRules
        }

        const currentRules = validationRulesSet[field]

        if (isNestedRules(currentRules)) {
            // It is nested rules
            for (const nestedField in currentRules) {
                if (!value || !(nestedField in value)) {
                    continue
                }

                const errors = this.getFieldValidationErrors(nestedField, value[nestedField], currentRules, [...path, field], calculatedErrors)

                calculatedErrors.add(errors.all())
            }
        }

        if (currentRules && !isSimpleRules(currentRules)) {
            return calculatedErrors
        }

        let rules = currentRules

        if (!rules) {
            return calculatedErrors
        }

        rules = normalizeRules(rules)

        for (const handler of rules) {
            const errors = handler(value, field, getProp(this.data, path) ?? this.data)

            if (!errors) {
                continue
            }

            if (typeof errors === 'object') {
                for (const nfield in errors) {
                    this.getFieldValidationErrors(nfield, value[nfield], errors as unknown as ValidationRulesSet, [...path, field], calculatedErrors)
                }

                continue
            }

            const tErrors = normalizeErrors(errors, [...path, field].join('.'))

            // Apply template to errors
            for (const field in tErrors) {
                const lastField = field.split('.').pop() ?? field

                for (const i in tErrors[field]) {
                    tErrors[field][i] = templateString(tErrors[field][i], {
                        field: toHumanPhrase(lastField),
                    })
                }
            }

            calculatedErrors.add(tErrors)
        }

        return calculatedErrors
    }

    //

    /**
     * Returns a function that can be used to submit the form.
     */
    public useSubmit<Result>(resolver: (data: TData) => Promise<Result> | Result, options?: UseSubmitOptions): (() => Promise<void>)
    public useSubmit<Result>(options: UseSubmitOptions & UseSubmitResolverOptions<Result, TData>): (() => Promise<void>)

    public useSubmit(_resolver: unknown, _options?: unknown): unknown {
        let options: UseSubmitOptions & UseSubmitResolverOptions<any>

        if (typeof _resolver === 'function') {
            options = {
                ..._options ?? {},
                resolver: _resolver as any,
            }
        } else {
            options = _resolver as any
        }

        return this.debounce(async () => {
            this.sent.value = false

            if ((options.validate ?? true)) {
                const baseValidationResult = this.validate()
                const onValidateResult = options.onValidate?.()

                if (!baseValidationResult || onValidateResult === false) {
                    return
                }
            }

            try {
                await options.resolver(this.data)

                this.error.value = undefined
                this.sent.value = true

                if (options.resetOnSuccess) {
                    this.logger.log('Resetting form after success')

                    this.reset()
                }
            } catch (e: unknown) {
                this.error.value = e

                this.parseError(e)

                if (options.onError) {
                    const result = options.onError(e)

                    if (result === false) {
                        return
                    }
                }

                if (!options.silent) {
                    throw e
                }
            }
        })
    }

    /**
     * Override this method to parse your app default errors.
     */
    protected parseError(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _error: unknown,
    ): void {
        // Override this method to parse your API error responses
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

    //

    public destructable(): this {
        return makeDestructurableClass(this)
    }
}

const normalizeRules = (rules: ValidationRule | ValidationRule[]) => {
    return Array.isArray(rules) ? rules : [rules]
}

const isNestedRules = (rules: ValidationRulesSet[keyof ValidationRulesSet]): rules is {
    [field: string]: ValidationRulesSet
} => {
    return typeof rules === 'object' && !Array.isArray(rules)
}

const isSimpleRules = (rules: ValidationRulesSet[keyof ValidationRulesSet]): rules is ValidationRule | ValidationRule[] => {
    return !isNestedRules(rules)
}

const normalizeErrors = (errors: ValidationMessage, field: string) => {
    const result: ErrorsObject = {}

    if (Array.isArray(errors) || typeof errors !== 'object') {
        result[field] = typeof errors === 'string' ? [errors] : errors
    } else {
        Object.keys(errors).forEach(key => {
            if (typeof errors[key] === 'string') {
                result[key] = [errors[key] as string]
            } else {
                result[key] = errors[key] as string[]
            }
        })
    }

    return result
}

type ValidationMessage = string | string[] | Record<string, string | string[]>

export type ValidationRule = {
    (value: any, field: string, form: Record<string, any>): ValidationMessage | null | undefined | void
}

export type ValidationRulesSet = {
    [field: string]: ValidationRule | ValidationRule[] | ValidationRulesSet
}
