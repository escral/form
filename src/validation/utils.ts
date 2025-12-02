import type { ValidationMessage, ValidationRule, ValidationRulesSet } from '~/types/validation'
import type { ErrorsObject } from '~/lib/Errors'

export function isNestedRules(rules: ValidationRulesSet[keyof ValidationRulesSet]): rules is { [field: string]: ValidationRulesSet } {
    return typeof rules === 'object' && !Array.isArray(rules)
}

export function isSimpleRules(rules: ValidationRulesSet[keyof ValidationRulesSet]): rules is ValidationRule | ValidationRule[] {
    return !isNestedRules(rules)
}

export function normalizeValidationMessage(errors: ValidationMessage, field: string): ErrorsObject {
    const result: ErrorsObject = {}

    if (Array.isArray(errors) || typeof errors !== 'object') {
        result[field] = typeof errors === 'string' ? [errors] : errors
    } else {
        Object.keys(errors).forEach(key => {
            if (typeof errors[key] === 'string') {
                result[key] = [errors[key] as string]
            } else {
                result[key] = errors[key] as string[]
            }
        })
    }

    return result
}
