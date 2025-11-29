import type { AnyObject, PropsPathSimple, PropType } from '#shared/types/utils'
import FormField from '#client/lib/FormField'
import type Form from '#client/lib/Form'
import { getProp } from '#shared/utils/object'

type FormFieldsView<TData extends AnyObject, TPath extends PropsPathSimple<TData>> =
    PropType<TData, TPath> extends Array<any>
        ? FormField<PropType<TData, TPath>[0]>[]
        : PropType<TData, TPath> extends Record<string, unknown>
            ? { [K in keyof PropType<TData, TPath>]: FormField<PropType<TData, TPath>[K]> }
            : FormField<PropType<TData, TPath>>

export function useFormFields<
    TForm extends Form,
    TPath extends PropsPathSimple<TForm['data']> = '',
>(
    form: TForm,
    path?: TPath,
): FormFieldsView<TForm['data'], TPath> {
    const result: any = {}

    const normalizedPath = path ? path.split('.') : []

    const data: unknown = getProp(form.data, normalizedPath)

    if (Array.isArray(data)) {
        return data.map((_, index) => {
            // @ts-ignore
            return useFormFields(form, [...normalizedPath, String(index)].join('.'))
        }) as any
    }

    if (!data || typeof data !== 'object') {
        throw new Error('Can not create form helper for non-object data')
    }

    Object.keys(data).forEach((key) => {
        result[key] = new FormField(form, [...normalizedPath, key].join('.'))
    })

    return result
}
