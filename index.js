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
        this.useLabels = false;
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

        this._labels = {
            trace: 'TRACE',
            success: 'SUCCESS',
            ok: 'OK',
            debug: 'DEBUG',
            info: 'INFO',
            warning: 'WARNING',
            warn: 'WARNING',
            error: 'ERROR'
        };

        //Create initial logs
        this._createLogs();
    }

    /**
    |--------------------------------------------------
    | Public methods
    |--------------------------------------------------
    */
   
    show(...args){
        if (this._shouldLog(this.getWorkingLevel())) {
            console.log(...args);
        }
    }

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
            return key;
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

    setLabels(labels) {
        this._labels = { ...this._labels, ...labels };
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
            return key;
        });
    }

    _getSymbol(key) {
        return this._symbols[key] || this._symbols[this._getKeyName(key)] || this.defaultSymbol;
    }

    _getLabel(key) {
        return this._labels[key] || this._labels[this._getKeyName(key)] || '';
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
        let cssPrefix;
        let prefix = this._getPrefix(type, key);
        if (type === LOG_TEXT) {
            cssPrefix = this._getCSS(LOG_BG, key + '_');
        } else {
            cssPrefix = this._getCSS(LOG_TEXT, this._getKeyName(key));
        }
        if (prefix) {
            if (!this.useLabels) {
                args.unshift(this._getSymbolString(key, type === LOG_TEXT ? '' : ' ', ''));
                console.log(this._formatLogBrowser(key, args), this._getCSS(type, key), ...args);
            } else {
                console.log('%c%s' + this._formatLogBrowser(key, args), cssPrefix, prefix, this._getCSS(type, key), ...args);
            }
        } else {
            console.log(this._formatLogBrowser(key, args), this._getCSS(type, key), ...args);
        }
    }

    _logTerminal(type, key, args) {
        let text, bg, output;
        if (type === LOG_TEXT) {
            if (this._getPrefix(type, key) && !this.useLabels) {
                args.unshift(this._getSymbolString(key, '', ''));
            }
            text = this._chTextColor(this._colors[key])(...this._fixArgs(args, key));
            output = text;
            if (this._getPrefix(type, key)) {
                if (!this.useLabels) {
                    console.log(output);
                } else {
                    console.log(this._getPrefix(type, key), output);
                }
            } else {
                console.log(output);
            }
        }

        if (type === LOG_BG) {
            text = this._chTextColor(this._bgTextColors[key] || defaultBgTextColor);
            bg = this._chBgColor(this._colors[key]);
            if (this._getPrefix(type, key) && !this.useLabels) {
                args.unshift(this._getSymbolString(key, ' ', ''));
            }
            output = bg(text(...this._fixArgs(args, key)));
            if (this._getPrefix(type, key)) {
                if (!this.useLabels) {
                    console.log(output);
                } else {
                    console.log(this._getPrefix(type, key), output);
                }
            } else {
                console.log(output);
            }
        }
    }

    _getPrefix(type, key) {
        let result = this._getSymbolAndLabel(type, key);
        if (result.success) {
            return result.payload;
        }
        return '';
    }

    _getSymbolString(key, before = ' ', after = ' ') {
        if (this.useSymbols && this._getSymbol(key)) {
            return before + this._getSymbol(key) + after;
        }
        return '';
    }

    _getLabelString(key, before = ' ', after = ' ') {
        if (this.useLabels && this._getLabel(key)) {
            return before + this._getLabel(key) + after;
        }
        return '';
    }

    _getSymbolAndLabel(type, key) {
        let payload = '';
        let symbol = this._getSymbolString(key, ' ', ' ');
        let label = symbol ? this._getLabelString(key, '') : this._getLabelString(key);

        if (!symbol && !label) {
            return {
                success: false,
                payload
            };
        }
        if (this._isBrowser()) {
            payload = symbol + label;
        } else {
            if (type === LOG_TEXT) {
                const text = this._chTextColor(this._bgTextColors[key + '_'] || defaultBgTextColor);
                const bg = this._chBgColor(this._colors[key + '_']);
                if ( key === 'info' && symbol == " 🛈 " ){
                    payload = bg(text(symbol + label + ' '));
                } else {
                    payload = bg(text(symbol + label));
                }
            }
            if (type === LOG_BG) {
                payload = this._chTextColor(this._colors[this._getKeyName(key)])(symbol + label);
            }
        }
        return {
            success: true,
            payload
        };
    }

    _fixArgs(args, key) {
        let newArgs = [];
        if (key === 'info' || key === 'info_' ){
           args.push('');
        }
        args.map(arg => {
            if (isArray(arg)) {
                newArgs.push('[');
                newArgs.push(arg);
                newArgs.push(']');
            } else {
                newArgs.push(arg);
            }
            return arg;
        });
        return newArgs;
    }

    _formatLogBrowser(key, args) {
        let label = this._getLabelString(key);
        let formater = label ? '%c ' : '%c';
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
            return arg;
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
        const result = workingLevel > this._levels.silent && level >= workingLevel;
        if (process.env && process.env.NODE_ENV) {
            if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development') {
                return result;
            } else {
                //hide all logs on production
                return false;
            }
        }
        return result;
    }

    _getKeyLevel(key) {
        const _key = this._getKeyName(key);
        //allow level 0
        return this._levels[_key] !== undefined ? this._levels[_key] : this.defaultLevel;
    }

    _getKeyName(key) {
        return key.lastIndexOf('_') === key.length - 1 ? key.substring(0, key.length - 1) : key;
    }

    _chBase() {
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
                return validKeywords.indexOf(_color) >= 0 ? this._chBase().keyword(_color) : this._chBase();
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
                return validKeywords.indexOf(_color) >= 0 ? ch.bgKeyword(_color) : ch;
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
            if (this._isBrowser()) {
                return _arg;
            } else {
                if (isObject(_arg)) {
                    return JSON.stringify(_arg, null, 3);
                } else if (isArray(_arg)) {
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

// const toBase64 = (string) => {
//     return typeof btoa === "function" ? btoa(string) : Buffer.from(string).toString('base64');
// }



/**
|--------------------------------------------------
| Stack Tracer
|--------------------------------------------------
*/

class StackTracer {
    constructor() {
        this._isVue = false;
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
            let arr = window.webpackJsonp[0][0];
            return !!arr;
        } catch (err) {
            return false;
        }
    }

    isVue(trace) {
        if (trace.indexOf('Module') !== -1 && trace.indexOf('/vue-loader/') !== -1) {
            this._isVue = true;
        }
        return this._isVue;
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
                    }
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
                                    if (file.indexOf(cf + '.js', file.length - (cf + '.js').length) !== -1) {
                                        return true;
                                    } else if (file.indexOf(cf + '.jsx', file.length - (cf + '.jsx').length) !== -1) {
                                        return true;
                                    }
                                    return false;
                                });
                                callerFile = '.' + filepath;
                            }
                        }
                        //Vue.js
                        else if (this.isVue(trace)) {
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



const validKeywords = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];



module.exports = new LogBeautify();
