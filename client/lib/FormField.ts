import type Form from '#client/lib/Form'
import { getProp, setProp } from '#shared/utils/object'

export default class FormField<TValue = unknown> {
    public declare path: string

    public constructor(private form: Form, field: string) {
        this.path = field
    }

    public get value(): TValue {
        return getProp(this.form.data, this.path) as TValue
    }

    public set value(value: TValue) {
        setProp(this.form.data, this.path, value)
        this.form.validateField(this.path)
    }

    // Errors
    // ==============================

    public get errors() {
        return this.form.errors.get(this.path)
    }

    public get error() {
        return this.form.errors.first(this.path)
    }

    public get hasError() {
        return this.form.errors.has(this.path)
    }
}
