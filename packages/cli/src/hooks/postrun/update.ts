import { Hook } from '@oclif/core'
import chalk from 'chalk'
import UpdateManager from '@whu-court/auto-update'
import { environment } from '@whu-court/env'

const hook: Hook<'postrun'> = async function () {
  if (environment === 'local') {
    this.log(chalk.gray('[LOCAL]'), chalk.yellow('Run notify update'))
  }
  new UpdateManager().notify()
}

export default hook
