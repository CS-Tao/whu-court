import path from 'path'
import { parse } from 'semver'
import pkg from '../package.json'

export interface Envs {
  environment: 'local' | 'staging' | 'gray' | 'production'
  version: string
  prerelease?: 'alpha' | 'beta' | string
  appRoot: string
}

const version = pkg.version
const semverVersion = parse(version, {
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

const appRoot = path.join(__dirname, '..', '..', '..', '..')

const envs: Envs = {
  environment,
  version,
  prerelease,
  appRoot,
}

export { environment, version, prerelease, appRoot }
export default envs
