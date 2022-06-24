import { Help } from '@oclif/core'
import { mainPkg } from '@whu-court/env'
import githubAuthManager from '@whu-court/github-auth'
import chalk from 'chalk'

export default class CustomHelp extends Help {
  async showHelp(args: string[]) {
    if (args.length) {
      return await super.showHelp(args)
    }
    if (githubAuthManager.confgured) {
      this.log(chalk.bold(mainPkg.description), chalk.gray(`\n\nRun ${chalk.green('wcr -h')} see more usages`))
    } else {
      this.log(
        chalk.bold(mainPkg.description),
        chalk.gray(`\n\nYou are not authed. Run ${chalk.green('wcr setup')} to continue`),
      )
    }
  }
}
