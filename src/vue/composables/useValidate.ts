import type { ValidationRule } from '~/vue/lib/Form'
import Errors, { type ErrorsObject, type UnparsedErrorsObject } from '~/lib/Errors'
import { templateString, toHumanPhrase } from '~/helpers/string'

export function useValidate(value: any, validationRule: ValidationRule | ValidationRule[]): ErrorsObject {
    const validationHandlers: ValidationRule[] = []

    if (validationRule) {
        validationHandlers.push(...(Array.isArray(validationRule) ? validationRule : [validationRule]))
    }

    const fieldName = 'field'

    const calculatedErrors = new Errors()

    for (const handler of validationHandlers) {
        let errors = handler(value, fieldName, { [fieldName]: value })

        if (!errors) {
            continue
        }

        if (Array.isArray(errors) || typeof errors !== 'object') {
            errors = {
                [fieldName]: typeof errors === 'string' ? [errors] : errors,
            }
        } else {
            Object.keys(errors).forEach(key => {
                // @ts-ignore
                if (typeof errors[key] === 'string') {
                    // @ts-ignore
                    errors[key] = [errors[key]]
                }
            })
        }

        const tErrors = errors as ErrorsObject

        // Apply template to errors
        for (const field in tErrors) {
            for (const i in tErrors[field]) {
                tErrors[field][i] = templateString(tErrors[field][i], {
                    field: toHumanPhrase(field),
                })
            }
        }

        calculatedErrors.add(errors as UnparsedErrorsObject)
    }

    return calculatedErrors.all()
}
