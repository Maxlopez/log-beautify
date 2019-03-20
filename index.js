'use strict';

const ch = require('chalk');
const Color = require('color-regex');

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
        this._localLevels = {};//key=callerFile, value=level
        this._namespaceLevels = {};//key=namespace, value=level
        this._namespaces = {};//key=callerFile, value=namespace
        this._globalLevel = 1;//global level

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

    setLevel(level, namespace = 'global') {
        const newLevel = this._parseLevel(level) !== null ? this._parseLevel(level) : this._globalLevel;
        if (namespace === 'global' ){
            this._globalLevel = newLevel;
        } else {
            this.setNamespaceLevel(newLevel, namespace);
        } 
    }

    setLocalLevel(level) {
        const newLevel = this._parseLevel(level);
        if (newLevel !== null) {
            if (this._callerFileTobase64()) {
                this._localLevels[this._callerFileTobase64()] = newLevel;
            }
        }
    }

    setNamespaceLevel(level, namespace = null ) {
        const newLevel = this._parseLevel(level);
        if (newLevel !== null && namespace !== null) {
            this._namespaceLevels[namespace] = newLevel;
            this.useNamespace(namespace);
        }
    }

    useNamespace(namespace = null) {
        if (namespace !== null) {
            this._namespaces[this._callerFileTobase64()] = namespace;
        }
    }

    namespace(namespace = null) {
        this.useNamespace(namespace);
    }

    getWorkingLevel() {
        const localKey = this._callerFileTobase64();
        //Check local level
        if (localKey && this._localLevels[localKey] !== undefined ) {
            return this._localLevels[localKey];
        }
        //Check namespace level
        const namespace = this._namespaces[localKey];
        if (namespace !== undefined && this._namespaceLevels[namespace] !== undefined ) {
            return this._namespaceLevels[namespace];
        }
        //Global level
        return this._globalLevel;
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
        const workingLevel = this.getWorkingLevel();
        return workingLevel > this._levels.silent && level >= workingLevel;
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

    _callerFileTobase64() {
        const traceInfo = StackTracer.getInfo();
        if (traceInfo.callerFile) {
            return toBase64(traceInfo.callerFile);
        }
        return null;
    }


}

/**
|--------------------------------------------------
| Helpers
|--------------------------------------------------
*/

const isObject = (obj) => {
    return !!obj && obj.constructor === Object;
}

//chalk not allow print javascript objects
const parseArgs = (args) => {
    return args.map((_arg) => {
        return isObject(_arg) ? JSON.stringify(_arg) : _arg;
    });
}

const toBase64 = (string) => {
    return typeof btoa === "function" ?  btoa(string) : Buffer.from(string).toString('base64');
}




/**
|--------------------------------------------------
| Stack Tracer
|--------------------------------------------------
*/

class StackTracer {
    static isNode() {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    }
    static isBrowser() {
        return typeof window !== 'undefined' && typeof window.document !== 'undefined';
    }

    //https://stackoverflow.com/questions/13227489/how-can-one-get-the-file-path-of-the-caller-function-in-node-js
    static getInfo() {
        // Save original Error.prepareStackTrace
        let origPrepareStackTrace = Error.prepareStackTrace;
        let currentFile, callerFile = null, lineNumber = null, functionName = null;
        try {
            //Override with function that just returns 'stack'
            Error.prepareStackTrace = function (err, stack) {
                return stack;
            };

            //Create a new 'Error', which automatically gets 'stack'
            let err = new Error();

            //Evaluate 'err.stack', which calls our new 'Error.prepareStackTrace'
            var stack = err.stack;

            if (StackTracer.isNode()) {
                currentFile = stack.shift().getFileName();
                for (let key in stack) {
                    if (!stack.hasOwnProperty(key)) continue;
                    callerFile = stack[key].getFileName();
                    if (currentFile !== callerFile) {
                        lineNumber = stack[key].getLineNumber();
                        functionName = stack[key].getFunctionName();
                        break;
                    };
                }
            } else if (StackTracer.isBrowser()) {
                //Tested on React js
                for (let key in stack) {
                    if (!stack.hasOwnProperty(key)) continue;
                    const value = stack[key].toString();
                    if (value.indexOf('Module') !== -1) {
                        if (typeof stack[key].getFunctionName === 'function') {
                            callerFile = functionName = stack[key].getFunctionName();
                        } else {
                            callerFile = functionName = value.split(' ')[0];
                        }
                        lineNumber = stack[key].getLineNumber();
                        break;
                    }
                }
            }
        } catch (e) {
            //console.log('ERROR', e.message)
        }

        //Restore original 'Error.prepareStackTrace'
        Error.prepareStackTrace = origPrepareStackTrace;

        return {
            callerFile,
            lineNumber,
            functionName,
        };
    }

}



module.exports = new LogBeautify();