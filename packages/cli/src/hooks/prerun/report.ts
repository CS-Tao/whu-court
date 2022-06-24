import { Hook } from '@oclif/core'
import Reporter from '@whu-court/reporter'

const hook: Hook<'prerun'> = async function (opts) {
  Reporter.Measure.shared(opts.Command.id, 'run').start()
}

export default hook
