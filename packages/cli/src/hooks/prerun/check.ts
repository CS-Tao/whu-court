import { Hook } from '@oclif/core'
import chalk from 'chalk'
import md5 from 'md5'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import { loverGitHubName } from '@whu-court/env'
import githubAuthManager from '@whu-court/github-auth'
import logger from '@whu-court/logger'
import { Loading } from '@whu-court/utils'
import { pink } from '../../utils/colors'
import {
  printInBlackListInfo,
  printNotAuthedInfo,
  printNotAvailableInfo,
  printNotInWhiteListInfo,
} from '../../utils/print'

const check = (showLog = false) => {
  // 软件可用性
  if (!githubAuthManager.appConfig.available) {
    showLog && printNotAvailableInfo()
    return false
  }

  // 用户授权
  if (!githubAuthManager.confgured) {
    showLog && printNotAuthedInfo()
    return false
  }

  // 用户白名单
  if (!githubAuthManager.checkIfInWhiteList([md5(configManager.get(ConfigKey.courtAccount) as string)])) {
    showLog && printNotInWhiteListInfo()
    return false
  }

  // 用户黑名单
  if (githubAuthManager.checkIfInBlackList([md5(configManager.get(ConfigKey.courtAccount) as string)])) {
    showLog && printInBlackListInfo()
    return false
  }

  return true
}

const noNeedCheckCommands = ['announcement', 'feedback', 'reset', 'setup', 'help', 'logout']

const hook: Hook<'prerun'> = async function (opts) {
  if (noNeedCheckCommands.includes(opts.Command.id)) return

  if (githubAuthManager.userInfo?.name === loverGitHubName) {
    logger.info(pink('\n💖 欢迎小仙女 💖\n'))
    return
  }

  if (check()) {
    // 异步校验
    githubAuthManager.checkIfConfigured()
    githubAuthManager.checkConfig()
    return
  }

  // 同步校验
  const loading = new Loading('校验软件可用性').start()
  await githubAuthManager.checkIfConfigured()
  await githubAuthManager.checkConfig()
  loading.succeed(chalk.gray('校验软件可用性完成'))
  check(true) || process.exit(0)
}

export default hook
