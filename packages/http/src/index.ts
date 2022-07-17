import Axios from 'axios'
import chalk from 'chalk'
import { URL } from 'url'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'
import { enterCourtApp } from './helper'
import { ServerData } from './types'

const checkUserByAppAuthApiMap: Record<string, boolean> = {}

const commonHeaders = {
  Host: 'miniapp.whu.edu.cn',
  Connection: 'keep-alive',
  'content-type': 'application/json',
  'Accept-Encoding': 'gzip,compress,br,deflate',
  'User-Agent': configManager.get(ConfigKey.courtUserAgent) as string,
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
    logger.log(chalk.gray('[HTTPS PROXY]'), chalk.red('invalid https_proxy: ' + process.env.https_proxy))
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
  if (!token || !sid) {
    throw new Error('请先登录')
  }
  config.headers.token = config.headers.token || ''
  config.headers['x-outh-token'] = token
  config.headers['x-outh-sid'] = sid
  // console.log('request', config.url, config.headers, config.data)
  return config
})

http.interceptors.response.use(
  async (response) => {
    if (!response.data) return response

    const url = response.config.url
    const data = response.data as ServerData
    const rawData = data.data

    // 重新模拟进入应用
    if (data.errmsg?.includes('系统繁忙') && url && !checkUserByAppAuthApiMap[url]) {
      await enterCourtApp(http)
      checkUserByAppAuthApiMap[url] = true
      return await http(response.config)
    }
    if (url) {
      checkUserByAppAuthApiMap[url] = false
    }

    if (response.data.errcode !== 0) {
      const dataKeysForErrorInfo: Array<Partial<keyof ServerData>> = ['errmsg', 'desc', 'detailErrMsg', 'hint']
      const errorMsg = `url: ${url}${dataKeysForErrorInfo.reduce(
        (acc, cur) => (data[cur] ? `${acc}${cur}: ${data[cur]}\n` : acc),
        '\n',
      )}`
      throw new Error(`error when load data\n${errorMsg}`)
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
