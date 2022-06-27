import Conf from 'conf'
import { mainPkg } from '@whu-court/env'
import { defaultValues, rules } from './const'
import { ConfigKey, ConfigTypes } from './types'

type ErrMsg = string | void

// prettier-ignore
class ConfigManager implements Iterable<[keyof ConfigTypes, ConfigTypes[keyof ConfigTypes]]> {
  constructor() {
    const configName = process.env.NODE_ENV === 'development' ? `${mainPkg.name}-development` : mainPkg.name
    this.conf = new Conf<ConfigTypes>({
      configName,
      projectName: configName,
      projectVersion: mainPkg.version,
    })
  }

  private conf: Conf<ConfigTypes>;

  *[Symbol.iterator](): IterableIterator<[keyof ConfigTypes, ConfigTypes[keyof ConfigTypes]]> {
    for (const [key, value] of Object.entries(this.conf.store)) {
      yield [key as keyof ConfigTypes, value]
    }
  }

  get(key: ConfigKey) {
    if (defaultValues[key]) {
      return this.conf.get<ConfigKey>(key, defaultValues[key] as ConfigTypes[ConfigKey])
    }
    return this.conf.get<ConfigKey>(key)
  }

  set<Key extends ConfigKey>(key: Key, value: ConfigTypes[Key]): ErrMsg {
    const validateErrMsg = this.validate(key, value)
    if (validateErrMsg) {
      return validateErrMsg
    }
    this.conf.set<ConfigKey>(key, value)
  }

  validate<Key extends ConfigKey>(key: Key, value: ConfigTypes[Key]): ErrMsg {
    // @ts-ignore
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
}

const configManager = new ConfigManager()

export { ConfigKey, ConfigTypes }
export default configManager
