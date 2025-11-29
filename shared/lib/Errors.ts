export type ErrorsObject<TFields extends string = string> = { [field in TFields]: string[] }
export type UnparsedErrorsObject = { [field: string]: UnparsedErrorsObject | UnparsedErrorsObject[] | string | string[] }

export default class Errors<TFields extends string = string> {
    protected errors: ErrorsObject = {}

    /**
     * Create a new Errors instance.
     */
    public constructor(errors: UnparsedErrorsObject = {}) {
        this.record(errors)
    }

    /**
     * Get all the errors.
     */
    public all() {
        return this.errors
    }

    /**
     * Determine if any errors exists for the given field or object.
     */
    public has(field: TFields) {
        let hasError = field in this.errors

        if (!hasError) {
            const errors = Object.keys(this.errors).filter(e => e.startsWith(`${field}.`) || e.startsWith(`${field}[`))

            hasError = errors.length > 0
        }

        return hasError
    }

    public first(field?: TFields) {
        if (!field) {
            const keys = Object.keys(this.errors)

            if (keys.length === 0) {
                return
            }

            return this.get(keys[0] as TFields)[0]
        }

        return this.get(field)[0]
    }

    public get(field: TFields) {
        return this.errors[field] || []
    }

    /**
     * Determine if there are any errors.
     */
    public any(keys: TFields[] = []): boolean {
        if (keys.length === 0) {
            return Object.keys(this.errors).length > 0
        }

        for (const key of keys) {
            if (this.get(key).length > 0) {
                return true
            }
        }

        return false
    }

    /**
     * Record the new errors.
     */
    public record(errors: UnparsedErrorsObject = {}) {
        this.clear()

        this.traverse(errors)
    }

    private traverse(errors: UnparsedErrorsObject, prefix = '', add = false) {
        Object.keys(errors).forEach(field => {
            const key = (prefix.length ? prefix + '.' : '') + field
            let data = errors[field]

            if (typeof data === 'string') {
                data = [data]
            }

            if (Array.isArray(data)) {
                if (typeof data[0] === 'object') {
                    (data as UnparsedErrorsObject[]).forEach((data, i) => this.traverse(data, key + '.' + i, add))
                } else {
                    if (add && this.errors[key]) {
                        this.errors[key].push(...data as string[])
                    } else {
                        this.errors[key] = data as string[]
                    }

                    this.errors[key] = unique(this.errors[key])
                }
            } else if (typeof data === 'object') {
                this.traverse(data, key, add)
            }
        })
    }

    public add(errors: UnparsedErrorsObject) {
        this.traverse(errors, '', true)
    }

    /**
     * Clear a specific field, object or all error fields.
     */
    public clear(field?: string) {
        if (!field) {
            Object.keys(this.errors).forEach(e => delete this.errors[e])

            return
        }

        Object.keys(this.errors)
            .filter(e => e === field || e.startsWith(`${field}.`) || e.startsWith(`${field}[`))
            .forEach(e => delete this.errors[e])
    }

    public slice(namespace: string) {
        const errors: ErrorsObject = {}

        Object.keys(this.errors).forEach(key => {
            if (key.startsWith(namespace + '.')) {
                // Replace from start
                const newKey = key.substring(namespace.length + 1)

                errors[newKey as TFields] = this.errors[key]
            }
        })

        return new Errors(errors)
    }
}

const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr))
