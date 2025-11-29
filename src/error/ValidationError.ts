import type Errors from '~/lib/Errors'

export default class ValidationError extends Error {
    public constructor(
        public errors: Errors,
        message = 'Validation failed',
    ) {
        const formatted = formatErrors(errors)

        super(message + '\n' + formatted)
    }

    public formatErrors(errors: Errors): string {
        return formatErrors(errors)
    }
}

/**
 * Format errors into a readable string.
 */
function formatErrors(errors: Errors, indent = 4): string {
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
