import { Hook } from '@oclif/core'
import md5 from 'md5'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import { loverGitHubName } from '@whu-court/env'
import githubAuthManager from '@whu-court/github-auth'
import logger from '@whu-court/logger'
import { pink } from '../../utils/colors'
import {
  printInBlackListInfo,
  printNotAuthedInfo,
  printNotAvailableInfo,
  printNotInWhiteListInfo,
} from '../../utils/print'

const hook: Hook<'prerun'> = async function (opts) {
  if (['setup', 'help', 'logout'].includes(opts.Command.id)) return
  if (githubAuthManager.userInfo?.name === loverGitHubName) {
    logger.info(pink('💖 欢迎小仙女 💖'))
    return
  }

  // 软件可用性
  if (!githubAuthManager.appConfig.available) {
    printNotAvailableInfo()
    process.exit(0)
  }

  // 用户授权
  if (!githubAuthManager.confgured) {
    printNotAuthedInfo()
    process.exit(0)
  }

  // 用户白名单
  if (!githubAuthManager.checkIfInWhiteList([md5(configManager.get(ConfigKey.courtAccount) as string)])) {
    printNotInWhiteListInfo()
    process.exit(0)
  }

  // 用户黑名单
  if (githubAuthManager.checkIfInBlackList([md5(configManager.get(ConfigKey.courtAccount) as string)])) {
    printInBlackListInfo()
    process.exit(0)
  }

  // 异步校验
  githubAuthManager.checkIfConfigured()
  githubAuthManager.checkConfig()
}

export default hook
