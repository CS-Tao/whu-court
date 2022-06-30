import { Hook } from '@oclif/core'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import githubAuthManager from '@whu-court/github-auth'
import { printInBlackListInfo, printNotAuthedInfo, printNotAvailableInfo } from '../../utils/print'

const hook: Hook<'prerun'> = async function (opts) {
  if (['setup', 'help', 'logout'].includes(opts.Command.id)) return

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

  // 用户黑名单
  if (githubAuthManager.checkIfInBlackList([configManager.get(ConfigKey.courtAccount) as string])) {
    printInBlackListInfo()
    process.exit(0)
  }

  // 异步校验
  githubAuthManager.checkIfConfigured()
  githubAuthManager.checkConfig()
}

export default hook
