import { Hook } from '@oclif/core'
import UpdateManager from '@whu-court/auto-update'

const hook: Hook<'postrun'> = async function () {
  new UpdateManager().notify()
}

export default hook
