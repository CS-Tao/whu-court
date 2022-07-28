import { Hook } from '@oclif/core'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'

const hook: Hook<'prerun'> = async function (opts) {
  logger.debug('🟢 '.repeat(40))
  logger.debug('运行命令: ' + opts.Command.id)
  Reporter.init({
    user: {
      id: configManager.get(ConfigKey.githubId) as number,
      username: configManager.get(ConfigKey.githubUserName) as string,
      account: configManager.get(ConfigKey.courtAccount) as string,
    },
  })
  Reporter.Measure.shared(opts.Command.id, 'run').start()
}

export default hook
