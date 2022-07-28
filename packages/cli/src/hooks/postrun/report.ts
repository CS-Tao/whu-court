import { Hook } from '@oclif/core'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'

const hook: Hook<'postrun'> = async function (opts) {
  Reporter.Measure.shared(opts.Command.id, 'run').end()
  logger.debug('退出软件')
  logger.debug('🔴 '.repeat(40))
}

export default hook
