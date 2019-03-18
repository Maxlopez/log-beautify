'use strict';

const ch = require('chalk');
const Color = require('./color');

//Default text color for bgColors
const defaultTextColor = 'black';
const defaultSymbols = {
    success: '√',
    ok: '√',
    info: 'i',
    warning: '‼',
    error: '×'
}

class LogBeautify {
    constructor(options) {
        this.useSymbols = true;
        this.defaultSymbol = '!';
        this.colors = {
            success: '#26FF5C',
            success_: '#26FF5C',
            ok: '#26FF5C',
            ok_: '#26FF5C',
            info: '#3C9DFF',
            info_: '#3C9DFF',
            warning: '#FFC926',
            warning_: '#FFC926',
            error: '#F55256',
            error_: '#F55256',
        }
        this.textColors = {
            success_: 'black',
            ok_: 'black',
            info_: 'black',
            warning_: 'black',
            error_: 'white',
        }
        this.symbols = this._useUnicodeSymbols() ? {
            success: '✔',
            ok: '✔',
            info: 'ℹ',
            warning: '⚠',
            error: '✖'
        } : defaultSymbols;

        this._createLogs();
    }

    setColors(colors) {
        this.colors = Object.assign({}, this.colors, colors);
        this._createLogs();
    }

    setTextColors(textColors) {
        this.textColors = Object.assign({}, this.textColors, textColors);
    }

    setSymbols(symbols) {
        this.symbols = Object.assign({}, this.symbols, symbols);
    }

    _useUnicodeSymbols() {
        const env = process.env;
        return process.platform !== 'win32' || env.CI || env.TERM || env.TERM_PROGRAM;
    }

    _createLogs() {
        Object.keys(this.colors).map((key) => {
            if (key.lastIndexOf('_') === key.length - 1) {
                this._createBgLog(key);
            } else {
                this._createTextLog(key);
            }
        });
    }

    _getSymbol(key) {
        return this.symbols[key] || this.symbols[key.substring(0, key.length - 1)] || this.defaultSymbol;
    }

    _createTextLog(key) {
        if (!LogBeautify.prototype[key]) {
            LogBeautify.prototype[key] = function (...args) {
                args = parseArgs(args);
                if (this.useSymbols ){
                    args.unshift(' ' + this._getSymbol(key));
                }
                console.log(this._textColor(this.colors[key])(...args));
            }
        }
    }

    _createBgLog(key) {
        if (!LogBeautify.prototype[key]) {
            LogBeautify.prototype[key] = function (...args) {
                args = parseArgs(args);
                if (this.useSymbols) {
                    args.unshift(' ' + this._getSymbol(key));
                }
                const text = this._textColor(this.textColors[key] || defaultTextColor);
                const bg = this._bgColor(this.colors[key]);
                console.log(bg(text(...args)));
            }
        }
    }

    _chBase(_color) {
        //return ch.bold.underline;//bold resets the color
        return ch;
    }

    _textColor(_color) {
        const format = Color.getFormat(_color);
        switch (format) {
            case 'hex':
                return this._chBase().hex(_color);
            case 'rgb':
                return this._chBase().rgb(...Color.toArray(_color, true));
            case 'hsl':
                return this._chBase().hsl(...Color.toArray(_color, true));
            case 'hsv':
                return this._chBase().hsv(...Color.toArray(_color, true));
            case 'hwb':
                return this._chBase().hwb(...Color.toArray(_color, true));
            default:
                return this._chBase().keyword(_color);
        }
    }

    _bgColor(_color) {
        const format = Color.getFormat(_color);
        switch (format) {
            case 'hex':
                return ch.bgHex(_color);
            case 'rgb':
                return ch.bgRgb(...Color.toArray(_color, true));
            case 'hsl':
                return ch.bgHsl(...Color.toArray(_color, true));
            case 'hsv':
                return ch.bgHsv(...Color.toArray(_color, true));
            case 'hwb':
                return ch.bgHwb(...Color.toArray(_color, true));
            default:
                return ch.bgKeyword(_color);
        }
    }
}


const isObject = (obj) => {
    return !!obj && obj.constructor === Object;
}

//chalk not allow print javascript objects
const parseArgs = (args) => {
    return args.map((_arg) => {
        return isObject(_arg) ? JSON.stringify(_arg) : _arg;
    });
}


module.exports = new LogBeautify();