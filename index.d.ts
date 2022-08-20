/* eslint-disable  @typescript-eslint/no-explicit-any */

declare module 'log-beautify' {
    export interface LevelLabels {
        trace: string,
        success: string,
        debug: string,
        info: string,
        warning: string,
        error: string,
    }

    export interface Levels {
        trace: string|number,
        success: string|number,
        success_: string|number,
        debug: string|number,
        debug_: string|number,
        info: string|number,
        info_: string|number,
        warning: string|number,
        warning_: string|number,
        error: string|number,
        error_: string|number,
    }

    export class LogBeautify {
        public useLabels: boolean
        public useSymbols: boolean

        success(...args: any[]): void
        success_(...args: any[]): void
        debug(...args: any[]): void
        debug_(...args: any[]): void
        info(...args: any[]): void
        info_(...args: any[]): void
        warning(...args: any[]): void
        warning_(...args: any[]): void
        warn(...args: any[]): void
        warn_(...args: any[]): void
        error(...args: any[]): void
        error_(...args: any[]): void
        show(...args: any[]): void


        setLevel(level: number, namespace = 'global'): void

        setLocalLevel(level: string): void

        setNamespaceLevel(level: string, namespace: string|null = null): void

        useNamespace(namespace: string|null = null): void

        namespace(namespace: string|null = null): void

        getWorkingLevel(): number

        setLevels(levels: Levels): void

        setColors(colors: LevelLabels): void

        setTextColors(bgTextColors: LevelLabels): void

        setSymbols(symbols: LevelLabels): void

        setLabels(labels: LevelLabels): void
    }
    const log: LogBeautify;
    export default log;
}
