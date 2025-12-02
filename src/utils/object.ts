export function getObjectProp(object: unknown, path: string | string[]): unknown {
    const parts = Array.isArray(path) ? path : path.split('.')

    let current: unknown = object

    for (const part of parts) {
        if (typeof current !== 'object' || current === null) {
            return undefined
        }

        current = (current as Record<string, unknown>)[part]
    }

    return current
}
