import type Errors from '~/lib/Errors'
import type { ErrorsObject } from '~/lib/Errors'

export default class ValidationError extends Error {
    public constructor(
        public errors: Errors,
        message = 'Validation failed',
    ) {
        const formatted = ValidationError.formatErrors(errors.all())

        super(message + '\n' + formatted)
    }

    /**
     * Format errors into a readable string.
     */
    public static formatErrors(errors: ErrorsObject, indent = 4): string {
        let formatted = ''

        const indentation = ' '.repeat(indent)

        for (const field in errors) {
            const fieldErrors = errors[field]

            formatted += `${indentation}${field}:\n`

            for (const error of fieldErrors) {
                formatted += `${indentation}${indentation}${error}\n`
            }
        }

        return formatted
    }
}
