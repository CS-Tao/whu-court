import { Hook } from '@oclif/core'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import Reporter from '@whu-court/report'

const hook: Hook<'prerun'> = async function (opts) {
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
