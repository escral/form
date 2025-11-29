import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { validateDataUsingZod } from '#server/utils/validateDataUsingZod'
import ValidationError from '#server/error/ValidationError'

describe('validateDataUsingZod', () => {
    test('returns parsed data for valid input', () => {
        const someInput = { name: 'John' }

        const schema = z.object({
            name: z.string(),
        })

        const validInput = validateDataUsingZod(someInput, schema)

        expect(validInput).toEqual({ name: 'John' })
    })

    test('throws ValidationError for invalid input', () => {
        const someInput = { name: 123, age: 'not a number' }

        const schema = z.object({
            name: z.string(),
            age: z.number(),
        })

        try {
            validateDataUsingZod(someInput, schema)
            expect.fail('Should have thrown ValidationError')
        } catch (error: any) {
            expect(error).toBeInstanceOf(ValidationError)
            const validationError = error as ValidationError
            expect(validationError.errors.has('name')).toBe(true)
            expect(validationError.errors.has('age')).toBe(true)
        }
    })
})
