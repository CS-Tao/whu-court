import { Hook } from '@oclif/core'
import Reporter from '@whu-court/reporter'

const hook: Hook<'postrun'> = async function (opts) {
  Reporter.Measure.shared(opts.Command.id, 'run').end()
}

export default hook
