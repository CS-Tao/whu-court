import { Hook } from '@oclif/core'
import chalk from 'chalk'
import githubAuthManager from '@whu-court/github-auth'
import Reporter from '@whu-court/reporter'

const hook: Hook<'prerun'> = async function (opts) {
  if (!githubAuthManager.confgured && opts.Command.id !== 'setup') {
    this.log(chalk.gray(`You are not authed. Run ${chalk.green('wcr setup')} to continue`))
    process.exit(0)
  }
  githubAuthManager.checkIfConfigured()
  Reporter.Measure.shared(opts.Command.id, 'run').start()
}

export default hook
