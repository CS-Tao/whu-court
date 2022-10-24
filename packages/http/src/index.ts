import Axios from 'axios'
import chalk from 'chalk'
import md5 from 'md5'
import { uid } from 'uid'
import { URL } from 'url'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import { allowedProcessEnv } from '@whu-court/env'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'
import { getCurrentTime } from '@whu-court/utils'
import { getCache, setCache } from './cache'
import { enterCourtApp } from './helper'
import { ServerData } from './types'

const lastEnterAppApiMap: Record<string, { timestamp: number; times: number }> = {}
const RETRY_TIME_WINDOW = 10 * 1000
const RETRY_TIMES_PER_TIME_WINDOW = 3

const commonHeaders = {
  Host: 'miniapp.whu.edu.cn',
  Connection: 'keep-alive',
  'content-type': 'application/json',
  'Accept-Encoding': 'gzip,compress,br,deflate',
  Referer: 'https://servicewechat.com/wx20499591d49cdb5c/53/page-frame.html',
}

let proxyConfig: { proxy: { host: string; port: number } } | null = null

if (allowedProcessEnv.https_proxy) {
  try {
    const httpsProxy = new URL(allowedProcessEnv.https_proxy)
    proxyConfig = {
      proxy: {
        host: httpsProxy.hostname,
        port: +httpsProxy.port,
      },
    }
    logger.info(
      chalk.gray('[HTTPS PROXY]'),
      'using',
      chalk.yellow(`https://${httpsProxy.hostname}:${+httpsProxy.port}`),
    )
  } catch (error) {
    if (error instanceof Error) {
      Reporter.report(error)
    }
    logger.info(chalk.gray('[HTTPS PROXY]'), chalk.red('invalid https_proxy: ' + allowedProcessEnv.https_proxy))
  }
}

const CANCEL_TOKEN = Axios.CancelToken

const http = Axios.create({
  baseURL: 'https://miniapp.whu.edu.cn/wisdomapi',
  timeout: 10000,
  headers: commonHeaders,
  ...proxyConfig,
})

http.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  const token = config.headers['x-outh-token'] || (configManager.get(ConfigKey.courtToken) as string)
  const sid = config.headers['x-outh-sid'] || (configManager.get(ConfigKey.courtSid) as string)
  const userAgent = config.headers['user-agent'] || (configManager.get(ConfigKey.courtUserAgent) as string)
  if (!token || !sid) {
    throw new Error('请先登录')
  }
  config.headers.token = config.headers.token || ''
  config.headers['x-outh-token'] = token
  config.headers['x-outh-sid'] = sid
  config.headers['User-Agent'] = userAgent

  const measureId = `${config.url}(${uid()})`
  // @ts-ignore
  config.metadata = {
    measureId,
    requestTime: Date.now(),
  }
  Reporter.Measure.shared(measureId, 'court-api-request').start()

  logger.debug('HTTP Request:', config.method, measureId)

  if (config.url && getCache(config.url)) {
    const source = CANCEL_TOKEN.source()
    config.cancelToken = source.token
    source.cancel(getCache(config.url) as any)
  }

  return config
})

http.interceptors.response.use(
  async (response) => {
    // @ts-ignore
    const measureId = response.config.metadata?.measureId
    // @ts-ignore
    const requestTime = response.config.metadata?.requestTime
    measureId && Reporter.Measure.shared(measureId, 'court-api-request').end()
    logger.debug('HTTP Response:', response.config.method, measureId, `${Date.now() - requestTime}ms`)

    if (!response.data) return response

    const url = response.config.url
    const data = response.data as ServerData
    const rawData = data.data

    // 模拟重新进入应用
    if (data.errmsg?.includes('系统繁忙')) {
      const lastEnterAppApiMapKey =
        url &&
        `${url}?query=${md5(JSON.stringify(response.config.params || ''))}data=${md5(
          JSON.stringify(response.config.data || ''),
        )}`
      if (
        lastEnterAppApiMapKey &&
        (!lastEnterAppApiMap[lastEnterAppApiMapKey] ||
          (lastEnterAppApiMap[lastEnterAppApiMapKey].times <= RETRY_TIMES_PER_TIME_WINDOW &&
            Date.now() - lastEnterAppApiMap[lastEnterAppApiMapKey].timestamp < RETRY_TIME_WINDOW) ||
          (lastEnterAppApiMap[lastEnterAppApiMapKey].times > RETRY_TIMES_PER_TIME_WINDOW &&
            Date.now() - lastEnterAppApiMap[lastEnterAppApiMapKey].timestamp > RETRY_TIME_WINDOW))
      ) {
        await enterCourtApp(http)
        if (
          lastEnterAppApiMap[lastEnterAppApiMapKey] &&
          Date.now() - lastEnterAppApiMap[lastEnterAppApiMapKey].timestamp < RETRY_TIME_WINDOW
        ) {
          lastEnterAppApiMap[lastEnterAppApiMapKey].times++
          lastEnterAppApiMap[lastEnterAppApiMapKey].timestamp = Date.now()
        } else {
          lastEnterAppApiMap[lastEnterAppApiMapKey] = {
            times: 1,
            timestamp: Date.now(),
          }
        }
        logger.debug('Retry request', lastEnterAppApiMapKey)
        return await http(response.config)
      }
    }

    if (response.data.errcode !== 0) {
      const dataKeysForErrorInfo: Array<[Partial<keyof ServerData>, string]> = [
        ['desc', '描述信息'],
        ['errmsg', '错误信息'],
        ['detailErrMsg', '错误详情'],
        ['hint', '提示信息'],
      ]
      const errorMsg = `接口: ${url}${dataKeysForErrorInfo.reduce(
        (acc, cur) => (data[cur[0]] ? `${acc}${cur[1]}: ${data[cur[0]]}\n` : acc),
        '\n',
      )}`
      throw new Error(`数据请求失败\n${errorMsg}时间: ${getCurrentTime(true)}`)
    }

    if (data.hint && typeof data.hint === 'string') {
      logger.info('hint from server:', chalk.green(data.hint))
    }

    if (url) {
      setCache(url, rawData)
    }

    return rawData
  },
  (error) => {
    if (Axios.isCancel(error) && ![null, undefined].includes(error?.message)) {
      return Promise.resolve(error.message)
    }
    logger.error(error.message)
    return Promise.reject(error)
  },
)

export default http
