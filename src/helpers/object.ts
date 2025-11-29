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

export function makeDestructurableClass<
    T extends AnyObject,
    G extends {
        // eslint-disable-next-line space-before-function-paren
        [K in keyof T]?: (target: T) => T[K]
    },
>(classInstance: T, additionalGetters?: G): T {
    return new Proxy(classInstance, {
        get(target, prop) {
            if (additionalGetters && (prop in additionalGetters)) {
                return additionalGetters[prop as string]?.(target)
            }

            const value = Reflect.get(target, prop) as any

            if (typeof value === 'function') {
                return value.bind(classInstance)
            }

            return value

            // if (isRef(value) || isReactive(value)) {
            //     return value
            // }
            //
            // useLogger('object-helper').error(`Property "${String(prop)}" is not a ref or reactive. Destructing it will lose reactivity.`, 'Class:', target)
            //
            // throw new Error(`Property "${String(prop)}" is not a ref or reactive. Destructing it will lose reactivity.`)
        },
    })
}
