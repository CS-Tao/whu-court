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
    name: 'zeOrder',
    key: ConfigKey.zeOrder,
    desc: '预约时按顺序考虑的场地列表(卓尔)',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
  {
    name: 'xbOrder',
    key: ConfigKey.xbOrder,
    desc: '预约时按顺序考虑的场地列表(信部)',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
  {
    name: 'fyOrder',
    key: ConfigKey.fyOrder,
    desc: '预约时按顺序考虑的场地列表(风雨)',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
  {
    name: 'grOrder',
    key: ConfigKey.grOrder,
    desc: '预约时按顺序考虑的场地列表(国软)',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
  {
    name: 'gtOrder',
    key: ConfigKey.gtOrder,
    desc: '预约时按顺序考虑的场地列表(工体)',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
  {
    name: 'yxbOrder',
    key: ConfigKey.yxbOrder,
    desc: '预约时按顺序考虑的场地列表(医学部)',
    serialize: serializeStringArray,
    deserialize: deserializeStringArray,
  },
]
