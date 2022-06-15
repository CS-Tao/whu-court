/* eslint-disable no-console */
import Reporter from '@whu-court/reporter'

class Logger {
  constructor(module: string, tag?: string) {
    this.module = module
    this.tag = tag
  }

  static getLogger(module: string, tag?: string): Logger {
    return new Logger(module, tag)
  }

  module: string
  tag?: string

  public warn(...data: any[]): void {
    console.warn(...data)
  }

  public error(...data: string[]): void {
    console.error(...data)
    Reporter.report(new Error(data.join('\n')))
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

export default Logger
