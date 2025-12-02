import type Errors from '~/lib/Errors'
import type { ValidationRulesSet } from '~/types/validation'
import { validateDataUsingCallbacks } from '~/validation/validateDataUsingCallbacks'

export function useCallbackFormValidation<T>(validationRulesSet: ValidationRulesSet): (data: unknown, errors: Errors) => T {
    return (data: unknown) => validateDataUsingCallbacks(data, validationRulesSet)
}
