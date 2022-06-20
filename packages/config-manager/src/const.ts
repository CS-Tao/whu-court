import { ConfigKey, ConfigTypes } from './types'

export const defaultValues: ConfigTypes = {
  [ConfigKey.openTime]: '18:00:00',
  [ConfigKey.checkOpenInterval]: 400,
  [ConfigKey.time]: '08-21',
  [ConfigKey.courts]: ['ze', 'xb', 'fy', 'gr', 'gt', 'yxb', 'sq'],
}

export const rules: { [key in ConfigKey]: (value: ConfigTypes[key]) => string | void } = {
  [ConfigKey.openTime]: (value: string) => {
    // TODO:
    if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return '时间格式错误'
    }
  },
  [ConfigKey.checkOpenInterval]: (value: number) => {
    // TODO:
    if (value < 0) {
      return '时间间隔必须大于0'
    }
  },
  [ConfigKey.time]: (value: string) => {
    // TODO:
    if (!/^\d{2}-\d{2}$/.test(value)) {
      return '时间格式错误'
    }
  },
  [ConfigKey.courts]: (value: string[]) => {
    // TODO:
    if (value.length === 0) {
      return '场馆列表不能为空'
    }
  },
}
