import type Errors from '~/lib/Errors'

export default class ValidationError extends Error {
    public constructor(
        public errors: Errors,
        message = 'Validation failed',
    ) {
        const formatted = ValidationError.formatErrors(errors)

        super(message + '\n' + formatted)
    }

    /**
     * Format errors into a readable string.
     */
    public static formatErrors(errors: Errors, indent = 4): string {
        let formatted = ''

        const indentation = ' '.repeat(indent)

        for (const field in errors.all()) {
            const fieldErrors = errors.get(field)

            formatted += `${indentation}${field}:\n`

            for (const error of fieldErrors) {
                formatted += `${indentation}${indentation}${error}\n`
            }
        }

        return formatted
    }
}
