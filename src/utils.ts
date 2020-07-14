import { Dimensions, Platform, PixelRatio } from "react-native";

const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 350;

export function normalize(size: number) {
    const newSize = size * scale
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    }
}

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