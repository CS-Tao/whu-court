import { Command } from '@oclif/core'
import chalk from 'chalk'
import { AuthManager } from '@whu-court/core'
import http from '@whu-court/http'

export default class Logout extends Command {
  static description = 'Logout from court.'

  static examples = ['$ wcr logout']

  async run(): Promise<void> {
    await new AuthManager(http).logout()
    this.log(chalk.green('完成'))
  }
}
