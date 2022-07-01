import { ConfigKey, ConfigTypes } from './types'

const getNumberStringList = (n: number) => new Array(n).fill(0).map((_, i) => String(i + 1))

const courtList = ['ze', 'xb', 'fy', 'gr', 'gt', 'yxb']
const courtNumberMap = {
  [ConfigKey.zeOrder]: {
    all: getNumberStringList(18),
    prefer: ['11', '12', '13', '14'],
  },
  [ConfigKey.xbOrder]: {
    all: getNumberStringList(9),
    prefer: ['4', '5', '6'],
  },
  [ConfigKey.fyOrder]: {
    all: getNumberStringList(6),
    prefer: ['4', '5', '6'],
  },
  [ConfigKey.grOrder]: {
    all: getNumberStringList(6),
    prefer: [] as string[],
  },
  [ConfigKey.gtOrder]: {
    all: getNumberStringList(10),
    prefer: [] as string[],
  },
  [ConfigKey.yxbOrder]: {
    all: getNumberStringList(12),
    prefer: [] as string[],
  },
}
const courtNameMap = {
  [ConfigKey.zeOrder]: '卓尔',
  [ConfigKey.xbOrder]: '信部',
  [ConfigKey.fyOrder]: '风雨',
  [ConfigKey.grOrder]: '国软',
  [ConfigKey.gtOrder]: '工体',
  [ConfigKey.yxbOrder]: '医学部',
}
const getCourtNumberPreferList = (courtKey: keyof typeof courtNumberMap) => {
  const all = courtNumberMap[courtKey].all
  const prefer = courtNumberMap[courtKey].prefer
  return [...prefer, ...all.filter((each) => !prefer.includes(each))]
}

export const defaultValues: Partial<ConfigTypes> = {
  [ConfigKey.available]: true,
  [ConfigKey.prohibitMsg]: '',
  [ConfigKey.announcement]: '',
  [ConfigKey.blackList]: [],
  [ConfigKey.whiteList]: [],

  [ConfigKey.openTime]: '18:00:00',
  [ConfigKey.checkOpenInterval]: 400,
  [ConfigKey.time]: '08-21',
  [ConfigKey.courts]: courtList,

  [ConfigKey.zeOrder]: getCourtNumberPreferList(ConfigKey.zeOrder),
  [ConfigKey.xbOrder]: getCourtNumberPreferList(ConfigKey.xbOrder),
  [ConfigKey.fyOrder]: getCourtNumberPreferList(ConfigKey.fyOrder),
  [ConfigKey.grOrder]: getCourtNumberPreferList(ConfigKey.grOrder),
  [ConfigKey.gtOrder]: getCourtNumberPreferList(ConfigKey.gtOrder),
  [ConfigKey.yxbOrder]: getCourtNumberPreferList(ConfigKey.yxbOrder),
}

const getCourtOrderRule = (courtKey: keyof typeof courtNumberMap) => (value: string[]) => {
  if (value.length === 0) {
    return `${courtNameMap[courtKey]}场地列表不能为空`
  }
  if (value.some((each) => !courtNumberMap[courtKey].all.includes(each))) {
    return `${courtNameMap[courtKey]}场地号错误, 可选的场地号有: ` + courtNumberMap[courtKey].all.join(', ')
  }
  if (value.length !== new Array(new Set(value)).length) {
    return '场地号不能重复'
  }
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
    if (!/^\d{2}-\d{2}$/.test(value)) {
      return '时间格式错误'
    }
  },
  [ConfigKey.courts]: (value: string[]) => {
    if (value.length === 0) {
      return '场馆列表不能为空'
    }
    if (value.length !== Array.from(new Set(value)).length) {
      return '场馆列表不能有重复项'
    }
    if (value.some((each) => !courtList.includes(each))) {
      return '场馆名称错误, 可选的场馆名称有: ' + courtList.join(', ')
    }
  },

  [ConfigKey.zeOrder]: getCourtOrderRule(ConfigKey.zeOrder),
  [ConfigKey.xbOrder]: getCourtOrderRule(ConfigKey.xbOrder),
  [ConfigKey.fyOrder]: getCourtOrderRule(ConfigKey.fyOrder),
  [ConfigKey.grOrder]: getCourtOrderRule(ConfigKey.grOrder),
  [ConfigKey.gtOrder]: getCourtOrderRule(ConfigKey.gtOrder),
  [ConfigKey.yxbOrder]: getCourtOrderRule(ConfigKey.yxbOrder),
}
