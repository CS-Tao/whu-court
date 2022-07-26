import Axios from 'axios'
import chalk from 'chalk'
import { uid } from 'uid'
import { URL } from 'url'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'
import { getCurrentTime } from '@whu-court/utils'
import { enterCourtApp } from './helper'
import { ServerData } from './types'

const lastEnterAppApiMap: Record<string, number> = {}
const ONE_MINUTE = 60 * 1000

const commonHeaders = {
  Host: 'miniapp.whu.edu.cn',
  Connection: 'keep-alive',
  'content-type': 'application/json',
  'Accept-Encoding': 'gzip,compress,br,deflate',
  Referer: 'https://servicewechat.com/wx20499591d49cdb5c/53/page-frame.html',
}

let proxyConfig: { proxy: { host: string; port: number } } | null = null

if (process.env.https_proxy) {
  try {
    const httpsProxy = new URL(process.env.https_proxy)
    proxyConfig = {
      proxy: {
        host: httpsProxy.hostname,
        port: +httpsProxy.port,
      },
    }
    logger.info(chalk.gray('[HTTPS PROXY]'), 'use', chalk.yellow(`https://${httpsProxy.hostname}:${+httpsProxy.port}`))
  } catch (error) {
    if (error instanceof Error) {
      Reporter.report(error)
    }
    logger.info(chalk.gray('[HTTPS PROXY]'), chalk.red('invalid https_proxy: ' + process.env.https_proxy))
  }
}

const http = Axios.create({
  baseURL: 'https://miniapp.whu.edu.cn/wisdomapi',
  timeout: 10000,
  headers: commonHeaders,
  ...proxyConfig,
})

http.interceptors.request.use((config) => {
  logger.debug(chalk.gray('[HTTP]'), 'Request:', config.method, config.url)
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
  }
  Reporter.Measure.shared(measureId, 'court-api-request').start()

  return config
})

http.interceptors.response.use(
  async (response) => {
    // @ts-ignore
    const measureId = response.config.metadata?.measureId
    measureId && Reporter.Measure.shared(measureId, 'court-api-request').end()

    if (!response.data) return response

    const url = response.config.url
    const data = response.data as ServerData
    const rawData = data.data

    // 模拟重新进入应用
    if (
      data.errmsg?.includes('系统繁忙') &&
      url &&
      (!lastEnterAppApiMap[url] || Date.now() - lastEnterAppApiMap[url] > ONE_MINUTE)
    ) {
      await enterCourtApp(http)
      lastEnterAppApiMap[url] = Date.now()
      return await http(response.config)
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

    return rawData
  },
  (error) => {
    logger.error(error.message)
    return Promise.reject(error)
  },
)

export default http
