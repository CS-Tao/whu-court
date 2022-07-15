import { ConfigKey } from '@whu-court/config-manager'

const serializeStringArray = (value: number | string | string[] | boolean): string =>
  typeof value === 'object' && value.length ? value.join(',') : String(value)
const deserializeStringArray = (value: string): string[] => value.split(',')

export const configs: Array<{
  name: string
  key: ConfigKey
  desc: string
  serialize: (value: number | string | string[] | boolean) => string | number
  deserialize: (value: string) => number | string | string[]
}> = [
  {
    name: 'time',
    key: ConfigKey.time,
    desc: '希望预约的时间段，加!排除时间段',
    serialize: (value) => value as string,
    deserialize: (value) => value,
  },
  {
    name: 'checkOpenInterval',
    key: ConfigKey.checkOpenInterval,
    desc: '检查是否可以开始抢场地的时间间隔',
    serialize: (value) => value as number,
    deserialize: (value) => +value,
  },
  {
    name: 'openTime',
    key: ConfigKey.openTime,
    desc: '开始抢场地的时间',
    serialize: (value) => value as string,
    deserialize: (value) => value,
  },
  {
    name: 'courts',
    key: ConfigKey.courts,
    desc: '预约时按顺序考虑的场馆列表',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
  {
    name: 'fields',
    key: ConfigKey.fields,
    desc: '预约时按顺序考虑的场地列表',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
  {
    name: 'statsKey',
    key: ConfigKey.statsKey,
    desc: '随机数据密钥，可自定义\n提供此 key 可协助管理员查日志',
    serialize: (value) => value as string,
    deserialize: (value) => value,
  },
]
