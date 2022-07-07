import chalk from 'chalk'
import http from '@whu-court/http'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/reporter'
import { Loading, getCurrentTime, sleep } from '@whu-court/utils'
import { getApiMap } from '../../apis'
import AuthManager from '../AuthManager'
import BaseManager from '../BaseManager'

const ONE_MINITE = 60 * 1000

class ReserveManager extends BaseManager {
  constructor() {
    super(http, getApiMap(http))
  }

  /**
   * 检查场馆是否开放时，每分钟允许失败的次数，超过此次数退出
   */
  checkOpenAllowFailTimesPerMin = 5

  async run() {
    if (!(await this.checkLoginStatus())) return
    await this.checkOpen()
    await this.reserve()
  }

  private async checkLoginStatus() {
    const loading = new Loading('检查登录状态').start()

    const authManager = new AuthManager(http)

    if (!authManager.logined) {
      loading.fail(`🙁 你尚未登陆，请运行 ${chalk.green('wcr login')} 登录`)
      return false
    }

    const status = await authManager.validate()

    if (!status || !authManager.userInfo?.account) {
      loading.fail(`🙁 登录信息已失效，请运行 ${chalk.green('wcr login')} 重新登录`)
      return false
    }

    loading.succeed('检查登录状态完成，信息有效 ' + chalk.gray(authManager.userInfo?.account))

    return true
  }

  private async checkOpen() {
    const loading = new Loading(`等待场馆后台开放，检查第 ${chalk.green(1)} 次`).start()

    const errors = []
    let lastTimeWindow = Date.now()
    let checkTimes = 0
    let failTimes = 0
    let isOpen = false

    await this.fetchTypeIdAndPlaceId()

    while (!isOpen) {
      try {
        await sleep(this.config.checkInterval)
        isOpen = await this.checkFirstCourtIsOpen()
        checkTimes++
        isOpen
          ? loading.succeed('场馆后台已开放，当前时间是 ' + chalk.gray(getCurrentTime(true)))
          : loading.setText(`等待场馆后台开放，检查第 ${chalk.green(checkTimes)} 次`)
      } catch (error) {
        if (error instanceof Error) {
          Reporter.report(error)
        }

        if (lastTimeWindow + ONE_MINITE < Date.now()) {
          errors.length = 0
          failTimes = 0
          lastTimeWindow = Date.now()
        }

        failTimes++
        errors.push(error)

        if (failTimes > this.checkOpenAllowFailTimesPerMin) {
          loading.fail('等待场馆后台开放')

          logger.info(
            chalk.red(
              `网络请求失败次数超过限制(${this.checkOpenAllowFailTimesPerMin}次/分钟)，退出应用，累计错误信息如下`,
            ),
          )

          errors.forEach(
            (each) =>
              each instanceof Error &&
              logger.info(chalk.gray(`[${each.name.toUpperCase()}]`), chalk.red(`${each.message}`)),
          )

          throw new Error(`网络请求失败次数超过限制(${this.checkOpenAllowFailTimesPerMin}次/分钟)，退出应用`)
        }
      }
    }
  }

  private async reserve() {
    logger.info('TODO reserve')
  }
}

export default ReserveManager
