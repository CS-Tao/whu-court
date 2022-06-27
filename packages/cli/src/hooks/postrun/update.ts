import { Hook } from '@oclif/core'
import chalk from 'chalk'
import UpdateManager from '@whu-court/auto-update'
import { environment } from '@whu-court/env'
import logger from '@whu-court/logger'

const hook: Hook<'postrun'> = async function () {
  if (environment === 'local') {
    logger.log(chalk.yellow('[local] Run notify update...'))
  }
  new UpdateManager().notify()
}

export default hook
