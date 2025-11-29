import type { z } from 'zod'
import Errors from '#shared/lib/Errors'

export function zodErrorToFormErrors(zodError: z.ZodError | undefined): Errors {
    const errors = new Errors()

    if (!zodError) {
        return errors
    }

    for (const issue of zodError.issues) {
        const path = issue.path.join('.')

        if (!errors.has(path)) {
            errors.record({
                [path]: [issue.message],
            })
        }
    }

    return errors
}

