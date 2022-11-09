import { ConfigKey, ConfigTypes } from './types'

export const defaultValues: Partial<ConfigTypes> = {
  [ConfigKey.available]: true,
  [ConfigKey.prohibitMsg]: '',
  [ConfigKey.announcement]: '',
  [ConfigKey.blackList]: [],
  [ConfigKey.whiteList]: [],

  [ConfigKey.githubId]: 123456,
  [ConfigKey.githubUserName]: 'guest',
  [ConfigKey.githubNickName]: 'guest',

  [ConfigKey.courtUserAgent]: '',

  [ConfigKey.openTime]: '18:00:00',
  [ConfigKey.checkOpenInterval]: 200,
  [ConfigKey.time]: '08-21',
  [ConfigKey.courts]: [],
  [ConfigKey.fields]: [],
  [ConfigKey.backupFields]: [],

  [ConfigKey.informHash]: '',

  [ConfigKey.apiCacheMap]: {},
}

// TODO:
export const rules: { [key in ConfigKey]: (value: ConfigTypes[key]) => string | void } = {
  [ConfigKey.available]: () => {},
  [ConfigKey.prohibitMsg]: () => {},
  [ConfigKey.announcement]: () => {},
  [ConfigKey.blackList]: (value: string[]) => {
    if (!Array.isArray(value)) {
      return '黑名单必须是数组'
    }
  },
  [ConfigKey.whiteList]: (value: string[]) => {
    if (!Array.isArray(value)) {
      return '白名单必须是数组'
    }
  },

  [ConfigKey.statsKey]: (value: string) => {
    if (value.length === 0) {
      return '统计密钥不能为空'
    }
  },

  [ConfigKey.githubId]: (value) => {
    if (!value) {
      return 'GitHub id 不能为空'
    }
  },
  [ConfigKey.githubUserName]: (value: string) => {
    if (!value) {
      return 'GitHub 用户名不能为空'
    }
  },
  [ConfigKey.githubNickName]: (value: string) => {
    if (!value) {
      return 'GitHub 昵称不能为空'
    }
  },
  [ConfigKey.githubToken]: (value: string) => {
    if (!value) {
      return 'GitHub Token不能为空'
    }
  },
  [ConfigKey.githubAvatar]: (value: string) => {
    if (!value) {
      return 'GitHub 头像不能为空'
    }
  },

  [ConfigKey.courtAccount]: (value: string) => {
    if (!value) {
      return '预约系统账号不能为空'
    }
  },
  [ConfigKey.courtToken]: (value: string) => {
    if (!value) {
      return '预约系统 Token 不能为空'
    }
  },
  [ConfigKey.courtSid]: (value: string) => {
    if (!value) {
      return '预约系统 Sid 不能为空'
    }
  },
  [ConfigKey.courtUserAgent]: (value: string) => {
    if (!value) {
      return '预约系统 UserAgent 不能为空'
    }
  },
  [ConfigKey.loginTime]: (value: number) => {
    if (!value) {
      return '登录时间不能为空'
    }
  },

  [ConfigKey.openTime]: (value: string) => {
    if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return '时间格式错误'
    }
  },
  [ConfigKey.checkOpenInterval]: (value: number) => {
    if (value < 0) {
      return '时间间隔必须大于0'
    }
  },
  [ConfigKey.time]: (value: string) => {
    if (!value) {
      return '时间不能为空'
    }
  },
  [ConfigKey.courts]: (value: string[]) => {
    if (value.length === 0) {
      return '场馆列表不能为空'
    }
    if (value.length !== Array.from(new Set(value)).length) {
      return '场馆列表不能有重复项'
    }
  },
  [ConfigKey.fields]: (value: string[]) => {
    if (value.length === 0) {
      return '场地列表不能为空'
    }
    if (value.length !== Array.from(new Set(value)).length) {
      return '场地列表不能有重复项'
    }
  },
  [ConfigKey.backupFields]: (value: string[]) => {
    if (value.length !== Array.from(new Set(value)).length) {
      return '备用场地列表不能有重复项'
    }
  },
  [ConfigKey.informHash]: () => {},
  [ConfigKey.apiCacheMap]: () => {},
}
