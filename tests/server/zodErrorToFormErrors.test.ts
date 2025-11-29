import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { zodErrorToFormErrors } from '#server/utils/zodErrorToFormErrors'

describe('zodErrorToFormErrors', () => {
    test('records error', () => {
        const shema = z.object({
            name: z.string('some message').min(10),
        })

        const { error } = shema.safeParse({ name: 123 })

        const errors = zodErrorToFormErrors(error)

        expect(errors.first('name')).toBe('some message')
        expect(errors.get('name')).toHaveLength(1)
    })
})
