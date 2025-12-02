import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ValidationError } from '@escral/form'
import { validateDataUsingZodAsync } from '~/zod'

describe('validateDataUsingZodAsync', () => {
    test('returns parsed data for valid input', async () => {
        const someInput = { name: 'John' }

        const schema = z.object({
            name: z.string(),
        })

        const validInput = await validateDataUsingZodAsync(someInput, schema)

        expect(validInput).toEqual({ name: 'John' })
    })

    test('throws ValidationError for invalid input', async () => {
        const someInput = { name: 123, age: 'not a number' }

        const schema = z.object({
            name: z.string(),
            age: z.number(),
        })

        try {
            await validateDataUsingZodAsync(someInput, schema)
            expect.fail('Should have thrown ValidationError')
        } catch (error: any) {
            expect(error).toBeInstanceOf(ValidationError)
            const validationError = error as ValidationError
            expect(validationError.errors.has('name')).toBe(true)
            expect(validationError.errors.has('age')).toBe(true)
        }
    })

    test('works with async refine', async () => {
        const someInput = { email: 'test@example.com' }

        const schema = z.object({
            email: z.string().refine(async (val) => {
                // Simulate async validation (e.g., checking if email exists in database)
                await new Promise(resolve => setTimeout(resolve, 10))

                return val.includes('@')
            }, { message: 'Invalid email format' }),
        })

        const validInput = await validateDataUsingZodAsync(someInput, schema)

        expect(validInput).toEqual({ email: 'test@example.com' })
    })

    test('throws ValidationError for async refine failure', async () => {
        const someInput = { email: 'invalid-email' }

        const schema = z.object({
            email: z.string().refine(async (val) => {
                await new Promise(resolve => setTimeout(resolve, 10))

                return val.includes('@')
            }, { message: 'Invalid email format' }),
        })

        try {
            await validateDataUsingZodAsync(someInput, schema)
            expect.fail('Should have thrown ValidationError')
        } catch (error: any) {
            expect(error).toBeInstanceOf(ValidationError)
            const validationError = error as ValidationError
            expect(validationError.errors.has('email')).toBe(true)
        }
    })
})

