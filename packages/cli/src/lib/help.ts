import { Help } from '@oclif/core'
import chalk from 'chalk'
import { mainPkg } from '@whu-court/env'
import githubAuthManager from '@whu-court/github-auth'
import { printNotAuthedInfo } from '../utils/print'

export default class CustomHelp extends Help {
  async showHelp(args: string[]) {
    if (args.length) {
      return await super.showHelp(args)
    }
    if (githubAuthManager.confgured) {
      this.log(chalk.bold(mainPkg.description), chalk.gray(`\n\nRun ${chalk.green('wcr -h')} see more usages`))
    } else {
      this.log(chalk.bold(mainPkg.description), '\n')
      printNotAuthedInfo()
    }
  }
}
