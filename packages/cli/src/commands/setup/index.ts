import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import Listr from 'listr'
import githubAuthManager from '@whu-court/github-auth'
import logger from '@whu-court/logger'
import { ErrorNoNeedReport } from '@whu-court/logger/dist/errors'
import { askGitHubToken } from '../../utils/ask'
import { printInBlackListInfo, printLogo, printNotAvailableInfo } from '../../utils/print'

export default class Setup extends Command {
  static description = 'Setup wcr cli.'

  static examples = ['$ wcr setup', '$ wcr setup --github-token=<***>']

  static flags = {
    'github-token': Flags.string({
      char: 't',
      description: 'GitHub token',
    }),
    'clear-token': Flags.boolean({
      char: 'c',
      description: 'clear github auth',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Setup)

    const clearToken = flags['clear-token'] || false

    if (clearToken) {
      githubAuthManager.clearUserInfos()
      printLogo(false)
      return logger.log(chalk.gray('完成'))
    }

    const githubToken = flags['github-token'] || (await askGitHubToken())

    const tasks = new Listr([
      {
        title: '校验可用性',
        task: async () => {
          await githubAuthManager.checkConfig()
          if (!githubAuthManager.appConfig.available) {
            throw new ErrorNoNeedReport(printNotAvailableInfo(true))
          }
        },
      },
      {
        title: '获取用户信息',
        task: async () => {
          await githubAuthManager.saveUserInfos(githubToken)
          if (githubAuthManager.checkIfInBlackList()) {
            githubAuthManager.clearUserInfos()
            throw new ErrorNoNeedReport(printInBlackListInfo(true))
          }
        },
      },
      {
        title: '校验授权状态',
        task: async () => {
          if (!(await githubAuthManager.checkIfStared(githubToken))) {
            githubAuthManager.clearUserInfos()
            throw new ErrorNoNeedReport(
              [chalk.red('为了方便管理员统计使用量，请先 star 应用:'), chalk.gray(githubAuthManager.repoLink)].join(
                ' ',
              ),
            )
          }
        },
      },
    ])

    try {
      await tasks.run()

      if (githubAuthManager.userInfo) {
        printLogo(true)
        return logger.log(
          chalk.green('🎉 配置成功'),
          'GitHub:',
          chalk.gray(githubAuthManager.userInfo.nickName || githubAuthManager.userInfo.name),
        )
      }
      logger.log(chalk.red('🙁 配置失败'))
    } catch (error) {
      if (error instanceof Error) {
        githubAuthManager.clearUserInfos()
        printLogo(false)
        logger.log(chalk.red('🙁 配置失败'))
      }
      throw error
    }
  }
}
