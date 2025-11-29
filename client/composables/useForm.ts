import type { MaybeRefOrGetter } from 'vue'
import { markRaw } from 'vue'
import Form, { type ValidationRulesSet } from '#client/lib/Form'
import type { AnyObject } from '#shared/types/utils'

export function useForm<
    TData extends AnyObject,
>(initialData: TData, validationRulesSet?: MaybeRefOrGetter<ValidationRulesSet>) {
    return markRaw(new Form<TData>(initialData, validationRulesSet))
}
