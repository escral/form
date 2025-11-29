import type Form from '~/vue/lib/Form'
import { getProp, setProp } from '~/helpers/object'

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

    public get errors(): string[] {
        return this.form.errors.get(this.path)
    }

    public get error(): string | undefined {
        return this.form.errors.first(this.path)
    }

    public get hasError(): boolean {
        return this.form.errors.has(this.path)
    }
}
