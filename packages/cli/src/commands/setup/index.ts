import chalk from 'chalk'
import { Command, Flags } from '@oclif/core'
import logger from '@whu-court/logger'
import githubAuthManager from '@whu-court/github-auth'
import { askGitHubToken } from '../../utils/ask'
import { printLogo } from '../../utils/print'
import Loading from '../../utils/loading'

export default class Setup extends Command {
  static description = '初始化应用'

  static examples = ['$ wcr setup', '$ wcr setup --github-token=<***>']

  static flags = {
    'github-token': Flags.string({
      char: 't',
      description: 'GitHub token',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Setup)

    const githubToken = flags['github-token'] || (await askGitHubToken())

    const load = new Loading('验证中...').start()

    try {
      if (!(await githubAuthManager.checkIfStared(githubToken))) {
        load.stop()
        printLogo(false)
        logger.log(chalk.red('你还没有 star 应用，请先 star 应用:'), chalk.gray(githubAuthManager.repoLink))
        return
      }
      load.stop()
      printLogo(true)
      if (githubAuthManager.userInfo) {
        logger.log(
          chalk.green('🎉 配置成功'),
          'GitHub:',
          chalk.gray(githubAuthManager.userInfo.nickName || githubAuthManager.userInfo.name),
        )
        return
      }
      logger.log(chalk.red('🙁 配置失败'))
    } catch (error) {
      load.stop()
      if (error instanceof Error) {
        githubAuthManager.clearInfos()
        printLogo(false)
        logger.error(error.message)
      }
    }
  }
}
