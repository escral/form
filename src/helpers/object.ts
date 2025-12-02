import type { AnyObject } from '~/types/utils'

export const updateProps = (oldProps: AnyObject, newProps: AnyObject): void => {
    for (const prop of Object.keys(newProps)) {
        oldProps[prop] = newProps[prop]
    }
}

export function getProp<T extends Array<any> | AnyObject>(item: T, path: string | string[]): unknown {
    const normalizedPath = Array.isArray(path) ? path : path.split('.')

    let result = item

    for (const key of normalizedPath) {
        if (result === undefined || result === null) {
            return
        }

        // @ts-ignore
        result = result[key]
    }

    return result
}

export function setProp<T extends AnyObject>(item: T, path: string | string[], value: any): void {
    const normalizedPath = Array.isArray(path) ? path : path.split('.')

    if (normalizedPath.length === 0) {
        return
    }

    const key = normalizedPath[0]

    if (normalizedPath.length === 1) {
        // @ts-ignore
        item[key] = value
    } else {
        if (typeof item[key] !== 'object') {
            // @ts-ignore
            item[key] = {}
        }

        setProp(item[key], normalizedPath.slice(1), value)
    }
}

export function isEqual<T extends AnyObject>(a: T, b: T): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
}
