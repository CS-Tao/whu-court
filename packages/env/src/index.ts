import isWsl from 'is-wsl'
import os from 'os'
import path from 'path'
import { parse } from 'semver'
import { uid } from 'uid'
import pkg from '../package.json'

export interface Envs {
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
}
export default envs
