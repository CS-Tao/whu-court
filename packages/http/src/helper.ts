import { AxiosInstance } from 'axios'
import md5 from 'md5'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import { sleep } from '@whu-court/utils'
import { HttpConfig } from './types'

const beforeEnterCourtAppWaitTime = 1000
const afterEnterCourtAppWaitTime = 1000

export const enterCourtApp = async (http: AxiosInstance): Promise<void> => {
  const time = Date.now()
  logger.debug('HTTP start simulate enter court mini program')
  await sleep(beforeEnterCourtAppWaitTime)
  await http.post(
    '/v1.0.0/application/checkUserByAppAuth',
    'url=%2FpackageB%2Fpages%2Fhome%2Findex&jump=%2FpackageB%2Fpages%2Fhome%2Findex&platform=',
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    },
  )
  await http.post(
    '/v1.0.0/application/checkUserByAppAuth',
    'url=packageB%2Fpages%2Fhome%2Findex&jump=packageB%2Fpages%2Fhome%2Findex&platform=',
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    },
  )
  await http.post('/v1.0.0/ballBooking/queryHomeBookingInfo', {
    uid: configManager.get(ConfigKey.courtToken),
  })
  // async
  setTimeout(async () => {
    try {
      await http.post('/v1.0.0/inform/getInformList', {
        uid: configManager.get(ConfigKey.courtToken),
      })
      await http.post(
        '/v1.0.0/interfaceLog/appPointForThird',
        'module=%E5%9C%BA%E9%A6%86%E9%A2%84%E7%BA%A6&activityType=1&uri=%2FpackageB%2Fpages%2Fhome%2Findex',
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      )
    } catch (error) {
      logger.error(error as Error)
    }
  })
  await sleep(afterEnterCourtAppWaitTime)
  logger.debug('HTTP end simulate enter court mini program', `${Date.now() - time}ms`)
}

const safeParse = (str: string | Record<string, unknown>): Record<string, unknown> | string => {
  if (!str) return str
  if (typeof str === 'object' && str !== null) return str
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

export const getRequestUniqueKey = (url: string, config: HttpConfig) => {
  let params = safeParse(config.params)
  let data = safeParse(config.data)
  const cacheIgnoreKeys = config.cacheIgnoreKeys
  if (cacheIgnoreKeys?.length) {
    if (typeof params === 'object' && params !== null) {
      params = Object.keys(params || {}).reduce((acc, cur) => {
        if (cacheIgnoreKeys?.includes(cur)) {
          return acc
        }
        acc[cur] = (params as Record<string, unknown>)[cur]
        return acc
      }, {} as HttpConfig['params'])
    }
    if (typeof data === 'object' && data !== null) {
      data = Object.keys(data || {}).reduce((acc, cur) => {
        if (cacheIgnoreKeys?.includes(cur)) {
          return acc
        }
        acc[cur] = (data as Record<string, unknown>)[cur]
        return acc
      }, {} as HttpConfig['data'])
    }
  }
  return `${url}?query=${md5(JSON.stringify(params || ''))}data=${md5(JSON.stringify(data || ''))}`
}
