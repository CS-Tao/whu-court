import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import { getRequestUniqueKey } from './helper'
import { HttpConfig } from './types'

const caches: Record<string, unknown> = configManager.get(ConfigKey.apiCacheMap) as Record<string, unknown>

export const getCache = (url: string, config: HttpConfig): unknown => {
  return caches[getRequestUniqueKey(url, config)]
}

export const setCache = (url: string, config: HttpConfig, data: unknown): void => {
  const key = getRequestUniqueKey(url, config)
  logger.debug('use cache data for', key)
  caches[key] = data
  setTimeout(() => {
    configManager.set(ConfigKey.apiCacheMap, caches)
  })
}
