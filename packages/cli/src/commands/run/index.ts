import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { ReserveManager } from '@whu-court/core'
import logger from '@whu-court/logger'

export default class Run extends Command {
  static description = 'Run app to reserve.'

  static examples = ['$ wcr run']

  static flags = {
    'open-time': Flags.string({
      char: 'o',
      description: 'Court system open time. e.g. "18:00:00" | "now"',
      required: false,
    }),
    today: Flags.boolean({
      description: 'Reserve for today',
      required: false,
    }),
  }

  static args = []

  async run(): Promise<void> {
    const { flags } = await this.parse(Run)

    const openTime = flags['open-time']
    const reserveToday = flags.today

    if (openTime && !/\d{2}:\d{2}:\d{2}/.test(openTime) && openTime !== 'now') {
      return logger.error(`🙅‍ open-time(${openTime}) 格式错误，应为 "HH:mm:ss" or "now"`)
    }

    openTime && logger.debug(chalk.gray('[INFO] ') + '--open-time ' + chalk.green(`${openTime}`))
    reserveToday && logger.debug(chalk.gray('[INFO] ') + '--today ' + chalk.green('true'))

    await new ReserveManager({ openTime, reserveToday }).run()
  }
}
