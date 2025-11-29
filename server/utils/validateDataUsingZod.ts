import type { z } from 'zod'
import { zodErrorToFormErrors } from '#server/utils/zodErrorToFormErrors'
import ValidationError from '#server/error/ValidationError'

export function validateDataUsingZod<T>(data: unknown, schema: z.ZodTypeAny<T>, message?: string): T {
    const {
        success,
        error,
        data: parsedData,
    } = schema.safeParse(data)

    if (success) {
        return parsedData
    }

    const errors = zodErrorToFormErrors(error)

    throw new ValidationError(errors, message)
}
