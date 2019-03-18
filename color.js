'use strict';

class Color {
    static get regex() {
        return {
            hex: /^#[a-f0-9]{3}([a-f0-9]{3})?$/i,
            rgb: /^rgb?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
            rgba: /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(\d+|\d*\.\d+)\s*\)$/,
            hsl: /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/,
            hsla: /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(\d+|\d*\.\d+)\s*\)$/,
            hsv: /^hsv\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/,
            hwb: /^hwb\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/,
        }
    }
    static isHex(_color) {
        return Color.regex.hex.test(_color);
    }
    static isRgb(_color) {
        return Color.regex.rgb.test(_color);
    }
    static isRgba(_color) {
        return Color.regex.rgba.test(_color);
    }
    static isHsl(_color) {
        return Color.regex.hsl.test(_color);
    }
    static isHsla(_color) {
        return Color.regex.hsla.test(_color);
    }
    static isHsv(_color) {
        return Color.regex.hsv.test(_color);
    }
    static isHwb(_color) {
        return Color.regex.hwb.test(_color);
    }
    static isKeyword(_color) {
        return Color.getFormat(_color) === 'keyword';
    }
    static getFormat(_color) {
        for (const format in Color.regex) {
            if (Color.regex.hasOwnProperty(format)) {
                if (Color.regex[format].test(_color)) {
                    return format;
                }
            }
        }
        return 'keyword';
    }

    //Remove format, spaces and %
    static clear(_color, removePercentage) {
        removePercentage = removePercentage !== undefined ? !!removePercentage : false;
        let newColor = Color.removeFormat(_color);
        if (newColor && removePercentage) {
            newColor = newColor.replace(/%/g, '');
        }
        return newColor;
    }

    //Remove format
    static removeFormat(_color) {
        return !!_color && _color.replace(/(hex|rgba?|hsla?|hwb|hsv|\(+|\)+|\s)/g, '');
    }

    static toArray(_color, removePercentage) {
        removePercentage = removePercentage !== undefined ? !!removePercentage : false;
        const colorString = Color.clear(_color, removePercentage);
        if (!colorString) return [_color];
        return colorString.split(',');
    }

}

module.exports = Color;