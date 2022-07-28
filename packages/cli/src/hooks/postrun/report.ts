import { Hook } from '@oclif/core'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'

const hook: Hook<'postrun'> = async function (opts) {
  Reporter.Measure.shared(opts.Command.id, 'run').end()
  logger.debug('结束命令: ' + opts.Command.id)
  logger.debug('🔴 '.repeat(40))
}

export default hook
