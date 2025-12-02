type ValidationMessage = string | string[] | Record<string, string | string[]>

export type ValidationRule = {
    (value: any, field: string, form: Record<string, any>): ValidationMessage | null | undefined | void
}

export type ValidationRulesSet = {
    [field: string]: ValidationRule | ValidationRule[] | ValidationRulesSet
}
