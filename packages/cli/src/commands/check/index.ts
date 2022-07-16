import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import Table from 'cli-table3'
import moment from 'moment'
import { AuthManager } from '@whu-court/core'
import http from '@whu-court/http'
import { Loading } from '@whu-court/utils'

const table = new Table({
  head: ['Key', 'Value'],
  wordWrap: true,
  wrapOnWordBoundary: false,
  style: {
    head: ['green', 'bold'],
  },
})

export default class Check extends Command {
  static description = 'Check login status.'

  static examples = ['$ wcr check']

  static flags = {
    show: Flags.boolean({
      char: 's',
      description: 'show current token and session id in plain text',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const authManager = new AuthManager(http)
    if (!authManager.logined) {
      return this.log(chalk.red(`🙁 你尚未登陆，请运行 ${chalk.green('wcr login')} 登录`))
    }

    const loading = new Loading('检查中').start()

    const { flags } = await this.parse(Check)

    const showInPlainText = flags.show

    table.push(['account', authManager.getAccount()])
    table.push(['login time', moment(authManager.getLoginTime()).format('YYYY-MM-DD HH:mm:ss')])
    table.push(['x-outh-token', authManager.getToken(showInPlainText)])
    table.push(['x-outh-sid', authManager.getSid(showInPlainText)])
    table.push(['user-agent', authManager.getUserAgent().slice(0, 20) + '...'])

    const status = await authManager.validate()

    loading.stop()

    this.log(table.toString())

    if (!status || !authManager.userInfo?.account) {
      return this.log(chalk.red(`🙁 登录信息已失效，请运行 ${chalk.green('wcr login')} 重新登录`))
    }

    this.log(chalk.green('✔'), '登录信息有效')
  }
}
