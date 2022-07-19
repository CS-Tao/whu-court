import { Hook } from '@oclif/core'
import { loverGitHubName } from '@whu-court/env'
import githubAuthManager from '@whu-court/github-auth'
import { pink } from '../../utils/colors'

const hook: Hook<'postrun'> = async function () {
  if (githubAuthManager.userInfo?.name === loverGitHubName) {
    this.log(pink('\n💖 小仙女下次见 💖'))
  }
}

export default hook
