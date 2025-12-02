import type { UnparsedErrorsObject } from '~/lib/Errors'
import type { ZodMiniType } from 'zod'
import {
    array,
    lazy,
    record,
    string,
    union,
} from 'zod/mini'

const unparsedErrorsObjectSchema: ZodMiniType<UnparsedErrorsObject> = lazy(() =>
    record(string(), union([
        string(),
        array(string()),
        unparsedErrorsObjectSchema,
        array(unparsedErrorsObjectSchema),
    ])),
)

export function isRecordableErrorsObject(rawErrors: unknown): rawErrors is UnparsedErrorsObject {
    const parseResult = unparsedErrorsObjectSchema.safeParse(rawErrors)

    return parseResult.success
}
