import type { z } from 'zod'
import { ValidationError } from '@escral/form'
import { zodErrorToFormErrors } from '~/zod/zodErrorToFormErrors'

/**
 * Async version of validateDataUsingZod.
 * Uses Zod's safeParseAsync for async validation (e.g., with refine, superRefine, or custom async validators).
 *
 * @throws ValidationError
 */
export async function validateDataUsingZodAsync<T>(data: unknown, schema: z.ZodTypeAny<T>, message?: string): Promise<T> {
    const {
        success,
        error,
        data: parsedData,
    } = await schema.safeParseAsync(data)

    if (success) {
        return parsedData
    }

    const errors = zodErrorToFormErrors(error)

    throw new ValidationError(errors, message)
}

