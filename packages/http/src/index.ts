import Axios from 'axios'
import chalk from 'chalk'
import Logger from '@whu-court/logger'
import { ServerData } from './types'

const logger = Logger.getLogger('@whu-court/http')

const commonHeaders = {
  Host: 'miniapp.whu.edu.cn',
  Connection: 'keep-alive',
  'content-type': 'application/json',
  'Accept-Encoding': 'gzip,compress,br,deflate',
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.22(0x18001627) NetType/WIFI Language/zh_CN',
  Referer: 'https://servicewechat.com/wx20499591d49cdb5c/53/page-frame.html',
}

const http = Axios.create({
  baseURL: 'https://miniapp.whu.edu.cn/wisdomapi',
  timeout: 5000,
  headers: commonHeaders,
})

http.interceptors.request.use((config) => {
  const token = 'mock-token'
  const sid = 'mock-sid'
  if (token) {
    config.headers = config.headers || {}
    config.headers['x-outh-token'] = token
    config.headers.token = ''
    config.headers['x-outh-sid'] = sid
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    if (!response.data) return response

    const url = response.config.url
    const data = response.data as ServerData
    const rawData = data.data
    const code = data.errcode

    // { code: '9999', desc: '登录凭证已过期，请重新登录' }
    if (code === '9999' && response.data.desc.include('过期')) {
      // TODO: relogin
    }

    if (response.data.errcode !== 0) {
      const dataKeysForErrorInfo: Array<Partial<keyof ServerData>> = [
        'errmsg',
        'desc',
        'errmsg',
        'detailErrMsg',
        'hint',
      ]
      const errorMsg = `url: ${url}${dataKeysForErrorInfo.reduce(
        (acc, cur) => (data[cur] ? `${acc}${cur}: ${data[cur]}\n` : acc),
        '\n',
      )}`
      logger.error(errorMsg)
      throw new Error(`error when load data: ${errorMsg}`)
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
