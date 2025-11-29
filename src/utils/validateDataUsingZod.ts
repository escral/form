import type { z } from 'zod'
import { zodErrorToFormErrors } from '~/utils/zodErrorToFormErrors'
import ValidationError from '~/error/ValidationError'

/**
 * @throws ValidationError
 */
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
