import type { MaybeRefOrGetter } from 'vue'
import { markRaw } from 'vue'
import Form, { type ValidationRulesSet } from '~/vue/lib/Form'
import type { AnyObject } from '~/types/utils'

export function useForm<
    TData extends AnyObject,
>(initialData: TData, validationRulesSet?: MaybeRefOrGetter<ValidationRulesSet>): Form<TData> {
    return markRaw(new Form<TData>(initialData, validationRulesSet))
}
