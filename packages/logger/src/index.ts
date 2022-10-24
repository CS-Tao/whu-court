/* eslint-disable no-console */
import chalk from 'chalk'
import log4js from 'log4js'
import path from 'path'
import { allowedProcessEnv, currentProcessUID, environment, loggerDir } from '@whu-court/env'
import Reporter from '@whu-court/report'
import { ErrorNoNeedReport } from './errors'

log4js.configure({
  appenders: {
    access: {
      type: 'dateFile',
      filename: path.join(loggerDir, 'access.log'),
      pattern: 'yyyy-MM-dd',
      numBackups: 2,
      timezoneOffset: '1m',
      keepFileExt: true,
    },
    errorFile: {
      type: 'dateFile',
      filename: path.join(loggerDir, 'error.log'),
      pattern: 'yyyy-MM-dd',
      numBackups: 2,
      timezoneOffset: '1m',
      keepFileExt: true,
    },
    error: {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: 'errorFile',
    },
  },
  categories: {
    default: { appenders: ['access', 'error'], level: 'DEBUG' },
  },
})

const fileLogger = log4js.getLogger()

interface Options {
  report?: boolean
}

class Logger {
  constructor(options?: Options) {
    this.options = options || {}
  }

  static Errors = {
    ErrorNoNeedReport,
  }

  options: Options

  static getLogger(options?: Options): Logger {
    return new Logger(options)
  }

  public warn(message: string, ...data: any[]): void {
    console.warn(message, ...data)
    fileLogger.warn(message, ...data)
  }

  public error(error: string | Error, ...data: string[]): void {
    console.error(chalk.red(typeof error === 'string' ? error : error.message), data.map(chalk.red).join(''))
    if (environment === 'local' && typeof error !== 'string') {
      console.log(chalk.gray('[INFO]'), 'trace below only show in local')
      console.trace(error)
    }
    if (this.options.report && !(error instanceof Logger.Errors.ErrorNoNeedReport)) {
      Reporter.report(typeof error === 'string' ? new Error([error, ...data].join('\n')) : error)
    }
    if (typeof error === 'string') {
      fileLogger.error(`[${currentProcessUID}]`, error, ...data)
    } else {
      fileLogger.trace(`[${currentProcessUID}]`, error, ...data)
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

  public log(message: string, ...data: any[]): void {
    console.log(message, ...data)
    fileLogger.info(
      `[${currentProcessUID}]`,
      message.replace(/\n/g, '  '),
      ...data.map((each) => each.replace(/\n/g, '  ')),
    )
  }

  public debug(message: string, ...data: any[]): void {
    if (allowedProcessEnv.DEBUG) {
      console.debug(message, ...data)
    }
    fileLogger.debug(`[${currentProcessUID}]`, message, ...data)
  }
}

const logger = Logger.getLogger({ report: true })

export { Logger }
export default logger
