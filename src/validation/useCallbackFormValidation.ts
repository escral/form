import type Errors from '~/lib/Errors'
import type { ValidationRulesSet } from '~/types/validation'

export function useCallbackFormValidation<T>(validationRulesSet: ValidationRulesSet): (data: unknown, errors: Errors) => T {
    return (data: unknown) => {
        // @todo

        return data as T
    }
}
