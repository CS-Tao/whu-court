import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import { sleep } from '@whu-court/utils'

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
  http.post('/v1.0.0/inform/getInformList', {
    uid: configManager.get(ConfigKey.courtToken),
  })
  // async
  http.post(
    '/v1.0.0/interfaceLog/appPointForThird',
    'module=%E5%9C%BA%E9%A6%86%E9%A2%84%E7%BA%A6&activityType=1&uri=%2FpackageB%2Fpages%2Fhome%2Findex',
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    },
  )
  await sleep(afterEnterCourtAppWaitTime)
  logger.debug('HTTP simulate enter court mini program end', `${Date.now() - time}ms`)
}
