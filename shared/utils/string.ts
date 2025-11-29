export const toHumanPhrase = (str: string): string => {
    if (str.endsWith('_pk')) {
        str = str.replace(/_pk$/, '')
    }

    if (!str.match(/[\s_-]/)) {
        const words = str.replace(/([^A-Z])([A-Z])/g, '$1 $2').trim().split(' ')

        return capitalize(words.map(word => {
            if (word.match(/^[A-Z]+$/)) {
                return word
            }

            if (word.includes('idnp')) {
                return word.toUpperCase()
            }

            return word.toLowerCase()
        }).join(' '))
    }

    str = str.replaceAll(/[-_]/g, ' ')

    if (str.length === 0) {
        return ''
    }

    return capitalize(str)
}

export function capitalize(str: string): string {
    const trimmed = str.trim()

    if (trimmed.length === 0) {
        return ''
    }

    return trimmed[0].toUpperCase() + trimmed.substring(1)
}

export function templateString(template: string, replacements: { [key: string]: string } | undefined = undefined): string {
    if (!replacements) {
        return template
    }

    let result = template

    for (const field in replacements) {
        const value = replacements[field]

        result = result.replaceAll(`{${field}}`, value)

        // if (result.includes(`{${field}|capitalized}`)) {
        //     value = capitalize(field)
        //
        //     result = result.replaceAll(`{${field}|capitalized}`, value)
        // }
    }

    return result
}
