import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { zodErrorToFormErrors } from '~/zod'

describe('zodErrorToFormErrors', () => {
    test('returns empty Errors when zodError is undefined', () => {
        const errors = zodErrorToFormErrors(undefined)

        expect(errors.any()).toBe(false)
    })

    test('records multiple errors for same field', () => {
        const schema = z.object({
            email: z.email('Invalid email').min(5, 'Email too short'),
        })

        const { error } = schema.safeParse({ email: 'ab' })

        const errors = zodErrorToFormErrors(error)

        // Zod will return multiple issues for the same field
        expect(errors.get('email')).toHaveLength(2)
    })

    test('records errors for multiple fields', () => {
        const schema = z.object({
            name: z.string().min(3, 'Name too short'),
            age: z.number().min(18, 'Must be 18 or older'),
        })

        const { error } = schema.safeParse({ name: 'ab', age: 15 })

        const errors = zodErrorToFormErrors(error)

        expect(errors.has('name')).toBe(true)
        expect(errors.has('age')).toBe(true)
    })

    test('records errors for nested paths', () => {
        const schema = z.object({
            user: z.object({
                name: z.string().min(3, 'Name too short'),
            }),
        })

        const { error } = schema.safeParse({ user: { name: 'ab' } })

        const errors = zodErrorToFormErrors(error)

        expect(errors.has('user.name')).toBe(true)
    })

    test('records errors for array paths', () => {
        const schema = z.object({
            users: z.array(z.object({
                name: z.string().min(3, 'Name too short'),
            })),
        })

        const { error } = schema.safeParse({
            users: [
                { name: 'ab' },
            ],
        })

        const errors = zodErrorToFormErrors(error)

        expect(errors.has('users.0.name')).toBe(true)
    })
})
