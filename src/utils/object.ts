export function getObjectProp(object: unknown, path: string): unknown {
    const parts = path.split('.')

    let current: unknown = object

    for (const part of parts) {
        if (typeof current !== 'object' || current === null) {
            return undefined
        }

        current = (current as Record<string, unknown>)[part]
    }

    return current
}
