import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import githubAuthManager from '@whu-court/github-auth'
import http from '@whu-court/http'
import { AuthManager } from '@whu-court/runtime'
import { askCourtSid, askCourtToken } from '../../utils/ask'
import Loading from '../../utils/loading'
import { printInBlackListInfo } from '../../utils/print'

export default class Login extends Command {
  static description = 'Login to court.'

  static examples = ['$ wcr login', '$ wcr login --token=<***> --sid=<***>']

  static flags = {
    token: Flags.string({
      char: 't',
      description: 'Court token',
    }),
    sid: Flags.string({
      char: 's',
      description: 'Court session id',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Login)

    const token = flags.token || (await askCourtToken())
    const sid = flags.sid || (await askCourtSid())

    const load = new Loading('登录中').start()
    const authManager = new AuthManager(http)

    try {
      const account = await authManager.login(token, sid)
      load.stop()
      if (githubAuthManager.checkIfInBlackList([account])) {
        authManager.logout()
        this.log('当前账号', chalk.gray(account))
        printInBlackListInfo()
        return
      }
      this.log(chalk.green('🎉 登录成功'), '账号', chalk.gray(account))
    } catch (error) {
      load.stop()
      if (error instanceof Error) {
        authManager.logout()
        this.log(chalk.red('🙁 登录失败'))
      }
      throw error
    }
  }
}
