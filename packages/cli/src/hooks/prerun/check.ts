import { Hook } from '@oclif/core'
import githubAuthManager from '@whu-court/github-auth'
import Reporter from '@whu-court/reporter'
import chalk from 'chalk'

const hook: Hook<'prerun'> = async function (opts) {
  if (!githubAuthManager.confgured) {
    this.log(chalk.gray(`You are not authed. Run ${chalk.green('wcr setup')} to continue`))
    process.exit(0)
  }
  Reporter.Measure.shared(opts.Command.id, 'run').start()
}

export default hook
