import ValidationError from '~/error/ValidationError'
import type { ValidationRulesSet } from '~/types/validation'
import Errors from '~/lib/Errors'
import { isNestedRules, isSimpleRules, normalizeValidationMessage } from '~/validation/utils'
import { getObjectProp } from '~/utils/object'
import { templateString, toHumanPhrase } from '~/helpers/string'

/**
 * @throws ValidationError
 */
export function validateDataUsingCallbacks<T>(data: unknown, validationRulesSet: ValidationRulesSet, message?: string): T {
    const errors = new Errors()

    if (typeof data !== 'object' || data === null) {
        throw new Error('Validation data must be an object')
    }

    const fields = Object.keys(data)

    let cleared = false

    for (const field of fields) {
        const calculatedErrors = getFieldValidationErrors(data, validationRulesSet, field, (data as any)[field])

        if (calculatedErrors.any()) {
            if (!cleared) {
                errors.clear()
                cleared = true
            }

            errors.add(calculatedErrors.all())
        }
    }

    if (!cleared) {
        errors.clear()
    }

    if (errors.any()) {
        throw new ValidationError(errors, message)
    }

    return data as T
}

function getFieldValidationErrors(
    data: any,
    validationRulesSet: ValidationRulesSet,
    field: string,
    value?: any,
    path: string[] = [],
    calculatedErrors = new Errors(),
): Errors {
    value ??= data[field]

    const currentRules = validationRulesSet[field]

    if (isNestedRules(currentRules)) {
        // It is nested rules
        for (const nestedField in currentRules) {
            if (!value || !(nestedField in value)) {
                continue
            }

            const errors = getFieldValidationErrors(data, currentRules, nestedField, value[nestedField], [...path, field], calculatedErrors)

            calculatedErrors.add(errors.all())
        }
    }

    if (currentRules && !isSimpleRules(currentRules)) {
        return calculatedErrors
    }

    let rules = currentRules

    if (!rules) {
        return calculatedErrors
    }

    rules = Array.isArray(rules) ? rules : [rules]

    for (const handler of rules) {
        const errors = handler(value, field, getObjectProp(data, path) ?? data)

        if (!errors) {
            continue
        }

        if (typeof errors === 'object') {
            for (const nfield in errors) {
                getFieldValidationErrors(data, errors as unknown as ValidationRulesSet, nfield, value[nfield], [...path, field], calculatedErrors)
            }

            continue
        }

        const tErrors = normalizeValidationMessage(errors, [...path, field].join('.'))

        // Apply template to errors
        for (const field in tErrors) {
            const lastField = field.split('.').pop() ?? field

            for (const i in tErrors[field]) {
                tErrors[field][i] = templateString(tErrors[field][i], {
                    field: toHumanPhrase(lastField),
                })
            }
        }

        calculatedErrors.add(tErrors)
    }

    return calculatedErrors
}
