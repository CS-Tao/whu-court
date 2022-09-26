import NodeCache from 'node-cache'
import logger from '@whu-court/logger'

const cache = new NodeCache()

// TODO: 目前不需要缓存
// const list: Array<RegExp | string> = [/queryPlaceListByTypeId/g]
const list: Array<RegExp | string> = []

export const getCache = (url: string): unknown => {
  return cache.get(url)
}

export const setCache = (url: string, data: unknown): void => {
  if (list.every((each) => (typeof each === 'string' ? each !== url : !each.test(url)))) {
    return
  }
  logger.debug('use cache data for', url)
  cache.set(url, data, 5 * 1000)
}
