import { ConfigKey } from '@whu-court/config-manager'

export const configs: Array<{
  icon: string
  name: string
  key: ConfigKey
  desc: string
  serialize: (value: number | string | string[] | boolean | Record<string, unknown>) => string | number
  deserialize: (value: string) => number | string | string[]
}> = [
  {
    icon: '🚦',
    name: 'checkOpenInterval',
    key: ConfigKey.checkOpenInterval,
    desc: '检查是否可以开始抢场地的时间间隔',
    serialize: (value) => value as number,
    deserialize: (value) => +value,
  },
  {
    icon: '⏰',
    name: 'openTime',
    key: ConfigKey.openTime,
    desc: '开始抢场地的时间',
    serialize: (value) => value as string,
    deserialize: (value) => value,
  },
  {
    icon: '🔑',
    name: 'statsKey',
    key: ConfigKey.statsKey,
    desc: '随机数据密钥，可自定义\n提供此 key 可协助管理员查日志',
    serialize: (value) => value as string,
    deserialize: (value) => value,
  },
]
