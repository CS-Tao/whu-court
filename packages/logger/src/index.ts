/* eslint-disable no-console */
import Reporter from '@whu-court/reporter'

interface Options {
  report?: boolean
}

class Logger {
  constructor(options?: Options) {
    this.options = options || {}
  }

  options: Options

  static getLogger(options?: Options): Logger {
    return new Logger(options)
  }

  public warn(...data: any[]): void {
    console.warn(...data)
  }

  public error(...data: string[]): void {
    console.error(...data)
    if (this.options.report) {
      Reporter.report(new Error(data.join('\n')))
    }
  }

  public group(...data: any[]): void {
    console.group(...data)
  }

  public groupCollapsed(...data: any[]): void {
    console.groupCollapsed(...data)
  }

  public groupEnd(): void {
    console.groupEnd()
  }

  public info(...data: any[]): void {
    console.info(...data)
  }

  public log(...data: any[]): void {
    console.log(...data)
  }

  public debug(...data: any[]): void {
    console.debug(...data)
  }
}

const logger = Logger.getLogger({ report: true })

export { Logger }
export default logger
