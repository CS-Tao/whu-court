import { Command } from '@oclif/core'
import chalk from 'chalk'
import http from '@whu-court/http'
import logger from '@whu-court/logger'
import { AuthManager } from '@whu-court/runtime'

export default class Logout extends Command {
  static description = 'Logout from court'

  static examples = ['$ wcr logout']

  async run(): Promise<void> {
    await new AuthManager(http).logout()
    logger.log(chalk.green('完成'))
  }
}
