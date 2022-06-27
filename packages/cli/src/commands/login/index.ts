import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import http from '@whu-court/http'
import logger from '@whu-court/logger'
import { AuthManager } from '@whu-court/runtime'
import { askCourtSid, askCourtToken } from '../../utils/ask'
import Loading from '../../utils/loading'

export default class Login extends Command {
  static description = 'Login to court'

  static examples = ['$ wcr login', '$ wcr login --token=<***>']

  static flags = {
    token: Flags.string({
      char: 't',
      description: 'Court token',
    }),
    sid: Flags.string({
      char: 'i',
      description: 'Court sid',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Login)

    const token = flags.token || (await askCourtToken())
    const sid = flags.sid || (await askCourtSid())

    const load = new Loading('登录中...').start()
    const authManager = new AuthManager(http)

    try {
      const account = await authManager.login(token, sid)
      load.stop()
      logger.log(chalk.green('🎉 登录成功'), '账号', chalk.gray(account))
    } catch (error) {
      load.stop()
      if (error instanceof Error) {
        authManager.logout()
        logger.log(chalk.red('🙁 登录失败'))
      }
      throw error
    }
  }
}
