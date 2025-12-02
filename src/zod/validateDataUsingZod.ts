import type { z } from 'zod'
import { ValidationError } from '@escral/form'
import { zodErrorToFormErrors } from '~/zod/zodErrorToFormErrors'

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
