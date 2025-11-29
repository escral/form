import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from 'vitest'

import Form from '~/vue/lib/Form'
import FormField from '~/vue/lib/FormField'

type TestData = {
    user: {
        name: string
        email: string
    }
}

describe('FormField', () => {
    let form: Form<TestData>
    let field: FormField<string>

    beforeEach(() => {
        form = new Form<TestData>({
            user: { name: 'John Doe', email: 'john@example.com' },
        })
        field = new FormField(form, 'user.name')
    })

    it('initializes with correct field name', () => {
        expect(field.path).toBe('user.name')
    })

    it('gets the correct value from the form', () => {
        expect(field.value).toBe('John Doe')
    })

    it('sets a new value and triggers validation', () => {
        const validateFieldSpy = vi.spyOn(form, 'validateField')
        field.value = 'Jane Doe'

        expect(form.data.user.name).toBe('Jane Doe')
        expect(validateFieldSpy).toHaveBeenCalledWith('user.name')
    })

    it('retrieves errors correctly when present', () => {
        form.errors.add({ 'user.name': ['Name is required']})

        expect(field.errors).toEqual(['Name is required'])
        expect(field.error).toBe('Name is required')
        expect(field.hasError).toBe(true)
    })

    it('returns no error when no errors are present', () => {
        expect(field.errors).toEqual([])
        expect(field.error).toBeUndefined()
        expect(field.hasError).toBe(false)
    })

    it('updates form data correctly through value setter', () => {
        field.value = 'Jane Doe'
        expect(form.data.user.name).toBe('Jane Doe')
    })
})
