export function camelToName(text: string): string {
    return text
        // insert a space before all caps
        .replace(/([A-Z])/g, ' $1')
        // uppercase the first character
        .replace(/^./, function (str) { return str.toUpperCase(); })
}

export function snakeToName(text: string): string {
    return text.toLowerCase()
        // insert a space for every underscore
        .replace(/([_])/g, ' ')
        // uppercase the first character
        .replace(/^./, function (str) { return str.toUpperCase(); })
}

export function dottedToName(text: string): string {
    return text.toLowerCase()
        // insert a space for every underscore
        .replace(/([.])/g, ' ')
        // uppercase the first character
        .replace(/^./, function (str) { return str.toUpperCase(); })
}

export function bleToIoTCName(text: string): string {
    return text.replace(/[-]/g, '').replace(/^./, function (str) { return `ble${str}`; });
}