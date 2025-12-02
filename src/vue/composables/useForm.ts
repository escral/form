import { markRaw } from 'vue'
import Form, { type ValidationFn } from '~/vue/lib/Form'
import type { AnyObject } from '~/types/utils'

export function useForm<
    TData extends AnyObject,
    TValidatedData = unknown,
>(
    initialData: TData,
    validationFn?: ValidationFn<TValidatedData> | undefined,
): Form<TData, TValidatedData> {
    return markRaw(new Form<TData, TValidatedData>(initialData, validationFn))
}
