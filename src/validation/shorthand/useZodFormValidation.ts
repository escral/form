import type { z } from 'zod'
import type Errors from '~/lib/Errors'
import { validateDataUsingZod } from '~/utils/validateDataUsingZod'

export function useZodFormValidation<T>(schema: z.ZodTypeAny<T>): (data: unknown, errors: Errors) => T {
    return (data: unknown) => {
        return validateDataUsingZod<T>(data, schema)
    }
}
