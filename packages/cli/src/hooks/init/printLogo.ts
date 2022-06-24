import { Hook } from '@oclif/core'
import githubAuthManager from '@whu-court/github-auth'
import { printLogo } from '../../utils/print'

const hook: Hook<'init'> = async function (options) {
  if (!options.id || ['-h', '--help', '-v', '--version'].includes(options.id)) {
    printLogo(githubAuthManager.confgured)
  }
}

export default hook
