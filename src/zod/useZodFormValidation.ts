import type { z } from 'zod'
import { validateDataUsingZod } from '~/zod/validateDataUsingZod'
import type { ValidationFn } from '~/vue/lib/Form'

export function useZodFormValidation<T>(schema: z.ZodTypeAny<T>): ValidationFn<T> {
    return (data: unknown) => validateDataUsingZod<T>(data, schema)
}
