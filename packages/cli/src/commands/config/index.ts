import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import Table from 'cli-table3'
import configManager, { ConfigKey } from '@whu-court/config-manager'

const table = new Table({
  head: ['Key', 'Value', 'Description'],
  wordWrap: true,
  wrapOnWordBoundary: false,
  style: {
    head: ['green', 'bold'],
  },
})

const configs: Array<{
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
    serialize: (value) => (typeof value === 'object' && value.length ? value.join(',') : String(value)),
    deserialize: (value) => value.split(','),
  },
]

export default class Config extends Command {
  static description = 'Manage court configs.'

  static examples = ['$ wcr config -l', '$ wcr config time', '$ wcr config time 15-17,18-21,!8-12']

  static flags = {
    list: Flags.boolean({
      char: 'l',
      description: 'show list',
      required: false,
    }),
    reset: Flags.boolean({
      char: 'r',
      description: 'reset configs',
      required: false,
    }),
  }

  static args = [
    { name: 'configName', description: 'config name', required: false },
    { name: 'configValue', description: 'config value', required: false },
  ]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Config)

    const reset = flags.reset

    if (reset) {
      const currentValues = configs.map((config) => {
        const key = config.key
        const previous = config.serialize(configManager.get(key))
        configManager.delete(key)
        const value = config.serialize(configManager.get(key))
        return {
          previous,
          value,
          ...config,
        }
      })

      currentValues.forEach(({ name, value, previous, desc }) => {
        table.push([
          name,
          previous === value
            ? `${value} (${chalk.yellow('not changed')})`
            : `${chalk.strikethrough(chalk.red(previous))} => ${chalk.green(value)}`,
          desc,
        ])
      })
      this.log(table.toString())
      return
    }

    const showList = flags.list

    if (showList) {
      configs.forEach(({ name, key, desc, serialize }) => table.push([name, serialize(configManager.get(key)), desc]))
      this.log(table.toString())
      return
    }

    const configName = args.configName
    const config = configs.find((item) => item.name === configName)
    const configValue = args.configValue

    if (!configName) {
      this.error('missing config name')
      return
    }

    if (!config) {
      this.error(`'${configName}' not a valid config name`)
      return
    }

    if (configName && !configValue) {
      table.push([config.name, config.serialize(configManager.get(config.key)), config.desc])
      this.log(table.toString())
      return
    }

    if (configName && configValue) {
      const previous = configManager.get(config.key)
      configManager.set(config.key, config.deserialize(configValue))
      const value = config.serialize(configManager.get(config.key))
      table.push([
        config.name,
        previous === value
          ? `${value} (${chalk.yellow('not changed')})`
          : `${chalk.strikethrough(chalk.red(previous))} => ${chalk.green(value)}`,
        config.desc,
      ])
      this.log(table.toString())
    }

    throw Error('Unreachable')
  }
}
