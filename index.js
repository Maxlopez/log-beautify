'use strict';

const ch = require('chalk');
const Color = require('./color');

//Default text color for bgColors
const defaultTextColor = 'black';
const defaultSymbols = {
    trace: '??',
    success: '√',
    ok: '√',
    debug: 'i',
    info: 'i',
    warning: '‼',
    warn: '‼',
    error: '×'
}

class LogBeautify {
    constructor(options) {
        this.useSymbols = true;
        this.defaultSymbol = '!';
        this.defaultLevel = 1;//default level for new log methods
        this._level = 1;//current level

        this._levels = {
            silent: -1,//hide all logs
            trace: 0,
            success: 1,
            ok: 1,
            debug: 2,
            info: 3,
            warning: 4,
            warn: 4,
            error: 5,
        }

        this._colors = {
            trace: '#3C9DFF',
            trace_: '#3C9DFF',
            success: '#26FF5C',
            success_: '#26FF5C',
            ok: '#26FF5C',
            ok_: '#26FF5C',
            debug: '#34DADA',
            debug_: '#34DADA',
            info: '#3C9DFF',
            info_: '#3C9DFF',
            warning: '#FFC926',
            warning_: '#FFC926',
            warn: '#FFC926',
            warn_: '#FFC926',
            error: '#F55256',
            error_: '#F55256',
        }

        //Text colors for bg logs
        this._textColors = {
            trace_: 'black',
            success_: 'black',
            ok_: 'black',
            debug_: 'black',
            info_: 'black',
            warning_: 'black',
            warn_: 'black',
            error_: 'white',
        }

        this._symbols = this._useUnicodeSymbols() ? {
            trace: '⁇',
            success: '✔',
            ok: '✔',
            debug: 'ℹ',
            info: '🛈',
            warning: '⚠',
            warn: '⚠',
            error: '✖'
        } : defaultSymbols;

        //Create initial logs
        this._createLogs();
    }

    setLevel(level) {
        this._level = this._parseLevel(level) !== null ? this._parseLevel(level) : this._level;
    }

    setLevels(levels) {
        Object.keys(levels).map((key) => {
            const level = this._parseLevel(levels[key]);
            if ( level !== null ){
                this._levels[key] = level;
            }
        });
    }

    setColors(colors) {
        this._colors = {...this._colors, ...colors};
        this._createLogs();
    }

    setTextColors(textColors) {
        this._textColors = {...this._textColors, ...textColors};
    }

    setSymbols(symbols) {
        this._symbols = {...this._symbols, ...symbols};
    }

    _useUnicodeSymbols() {
        const env = process.env;
        return process.platform !== 'win32' || env.CI || env.TERM || env.TERM_PROGRAM;
    }

    _createLogs() {
        Object.keys(this._colors).map((key) => {
            if (key.lastIndexOf('_') === key.length - 1) {
                this._createBgLog(key);
            } else {
                this._createTextLog(key);
            }
        });
    }

    _getSymbol(key) {
        return this._symbols[key] || this._symbols[this._getKeyName(key)] || this.defaultSymbol;
    }

    _createTextLog(key) {
        if (!LogBeautify.prototype[key]) {
            LogBeautify.prototype[key] = function (...args) {
                args = parseArgs(args);
                if (this.useSymbols ){
                    args.unshift(' ' + this._getSymbol(key));
                }
                this._log(key, this._textColor(this._colors[key])(...args));
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
                const text = this._textColor(this._textColors[key] || defaultTextColor);
                const bg = this._bgColor(this._colors[key]);
                this._log(key, bg(text(...args)));
            }
        }
    }

    _log(key, arg){
        const level = this._getKeyLevel(key);
        if (this._shouldLog(level)){
            if (this._getKeyName(key) === 'trace' ){
                console.trace(arg);
            } else {
                console.log(arg);
            }
        } 
    }

    _shouldLog(level){
        return this._level > this._levels.silent && level >= this._level;
    }

    _getKeyLevel(key){
        const _key = this._getKeyName(key);
        //allow level 0
        return this._levels[_key] !== undefined ? this._levels[_key] : this.defaultLevel;
    }

    _getKeyName(key) {
        return key.lastIndexOf('_') === key.length - 1 ? key.substring(0, key.length - 1) : key;
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

    _parseLevel(level) {
        if (!isNaN(parseInt(level)) && level >= this._levels.silent) {
            return parseInt(level);
        } else if (typeof level === "string" && this._levels[level.toLowerCase()] !== undefined) {
            return this._levels[level.toLowerCase()];
        }
        return null;
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