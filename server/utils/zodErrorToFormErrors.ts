import type { z } from 'zod'
import Errors, { type ErrorsObject } from '#shared/lib/Errors'

export function zodErrorToFormErrors(zodError: z.ZodError | undefined): Errors {
    const errors = new Errors()

    if (!zodError) {
        return errors
    }

    const errorsObject: ErrorsObject = {}

    for (const issue of zodError.issues) {
        const path = issue.path.join('.')

        if (!errorsObject[path]) {
            errorsObject[path] = []
        }

        errorsObject[path].push(issue.message)
    }

    errors.record(errorsObject)

    return errors
}

