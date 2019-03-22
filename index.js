'use strict';

const ch = require('chalk');
const Color = require('color-regex');



//Default text color for bgColors
const defaultBgTextColor = 'black';

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

const terminalColors = {
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
const browserColors = {
    trace: '#3C9DFF',
    trace_: '#3C9DFF',
    success: '#008000',
    success_: '#5AFB78',
    ok: '#008000',
    ok_: '#5AFB78',
    debug: '#07AABC',
    debug_: '#80FCFF',
    info: '#0151B1',
    info_: '#80C6FF',
    warning: '#BB8404',
    warning_: '#FFD280',
    warn: '#BB8404',
    warn_: '#FFD280',
    error: '#E60000',
    error_: '#F55256',
}

const LOG_TEXT = 'TEXT';
const LOG_BG = 'BG';


class LogBeautify {
    constructor() {
        this.useSymbols = true;
        this.defaultSymbol = '!';
        this.defaultLevel = 1;//default level for new log methods
        this._localLevels = {};//key=callerFile, value=level
        this._namespaceLevels = {};//key=namespace, value=level
        this._namespaces = {};//key=callerFile, value=namespace
        this._globalLevel = 1;//global level
        this._stackTracer = new StackTracer();

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

        this._colors = this._isBrowser() ? browserColors : terminalColors;

        //Text colors for bg logs
        this._bgTextColors = {
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

    /**
    |--------------------------------------------------
    | Public methods
    |--------------------------------------------------
    */
    setLevel(level, namespace = 'global') {
        const newLevel = this._parseLevel(level) !== null ? this._parseLevel(level) : this._globalLevel;
        if (namespace === 'global') {
            this._globalLevel = newLevel;
        } else {
            this.setNamespaceLevel(newLevel, namespace);
        }
    }

    setLocalLevel(level) {
        const newLevel = this._parseLevel(level);
        if (newLevel !== null && this._callerFile()) {
            this._localLevels[this._callerFile()] = newLevel;
        }
    }

    setNamespaceLevel(level, namespace = null) {
        const newLevel = this._parseLevel(level);
        if (newLevel !== null && namespace !== null) {
            this._namespaceLevels[namespace] = newLevel;
            this.useNamespace(namespace);
        }
    }

    useNamespace(namespace = null) {
        if (namespace !== null && this._callerFile()) {
            this._namespaces[this._callerFile()] = namespace;
        }
    }

    namespace(namespace = null) {
        this.useNamespace(namespace);
    }

    getWorkingLevel() {
        const filepath = this._callerFile();
        //Check local level
        if (filepath && this._localLevels[filepath] !== undefined) {
            return this._localLevels[filepath];
        }
        //Check namespace level
        const namespace = this._namespaces[filepath];
        if (namespace !== undefined && this._namespaceLevels[namespace] !== undefined) {
            return this._namespaceLevels[namespace];
        }
        //Global level
        return this._globalLevel;
    }

    setLevels(levels) {
        Object.keys(levels).map((key) => {
            const level = this._parseLevel(levels[key]);
            if (level !== null) {
                this._levels[key] = level;
            }
        });
    }

    setColors(colors) {
        this._colors = { ...this._colors, ...colors };
        this._createLogs();
    }

    setTextColors(bgTextColors) {
        this._bgTextColors = { ...this._bgTextColors, ...bgTextColors };
    }

    setSymbols(symbols) {
        this._symbols = { ...this._symbols, ...symbols };
    }


    /**
    |--------------------------------------------------
    | Private methods
    |--------------------------------------------------
    */
    _useUnicodeSymbols() {
        const env = process.env;
        return this._isBrowser() || process.platform !== 'win32' || env.CI || env.TERM || env.TERM_PROGRAM;
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
                this._log(LOG_TEXT, key, args);
            }
        }
    }

    _createBgLog(key) {
        if (!LogBeautify.prototype[key]) {
            LogBeautify.prototype[key] = function (...args) {
                this._log(LOG_BG, key, args);
            }
        }
    }

    _log(type, key, args) {
        const level = this._getKeyLevel(key);
        if (this._shouldLog(level)) {
            if (this._getKeyName(key) === 'trace') {
                console.trace(...args);
            } else {
                args = this._parseArgs(args);
                if (this.useSymbols) {
                    args.unshift(' ' + this._getSymbol(key));
                }
                if (this._isBrowser()) {
                    this._logBrowser(type, key, args);
                } else {
                    this._logTerminal(type, key, args);
                }
            }
        }
    }

    _logBrowser(type, key, args) {
        if (!isArray(args)) {
            console.log(args);
            return;
        }
        if (type === LOG_TEXT) {
            console.log(this._formatLogBrowser(args), this._getCSS(type, key), ...args);
        }
        if (type === LOG_BG) {
            console.log(this._formatLogBrowser(args), this._getCSS(type, key), ...args);
        }
    }

    _logTerminal(type, key, args) {
        if (type === LOG_TEXT) {
            console.log(this._chTextColor(this._colors[key])(...this._fixArgs(args)));
        }
        if (type === LOG_BG) {
            const text = this._chTextColor(this._bgTextColors[key] || defaultBgTextColor);
            const bg = this._chBgColor(this._colors[key]);
            console.log(bg(text(...this._fixArgs(args))));
        }
    }

    _fixArgs(args) {
        let newArgs = [];
        args.map(arg => {
            if (isArray(arg)) {
                newArgs.push('[');
                newArgs.push(arg);
                newArgs.push(']');
            } else {
                newArgs.push(arg);
            }
        });
        return newArgs;
    }

    _formatLogBrowser(args) {
        let formater = '%c';
        args.map(arg => {
            if (typeof arg === 'string') {
                formater += '%s ';
            } else if (typeof arg === 'number') {
                formater += '%d ';
            } else if (typeof arg === 'object') {
                formater += '%o';//no add spaces for objects and arrays
            } else {
                formater += '%s ';
            }
        });
        return formater.trim();
    }

    _getCSS(type, key) {
        let css = '', color, bgColor;
        if (type === LOG_TEXT) {
            color = this._colors[key];
            css += 'color: ' + color;
        }
        if (type === LOG_BG) {
            color = this._bgTextColors[key] || defaultBgTextColor;
            bgColor = this._colors[key];
            css += 'color: ' + color;
            css += '; background-color: ' + bgColor;
        }
        return css;
    }

    _shouldLog(level) {
        const workingLevel = this.getWorkingLevel();
        return workingLevel > this._levels.silent && level >= workingLevel;
    }

    _getKeyLevel(key) {
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

    _chTextColor(_color) {
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

    _chBgColor(_color) {
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

    _callerFile() {
        const traceInfo = this._stackTracer.getInfo();
        if (traceInfo.callerFile) {
            //return toBase64(traceInfo.callerFile);
            return traceInfo.callerFile;
        }
        return null;
    }

    _isBrowser() {
        return typeof window !== 'undefined' && typeof window.document !== 'undefined';
    }

    //Chalk not allow print javascript objects
    _parseArgs(args) {
        return args.map((_arg) => {
            if (this._isBrowser()){
                return _arg;
            } else {
                if (isObject(_arg) ){
                    return JSON.stringify(_arg, null, 3);
                } else if (isArray(_arg)){
                    return this._parseArgs(_arg);
                }
                return _arg;
            }
        });
    }


}


/**
|--------------------------------------------------
| Helpers
|--------------------------------------------------
*/
const isArray = (obj) => {
    return !!obj && obj.constructor === Array;
}

const isObject = (obj) => {
    return !!obj && obj.constructor === Object;
}

const toBase64 = (string) => {
    return typeof btoa === "function" ? btoa(string) : Buffer.from(string).toString('base64');
}



/**
|--------------------------------------------------
| Stack Tracer
|--------------------------------------------------
*/

class StackTracer {
    constructor() {
        this.traces = {
            webpack: [
                //React or Vue: Outside of Class component or Function component
                '__webpack_require__',
            ],
            react: [
                //Class component
                'constructClassInstance',
                'finishClassComponent',
                'commitLifeCycles',

                //Function component
                'mountIndeterminateComponent',
                'updateFunctionComponent'
            ]
        }
    }

    isNode() {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    }

    isBrowser() {
        return typeof window !== 'undefined' && typeof window.document !== 'undefined';
    }

    isReact() {
        try {
            let modules = window.webpackJsonp[0][0];
            return true;
        } catch (err) {
            return false;
        }
    }

    isVue() {
        try {
            const Vue = require('vue').default;
            return !!Vue.version;
        } catch (err) {
            return false;
        }
    }

    getReactImports() {
        let imports = [];
        try {
            for (let key in window.webpackJsonp[1][1]) {
                imports.push(key);
            }
        } catch (err) {
            //console.log('Log Beautify Error: ', err.message);
        }
        return imports;
    }

    getInfo() {
        // Save original Error.prepareStackTrace
        let origPrepareStackTrace = Error.prepareStackTrace;
        let trace;
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

            if (this.isNode()) {
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
            } else if (this.isBrowser()) {

                for (let key in stack) {
                    if (!stack.hasOwnProperty(key)) continue;
                    const value = stack[key].toString();
                    const stackName = value.split(' ')[0];
                    //console.log('$$$', value);
                    if (this.traces.webpack.indexOf(stackName) !== -1 || this.traces.react.indexOf(stackName) !== -1) {
                        trace = stack[key - 1].toString();
                        //React.js
                        if (this.isReact()) {
                            if (trace.indexOf('Module') !== -1) {
                                callerFile = trace.split(' ')[0].replace('Module', '');
                            } else if (trace.indexOf('new') === 0) {
                                callerFile = trace.split(' ')[1];//new App (http://test.com/js/main.chunk.js:100:21)
                            } else {
                                callerFile = trace.split('.')[0];//HeaderComponent.render
                            }
                            if (! /\.(js|jsx)$/gi.test(callerFile)) {
                                const cf = callerFile;
                                const filepath = this.getReactImports().find(file => {
                                    if (file.lastIndexOf(cf + '.js') === file.length - (cf + '.js').length) {
                                        return file;
                                    } else if (file.lastIndexOf(cf + '.jsx') === file.length - (cf + '.jsx').length) {
                                        return file;
                                    }
                                });
                                callerFile = '.' + filepath;
                            }
                        }

                        //Vue.js
                        if (this.isVue()) {
                            if (trace.indexOf('Module') !== -1) {
                                if (trace.indexOf('/vue-loader/') !== -1 && trace.indexOf('.vue?vue') !== -1) {
                                    const parts = trace.split('.js?!');
                                    if (parts.length) {
                                        callerFile = parts[parts.length - 1].split('?vue')[0]
                                    }
                                } else {
                                    callerFile = trace.split(' ')[0].replace('Module', '');
                                }
                            }
                        }

                        //Files
                        functionName = callerFile;
                        lineNumber = stack[key - 1].getLineNumber();
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