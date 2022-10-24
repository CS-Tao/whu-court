import chalk from 'chalk'
import Conf from 'conf'
import fs from 'fs-extra'
import { allowedProcessEnv, mainPkg } from '@whu-court/env'
import { defaultValues, rules } from './const'
import { ConfigKey, ConfigTypes } from './types'

type ErrMsg = string | void

// prettier-ignore
class ConfigManager implements Iterable<[keyof ConfigTypes, ConfigTypes[keyof ConfigTypes]]> {
  constructor() {
    if (allowedProcessEnv.WCR_CONFIG_NAME) {
      // eslint-disable-next-line no-console
      console.info(chalk.gray('[CONFIG]'), 'using config', chalk.green(allowedProcessEnv.WCR_CONFIG_NAME))
    }
    const configName = `${allowedProcessEnv.NODE_ENV || 'production'}/${allowedProcessEnv.WCR_CONFIG_NAME || 'default'}`

    this.conf = new Conf<ConfigTypes>({
      configName,
      projectName: mainPkg.name,
      projectVersion: mainPkg.version,
    })
    this.configDir = this.conf.path.replace(`/${configName}.json`, '')
  }

  private conf: Conf<ConfigTypes>;
  private configDir: string;

  *[Symbol.iterator](): IterableIterator<[keyof ConfigTypes, ConfigTypes[keyof ConfigTypes]]> {
    for (const [key, value] of Object.entries(this.conf.store)) {
      yield [key as keyof ConfigTypes, value]
    }
  }

  get(key: ConfigKey) {
    const value = this.conf.get<ConfigKey>(key)
    if (typeof value === 'undefined') {
      return this.conf.get<ConfigKey>(key, defaultValues[key] as ConfigTypes[ConfigKey])
    }
    return value
  }

  set<Key extends ConfigKey>(key: Key, value: ConfigTypes[Key]): void {
    const validateErrMsg = this.validate(key, value)
    if (validateErrMsg) {
      throw Error(validateErrMsg)
    }
    this.conf.set<ConfigKey>(key, value)
  }

  validate<Key extends ConfigKey>(key: Key, value: ConfigTypes[Key]): ErrMsg {
    return rules[key](value)
  }

  has(key: ConfigKey) {
    return this.conf.has<ConfigKey>(key)
  }

  delete(key: ConfigKey) {
    this.conf.delete<ConfigKey>(key)
  }

  clear() {
    this.conf.clear()
  }

  reset() {
    this.clear()
    fs.removeSync(this.configDir)
  }
}

const configManager = new ConfigManager()

export { ConfigKey, ConfigTypes }
export default configManager
