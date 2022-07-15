import chalk from 'chalk'
import inquirer from 'inquirer'
import moment from 'moment'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import http from '@whu-court/http'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/reporter'
import { Loading, Notify, getCurrentTime, getTomorrowDate, sleep } from '@whu-court/utils'
import { getApiMap } from '../../apis'
import { CourtDetail, ReserveSetting } from '../../types'
import AuthManager from '../AuthManager'
import BaseManager from '../BaseManager'

const ONE_MINITE = 60 * 1000
const FOUR_MINITES = 4 * ONE_MINITE
const TEN_MINITES = 10 * ONE_MINITE

const formatCountdown = (until: number) => {
  const h = moment.duration(until - moment().valueOf()).hours()
  const m = moment.duration(until - moment().valueOf()).minutes()
  const s = moment.duration(until - moment().valueOf()).seconds()
  return (h > 9 ? h : `0${h}`) + ':' + (m > 9 ? m : `0${m}`) + ':' + (s > 9 ? s : `0${s}`)
}

export interface ReserveManagerOptions {
  autoConfirm?: boolean
  courtIds?: string[]
  backupCourtIds?: string[]
  reserveTime?: string
}

class ReserveManager extends BaseManager {
  constructor(private options: ReserveManagerOptions) {
    super(http, getApiMap(http))
  }

  /**
   * 检查场馆是否开放时，每分钟允许失败的次数，超过此次数退出
   */
  private checkOpenAllowFailTimesPerMin = 5
  private reserveSetting: ReserveSetting = { minRequests: 0, requestDataList: [] }

  async run() {
    // 检查登录状态
    if (!(await this.checkLoginStatus())) return

    // 拉取基础信息
    await this.fetchTypeIdAndPlaceId(true)

    // 生成预约请求数据
    await this.generateReserveSetting()

    // 检查当前时间是否可以启动应用。因为需要输入微信登录码，有效期只有 5 分钟，所以只能在开放前四分钟启动
    if (!(await this.checkCanRun())) return

    // 提示用户输入微信登录码
    await this.promptWxCodes()

    // 检查场馆是否开放
    await this.checkOpen()

    // 开始抢场地
    await this.reserve()
  }

  private async generateReserveSetting() {
    const autoConfirm = this.options.autoConfirm || false

    if (!autoConfirm || !this.config.courts?.length || !this.config.fields?.length || !this.config.reserveTime) {
      const loadCourtsListLoading = new Loading('加载场馆列表').start()
      const courts = await this.getCourtList()
      loadCourtsListLoading.succeed('加载场馆列表')
      const { courtId } = await inquirer.prompt<{ courtId: string }>([
        {
          type: 'list',
          name: 'courtId',
          message: '场馆',
          default: this.config.courts[0],
          choices: courts.map((court) => ({
            name:
              court.name +
              (court.tag ? chalk.gray(` [${court.tag}]`) : '') +
              (court.isOpen ? '' : chalk.red(' [已闭馆]')),
            value: court.id,
            disabled: !court.isOpen,
          })),
        },
      ])
      this.config.courts = [courtId]
      configManager.set(ConfigKey.courts, [courtId])

      const court = courts.find((c) => c.id === courtId)

      if (!court) {
        throw new Error('运行逻辑出错，场馆不存在')
      }

      const { filedIds } = await inquirer.prompt<{ filedIds: string[] }>([
        {
          type: 'checkbox',
          name: 'filedIds',
          message: '选择场地',
          default: this.config.fields,
          choices: court.fields.map((field) => ({
            name:
              field.name +
              (field.tag ? chalk.gray(` [${field.tag}]`) : '') +
              (field.isOpen ? '' : chalk.red(' [被占用]')),
            value: field.id,
            disabled: !field.isOpen,
          })),
        },
      ])
      this.config.fields = filedIds
      configManager.set(ConfigKey.fields, filedIds)

      const backupFieldChoices = court.fields
        .filter((each) => !filedIds.includes(each.id))
        .map((field) => ({
          name:
            field.name +
            (field.tag ? chalk.gray(` [${field.tag}]`) : '') +
            (field.isOpen ? '' : chalk.red(' [被占用]')),
          value: field.id,
          disabled: !field.isOpen,
        }))

      let backupFieldIds: string[] = []
      if (backupFieldChoices.length) {
        backupFieldIds = (
          await inquirer.prompt<{ backupFieldIds: string[] }>([
            {
              type: 'checkbox',
              name: 'backupFieldIds',
              message: '选择备用场地',
              default: this.config.backupFields,
              choices: backupFieldChoices,
            },
          ])
        ).backupFieldIds
      }
      this.config.backupFields = backupFieldIds
      configManager.set(ConfigKey.backupFields, backupFieldIds)

      const allFields = court.fields.filter((each) => [...filedIds, ...backupFieldIds].includes(each.id))

      const reserveTimeChoices = [8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20]
        .map((each) => {
          const nextHour = each + 1
          const format = (h: number) => (h < 10 ? '0' + h : h)
          return {
            name: `${format(each)}:00-${format(nextHour)}:00`,
            value: `${format(each)}:00-${format(nextHour)}:00`,
          }
        })
        .reverse()

      const { reserveTime } = await inquirer.prompt<{ reserveTime: string[] }>([
        {
          type: 'checkbox',
          name: 'reserveTime',
          message: '选择时间',
          default: this.config.reserveTime.split(','),
          choices: reserveTimeChoices,
          loop: false,
        },
      ])
      this.config.reserveTime = reserveTime.reverse().join(',')
      configManager.set(ConfigKey.time, this.config.reserveTime)

      const loadDetailLoading = new Loading('生成预约信息').start()
      const fieldDetailMap: Record<string, CourtDetail> = {}
      for (const idx in allFields) {
        const f = allFields[idx]
        const fieldDetail = await this.getFieldDetail(courtId, f.id, f.number)
        fieldDetailMap[f.id] = fieldDetail
      }

      this.reserveSetting = {
        minRequests: filedIds.length,
        requestDataList: allFields.map((field) => {
          const fieldDetail = fieldDetailMap[field.id]
          return {
            appointmentDate: getTomorrowDate(),
            creatorId: this.config.token,
            placeType: 1,
            period: this.config.reserveTime,
            fieldId: field.id,
            motionTypeId: this.badmintonTypeId,
            placeId: court.id,
            typeName: '羽毛球',
            placeUrl: court.placeUrl,
            placeAddress: fieldDetail.placeAddress,
            placeName: fieldDetail.placeName,
            fieldNum: field.name,
            collegeName: fieldDetail.collegeName,
            collegeId: fieldDetail.collegeId,
            code: '',
          }
        }),
      }
      loadDetailLoading.succeed('生成预约信息')
    }
  }

  private async promptWxCodes(): Promise<void> {
    for (const idx in this.reserveSetting.requestDataList) {
      const codes = this.reserveSetting.requestDataList.map(({ code }) => code)
      const requestData = this.reserveSetting.requestDataList[idx]
      const { code } = await inquirer.prompt({
        type: 'input',
        name: 'code',
        message: `请输入场地 ${requestData.fieldNum} 的微信登录码`,
      })
      if (!code) throw Error('登录码不能为空')
      if (codes.includes(code)) throw Error('登录码重复')
      this.reserveSetting.requestDataList[idx].code = code
    }
  }

  private async checkCanRun(): Promise<boolean> {
    const openTimeMs = moment(this.config.openTime, 'HH:mm:ss').valueOf()
    const nowMs = moment().valueOf()
    const diffMs = openTimeMs - nowMs
    if (diffMs < FOUR_MINITES) {
      return true
    }
    logger.info(chalk.yellow(`请于场馆开放前四分钟启动本应用，还需等待 ${formatCountdown(openTimeMs - FOUR_MINITES)}`))
    const { wait } = await inquirer.prompt({
      type: 'confirm',
      name: 'wait',
      message: '是否等待倒计时完成？',
      default: diffMs < TEN_MINITES,
    })
    if (!wait) {
      return false
    }
    await this.countdown(openTimeMs - FOUR_MINITES)
    Notify.notify('提示', '倒计时完成，请继续')
    return true
  }

  private async countdown(until: number) {
    return new Promise<void>((resolve) => {
      const formatLoadingText = () =>
        chalk.blue('等待倒计时完成 ' + formatCountdown(until) + chalk.gray(' (Type `Ctrl/⌘ + C` to exit)'))
      const loading = new Loading(formatLoadingText()).start()
      setInterval(() => {
        const nowMs = moment().valueOf()
        if (until - nowMs <= 0) {
          resolve()
        }
        loading.setText(formatLoadingText())
      }, 1000)
    })
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
    const courtCount = this.reserveSetting.minRequests
    const promises = this.reserveSetting.requestDataList.slice(0, courtCount).map(this.reserveField)
    const backupCount = this.reserveSetting.requestDataList.length - courtCount
    const failedList: Array<{ placeName: string; fieldNum: string; error: string }> = []
    const successedList: Array<{ placeName: string; fieldNum: string }> = []
    promises.forEach(async (request, idx) => {
      const res = await this.loopReverve(request)
      const requestData = this.reserveSetting.requestDataList[idx]
      if (res === true) {
        successedList.push({
          placeName: requestData.placeName,
          fieldNum: requestData.fieldNum,
        })
      } else {
        failedList.push({
          placeName: requestData.placeName,
          fieldNum: requestData.fieldNum,
          error: res,
        })
      }
    })
    if (failedList.length > 0 && backupCount > 0) {
      logger.info(chalk.yellow(`有 ${failedList.length} 个场馆预约失败，尝试预约备用场地`))
      const backupPromise = this.reserveSetting.requestDataList
        .slice(courtCount, courtCount + Math.min(courtCount + backupCount))
        .map(this.reserveField)
      backupPromise.forEach(async (backupRequest, backupIdx) => {
        const res = await this.loopReverve(backupRequest)
        const requestData = this.reserveSetting.requestDataList[backupIdx]
        if (res === true) {
          successedList.push({
            placeName: requestData.placeName,
            fieldNum: requestData.fieldNum,
          })
        } else {
          failedList.push({
            placeName: requestData.placeName,
            fieldNum: requestData.fieldNum,
            error: res,
          })
        }
      })
    }

    if (failedList.length > 0) {
      this.notifyFailedReserved(
        failedList[0].placeName,
        failedList.map((each) => each.fieldNum),
        failedList.map((each) => each.error),
      )
    }

    if (successedList.length > 0) {
      this.notifySuccessReserved(
        successedList[0].placeName,
        successedList.map((each) => each.fieldNum),
      )
    }
  }

  private async loopReverve(request: Promise<{ status: 1 | unknown }>, tryTimes = 3): Promise<string | true> {
    let hasTriedTimes = 0
    try {
      const res = await request
      if (res.status !== 1) {
        return '已被预约'
      }
      return true
    } catch (error) {
      if (error instanceof Error) {
        Reporter.report(error)
      }
      hasTriedTimes++
      if (hasTriedTimes > tryTimes) {
        if (error instanceof Error) {
          return error.message
        }
        return '未知错误'
      }
      return this.loopReverve(request)
    }
  }

  private notifySuccessReserved(name: string, fieldNums: string[]) {
    logger.info(chalk.green(`🎉 ${name}-${fieldNums.join(',')} 号场地预约成功`))
  }

  private notifyFailedReserved(name: string, fieldNums: string[], errors: string[]) {
    logger.info(chalk.red(`❌ ${name}-${fieldNums.join(',')} 号场地预约失败`), '\n', chalk.gray(errors.join('\n')))
  }
}

export default ReserveManager
