import { Command, Flags } from '@oclif/core'
import inquirer from 'inquirer'
import configManager, { ConfigKey } from '@whu-court/config-manager'

export default class Run extends Command {
  static description = 'Run app to reserve.'

  static examples = ['$ wcr run -y']

  static flags = {
    yes: Flags.boolean({ char: 'y', description: 'Use default config and do not prompt', required: false }),
    time: Flags.string({
      char: 't',
      description: 'Reserve time. e.g. 15-17,18-21,!8-12',
      required: false,
    }),
    courts: Flags.string({
      char: 'c',
      description: 'Reserve courts. e.g. ze,xb,fy,gr,gt,yxb,sq',
      required: false,
    }),
    now: Flags.boolean({
      char: 'n',
      description: 'Reserve now',
      required: false,
    }),
    'open-time': Flags.string({
      char: 'o',
      description: 'Open time. e.g. 8:00',
      required: false,
    }),
    'no-try': Flags.boolean({
      char: 'x',
      description: 'Do not try to reserve',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Run)

    const yes = flags.yes

    if (!yes) {
      const { time, courts, openTime } = await inquirer.prompt([
        {
          type: 'time',
          name: 'time',
          message: 'Reserve time',
          default: configManager.get(ConfigKey.time) as string,
        },
        {
          type: 'courts',
          name: 'courts',
          message: 'Reserve courts',
          default: configManager.get(ConfigKey.courts) as string,
        },
        {
          type: 'time',
          name: 'openTime',
          message: 'Open time',
          default: configManager.get(ConfigKey.openTime) as string,
        },
      ])

      this.log(`yes: ${yes}`)
      this.log(`Reserve time: ${time}`)
      this.log(`Reserve courts: ${courts}`)
      this.log(`Open time: ${openTime}`)
    }
  }
}
