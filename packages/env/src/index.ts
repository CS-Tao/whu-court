/* eslint-disable no-process-env */
import isWsl from 'is-wsl'
import os from 'os'
import path from 'path'
import { parse } from 'semver'
import { uid } from 'uid'
import pkg from '../package.json'

type AllowedProcessEnvs =
  | 'NODE_ENV' // node
  | 'ENABLE_MOCK' // 是否开启数据 mock
  | 'DEBUG_UPDATE_NOTIFIER' // 开发时是否提示升级
  | 'https_proxy' // axios 中间代理
  | 'DEBUG' // 调试模式
  | 'WCR_CONFIG_NAME' // 使用指定配置

export type Envs = {
  environment: 'local' | 'staging' | 'gray' | 'production'
  version: string
  prerelease?: 'alpha' | 'beta' | string
  appRoot: string
  mainPkg: {
    name: string
    version: string
    description: string
  }
  adminEmail: string
  vips: string[]
  loverGitHubName: string
  loggerDir: string
  currentProcessUID: string
  detailVersion: string
  allowedProcessEnv: {
    [key in AllowedProcessEnvs]?: string
  }
}

const version = pkg.version
const semverVersion = parse(version, {
  // @ts-expect-error
  includePrerelease: true,
  loose: true,
})

const prerelease: Envs['prerelease'] = String(semverVersion?.prerelease[0])
let environment: Envs['environment'] = 'local'

if (process.env.NODE_ENV === 'production') {
  if (prerelease) {
    // 预发布
    environment = prerelease === 'beta' ? 'gray' : 'staging'
  } else {
    // 线上
    environment = 'production'
  }
}

const appRoot =
  environment === 'local' ? path.join(__dirname, '..', '..', '..') : path.join(__dirname, '..', '..', '..', '..')

const description = '🏸 场地预约助手'

const mainPkg: Envs['mainPkg'] = {
  name: '@whu-court/cli',
  version,
  description,
}

const loggerDir = path.join(appRoot, 'logs')
const currentProcessUID = uid()
const detailVersion = `${mainPkg.version} ${isWsl ? 'wsl' : os.platform()}-${
  os.arch() === 'ia32' ? 'x86' : os.arch()
} node-${process.version}`

const adminEmail = 'sneer-innings.0u@icloud.com'
const vips = ['lsq210', 'CS-Tao']
const loverGitHubName = 'lsq210'

const allowedProcessEnvSet: Set<AllowedProcessEnvs> = new Set([
  'NODE_ENV',
  'ENABLE_MOCK',
  'DEBUG_UPDATE_NOTIFIER',
  'https_proxy',
  'DEBUG',
])
const allowedProcessEnv = Array.from(allowedProcessEnvSet).reduce<Envs['allowedProcessEnv']>(
  (acc, cur) => ({ ...acc, [cur]: process.env[cur] }),
  {} as Envs['allowedProcessEnv'],
)

const envs: Envs = {
  environment,
  version,
  prerelease,
  appRoot,
  mainPkg,
  vips,
  loverGitHubName,
  adminEmail,
  loggerDir,
  currentProcessUID,
  detailVersion,
  allowedProcessEnv,
}

export {
  environment,
  version,
  prerelease,
  appRoot,
  mainPkg,
  vips,
  loverGitHubName,
  adminEmail,
  loggerDir,
  currentProcessUID,
  detailVersion,
  allowedProcessEnv,
}
export default envs
