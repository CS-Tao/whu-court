import UpdateNotifier from 'update-notifier'
import { allowedProcessEnv, environment, mainPkg } from '@whu-court/env'

const CHECK_INTERVAL = {
  ONE_DAY: 1000 * 60 * 60 * 24,
  ALWAYS: 1,
}

const DIST_TAG_MAP: Record<typeof environment, 'alpha' | 'beta' | 'latest'> = {
  local: 'alpha',
  staging: 'alpha',
  gray: 'beta',
  production: 'latest',
}

export default class AutoUpdateManager {
  constructor() {
    if (AutoUpdateManager.instance) {
      return AutoUpdateManager.instance
    }
    this.mainPkg = mainPkg
    this.notifier = UpdateNotifier({
      pkg: this.mainPkg,
      updateCheckInterval: environment === 'production' ? CHECK_INTERVAL.ONE_DAY : CHECK_INTERVAL.ALWAYS,
      distTag: DIST_TAG_MAP[environment],
      shouldNotifyInNpmScript: Boolean(allowedProcessEnv.DEBUG_UPDATE_NOTIFIER),
    })
    AutoUpdateManager.instance = this
    return AutoUpdateManager.instance
  }

  static instance: AutoUpdateManager

  private mainPkg?: UpdateNotifier.Package
  private notifier?: UpdateNotifier.UpdateNotifier

  notify() {
    this.notifier?.notify()
  }
}
