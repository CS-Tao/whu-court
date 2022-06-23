import { Help } from '@oclif/core'
import chalk from 'chalk'

const desc = '场馆预约助手'

export default class CustomHelp extends Help {
  async showHelp(args: string[]) {
    if (args.length) {
      await super.showHelp(args)
    } else {
      this.log(`${desc}\n\nRun ${chalk.green('wcr -h')} see more usages`)
    }
  }
}
