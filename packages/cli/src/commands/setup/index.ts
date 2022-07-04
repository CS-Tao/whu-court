import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import inquirer from 'inquirer'
import Listr from 'listr'
import { loverGitHubName } from '@whu-court/env'
import githubAuthManager from '@whu-court/github-auth'
import logger from '@whu-court/logger'
import { ErrorNoNeedReport } from '@whu-court/logger/dist/errors'
import { askGitHubToken } from '../../utils/ask'
import {
  printInBlackListInfo,
  printLogo,
  printNotAvailableInfo,
  printNotInWhiteListInfo,
  printServiceItem,
} from '../../utils/print'

export default class Setup extends Command {
  static description = 'Setup app.'

  static examples = ['$ wcr setup', '$ wcr setup --github-token=<***>', '$ wcr setup --clear-token']

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

    printServiceItem()

    const { agree } = await inquirer.prompt({
      type: 'confirm',
      name: 'agree',
      message: '是否同意以上服务条款？',
      default: false,
    })

    if (!agree) {
      logger.log(chalk.red('🙁 配置失败。你未同意以上服务条款'))
      return
    }

    logger.log(chalk.green('你已同意以上服务条款'))

    const githubToken = flags['github-token'] || (await askGitHubToken())

    const tasks = new Listr([
      {
        title: '校验软件可用性',
        task: async () => {
          await githubAuthManager.checkConfig()
          if (!githubAuthManager.appConfig.available) {
            throw new ErrorNoNeedReport(printNotAvailableInfo(true))
          }
        },
      },
      {
        title: '验证用户信息',
        task: async (ctx, task) => {
          await githubAuthManager.saveUserInfos(githubToken)
          if (githubAuthManager.userInfo?.name === loverGitHubName) {
            task.skip('💖 小仙女可跳过验证阶段 💖')
            return
          }
          if (!githubAuthManager.checkIfInWhiteList()) {
            githubAuthManager.clearUserInfos()
            throw new ErrorNoNeedReport(printNotInWhiteListInfo(true))
          }
          if (githubAuthManager.checkIfInBlackList()) {
            githubAuthManager.clearUserInfos()
            throw new ErrorNoNeedReport(printInBlackListInfo(true))
          }
        },
      },
      {
        title: '检查授权状态',
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
        skip: () => {
          if (githubAuthManager.userInfo?.name === loverGitHubName) {
            return '💖 小仙女可跳过检查阶段 💖'
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
