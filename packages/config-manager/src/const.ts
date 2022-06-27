import { ConfigKey, ConfigTypes } from './types'

export const defaultValues: Partial<ConfigTypes> = {
  [ConfigKey.openTime]: '18:00:00',
  [ConfigKey.checkOpenInterval]: 400,
  [ConfigKey.time]: '08-21',
  [ConfigKey.courts]: ['ze', 'xb', 'fy', 'gr', 'gt', 'yxb', 'sq'],
}

// TODO:
export const rules: { [key in ConfigKey]: (value: ConfigTypes[key]) => string | void } = {
  [ConfigKey.configured]: () => {},
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
    if (!/^\d{2}-\d{2}$/.test(value)) {
      return '时间格式错误'
    }
  },
  [ConfigKey.courts]: (value: string[]) => {
    if (value.length === 0) {
      return '场馆列表不能为空'
    }
  },
}
