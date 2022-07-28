import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import { sleep } from '@whu-court/utils'

const beforeEnterCourtAppWaitTime = 1000
const afterEnterCourtAppWaitTime = 2000

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
  await sleep(afterEnterCourtAppWaitTime)
  logger.debug('HTTP simulate enter court mini program end', `${Date.now() - time}ms`)
}
