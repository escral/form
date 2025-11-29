import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { validateDataUsingZod } from '#server/utils/validateDataUsingZod'
import ValidationError from '#server/error/ValidationError'

describe('validateDataUsingZod', () => {
    test('valid', () => {
        const someInput = { name: 'John' }

        const schema = z.object({
            name: z.string(),
        })

        const validInput = validateDataUsingZod(someInput, schema)

        expect(validInput).toEqual({ name: 'John' })
    })

    test('invalid', () => {
        const someInput = { name: 123 }

        const schema = z.object({
            name: z.string(),
        })

        expect(() => validateDataUsingZod(someInput, schema)).toThrow(ValidationError)
    })
})
