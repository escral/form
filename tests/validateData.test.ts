import { describe, expect, it, test } from 'vitest'
import Errors from '~/lib/Errors'
import { z } from 'zod'
import { validateDataUsingZod } from '~/utils/validateDataUsingZod'
import { ValidationError } from '~/index'

describe('validateData', () => {
    it('validates anything that throws ValidationError', () => {
        try {
            validateData(
                { name: 'Jo' },
                (data) => {
                    const errors = new Errors()

                    if ((data as any).name && (data as any).name.length < 3) {
                        errors.add({ name: 'Too short' })
                    }

                    throw new ValidationError(errors)
                },
            )

            expect.fail('Should have thrown ValidationError')
        } catch (error: any) {
            expect(error).toBeInstanceOf(ValidationError)
            const validationError = error as ValidationError
            expect(validationError.errors.has('name')).toBe(true)
        }
    })
})

describe('zod validation', () => {
    test('useZodFormValidation', () => {
        try {
            validateData(
                { name: 'Jo' },
                useZodFormValidation(
                    z.object({
                        name: z.string().min(3, 'Too short'),
                    }),
                ),
            )

            expect.fail('Should have thrown ValidationError')
        } catch (error: any) {
            expect(error).toBeInstanceOf(ValidationError)
            const validationError = error as ValidationError
            expect(validationError.errors.get('name')).toContain('Too short')
        }
    })
})

function validateData<T>(data: unknown, validateFn: (data: unknown, errors: Errors) => T): T {
    const errors = new Errors()

    return validateFn(data, errors)
}

function useZodFormValidation<T>(schema: z.ZodTypeAny<T>): (data: unknown, errors: Errors) => T {
    return (data: unknown, errors: Errors) => {
        return validateDataUsingZod<T>(data, schema)
    }
}
