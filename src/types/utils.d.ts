export type AnyObject = Record<string, any>

export type PropsPathSimple<TObject extends AnyObject> = Extract<keyof TObject, string> | string

export type PropType<T, Path extends string> =
    Path extends ''
        ? T
        : Path extends `${infer Key}.${infer Rest}`
            ? T extends Array<unknown>
                ? PropType<T[Key], Rest>
                : Key extends keyof T
                    ? PropType<T[Key], Rest>
                    : never
            : T[Path]
