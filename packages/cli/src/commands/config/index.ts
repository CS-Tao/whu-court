import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import Table from 'cli-table3'
import configManager from '@whu-court/config-manager'
import { configs } from '../../const'

const table = new Table({
  head: ['Key', 'Value', 'Description'],
  wordWrap: true,
  wrapOnWordBoundary: false,
  style: {
    head: ['green', 'bold'],
  },
})

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
