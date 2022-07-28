import chalk from 'chalk'
import inquirer from 'inquirer'
import moment from 'moment'
import { uid } from 'uid'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import http from '@whu-court/http'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'
import { Loading, Notify, formatBracket, getCurrentTime, getTodayDate, getTomorrowDate, sleep } from '@whu-court/utils'
import { getApiMap } from '../../apis'
import { ErrorNoNeedRetry } from '../../consts'
import { CourtDetail, CourtList, ReserveSetting } from '../../types'
import AuthManager from '../AuthManager'
import BaseManager from '../BaseManager'

const ONE_MINITE = 60 * 1000
const FOUR_MINITES = 4 * ONE_MINITE
const TEN_MINITES = 10 * ONE_MINITE
const FIVE_SECONDS = 10 * 1000

const formatCountdown = (until: number) => {
  const h = moment.duration(until - moment().valueOf()).hours()
  const m = moment.duration(until - moment().valueOf()).minutes()
  const s = moment.duration(until - moment().valueOf()).seconds()
  return (h > 9 ? h : `0${h}`) + ':' + (m > 9 ? m : `0${m}`) + ':' + (s > 9 ? s : `0${s}`)
}

type FailedList = Array<{ placeName: string; fieldNum: string; error: string; isBackup: boolean }>
type SuccessedList = Array<{
  placeName: string
  fieldNum: string
  isBackup: boolean
  period: string
  isFallbacked: boolean
}>

export interface ReserveManagerOptions {
  openTime?: string | 'now'
  reserveToday?: boolean
}

class ReserveManager extends BaseManager {
  constructor(private options: ReserveManagerOptions) {
    super(http, getApiMap(http))
    this.config.openTime = options.openTime || this.config.openTime
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

    // 检查当前时间是否可以启动应用。因为需要输入登录码(预约码)，有效期只有 5 分钟，所以只能在开放前 4 分钟启动
    if (!(await this.checkCanRun())) return

    // 提示用户输入登录码(预约码)
    await this.promptWxCodes()

    // 等待接近场馆开放时间
    await this.waitOpen()

    // 检查场馆是否开放
    await this.checkOpen()

    // 开始抢场地
    await this.reserve()
  }

  private async generateReserveSetting() {
    const loadCourtsListLoading = new Loading('加载场馆列表').start()
    const courts = await this.getCourtList(this.options.reserveToday ? getTodayDate() : getTomorrowDate())
    const courtsChoices = courts.map((court) => ({
      name:
        formatBracket(court.name) +
        (court.tag ? chalk.gray(` [${court.tag}]`) : '') +
        (court.isOpen ? '' : chalk.red('[已闭馆]')),
      value: court.id,
      disabled: !court.isOpen,
    }))
    loadCourtsListLoading.succeed('加载场馆列表')
    const { courtId } = await inquirer.prompt<{ courtId: string }>([
      {
        type: 'list',
        name: 'courtId',
        message: '场馆',
        default: courtsChoices.some((each) => each.value === this.config.courts[0]) ? this.config.courts[0] : undefined,
        choices: courtsChoices,
        validate: (value) => (value ? true : '请选择场馆'),
      },
    ])
    this.config.courts = [courtId]
    configManager.set(ConfigKey.courts, [courtId])

    const court = courts.find((c) => c.id === courtId)

    if (!court) {
      throw new Error('运行逻辑出错，场馆不存在')
    }

    const fieldsChoices = court.fields.map((field) => ({
      name: field.name + (field.tag ? chalk.gray(` [${field.tag}]`) : '') + (field.isOpen ? '' : chalk.red('[被占用]')),
      value: field.id,
      disabled: !field.isOpen,
    }))

    const { filedIds } = await inquirer.prompt<{ filedIds: string[] }>([
      {
        type: 'checkbox',
        name: 'filedIds',
        message: '选择场地',
        default: this.config.fields.filter((field) => fieldsChoices.some((f) => f.value === field)),
        choices: fieldsChoices,
        validate: (value) => {
          if (!value || value.length === 0) {
            return '请选择场地'
          }
          if (value.length > 2) {
            return '最多只能选择两个场地'
          }
          return true
        },
      },
    ])
    this.config.fields = filedIds
    configManager.set(ConfigKey.fields, filedIds)

    const backupFieldChoices = court.fields
      .filter((each) => !filedIds.includes(each.id))
      .map((field) => ({
        name:
          field.name + (field.tag ? chalk.gray(` [${field.tag}]`) : '') + (field.isOpen ? '' : chalk.red('[被占用]')),
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
            default: this.config.backupFields
              .filter((each) => !filedIds.includes(each))
              .filter((each) => backupFieldChoices.some((f) => f.value === each)),
            choices: backupFieldChoices,
          },
        ])
      ).backupFieldIds
    }
    this.config.backupFields = backupFieldIds
    configManager.set(ConfigKey.backupFields, backupFieldIds)

    const allFields = [...filedIds, ...backupFieldIds]
      .map((id) => court.fields.find((each) => each.id === id))
      .filter(Boolean) as CourtList[number]['fields']

    const reserveTimeChoices = [8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20].map((each) => {
      const nextHour = each + 1
      const fill0 = (h: number) => (h < 10 ? '0' + h : h)
      let icon = '🌕'
      if (each < 10) {
        icon = '🌥'
      } else if (each < 11) {
        icon = '🌤'
      } else if (each < 16) {
        icon = '🌞'
      } else if (each < 18) {
        icon = '🌤'
      }
      return {
        name: `${fill0(each)}:00-${fill0(nextHour)}:00 ${icon}`,
        value: `${fill0(each)}:00-${fill0(nextHour)}:00`,
      }
    })

    const { reserveTime } = await inquirer.prompt<{ reserveTime: string[] }>([
      {
        type: 'checkbox',
        name: 'reserveTime',
        message: '选择时间',
        default: this.config.reserveTime.split(',').filter((each) => reserveTimeChoices.some((t) => t.value === each)),
        choices: reserveTimeChoices.reverse(),
        loop: false,
        validate: (value) => {
          if (!value || value.length === 0) {
            return '请选择时间'
          }
          return true
        },
        filter: (value) => value.reverse(),
      },
    ])
    this.config.reserveTime = reserveTime.join(',')
    configManager.set(ConfigKey.time, this.config.reserveTime)

    const loadDetailLoading = new Loading('生成预约信息').start()
    const fieldDetailMap: Record<string, CourtDetail> = {}
    for (const idx in allFields) {
      const f = allFields[idx]
      const fieldDetail = await this.getFieldDetail(courtId, f.id, f.number, getTodayDate())
      fieldDetailMap[f.id] = fieldDetail
    }

    this.reserveSetting = {
      minRequests: filedIds.length,
      requestDataList: allFields.map((field) => {
        const fieldDetail = fieldDetailMap[field.id]
        return {
          appointmentDate: this.options.reserveToday ? getTodayDate() : getTomorrowDate(),
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
          fieldNum: String(field.number),
          collegeName: fieldDetail.collegeName,
          collegeId: fieldDetail.collegeId,
          code: '',
        }
      }),
    }
    loadDetailLoading.succeed('生成预约信息')
  }

  private async promptWxCodes(): Promise<void> {
    for (const idx in this.reserveSetting.requestDataList) {
      const codes = this.reserveSetting.requestDataList.map(({ code }) => code)
      const requestData = this.reserveSetting.requestDataList[idx]
      const { code } = await inquirer.prompt({
        type: 'input',
        name: 'code',
        message: `请输入 ${requestData.fieldNum} 号场的预约码`,
        validate: (value) => {
          if (!value) {
            return '请输入预约码'
          }
          if (codes.includes(value)) {
            return '预约码重复'
          }
          return true
        },
      })
      this.reserveSetting.requestDataList[idx].code = code
    }
  }

  private async checkCanRun(): Promise<boolean> {
    if (this.config.openTime === 'now') return true
    const openTimeMs = moment(this.config.openTime, 'HH:mm:ss').valueOf()
    const nowMs = moment().valueOf()
    const diffMs = openTimeMs - nowMs
    if (diffMs < FOUR_MINITES) {
      return true
    }
    logger.info(
      chalk.yellow(
        `请于场馆开放前四分钟启动本应用，当前时间是 ${chalk.gray(getCurrentTime())}，还需等待 ${chalk.gray(
          formatCountdown(openTimeMs - FOUR_MINITES),
        )}`,
      ),
    )
    const { wait } = await inquirer.prompt({
      type: 'confirm',
      name: 'wait',
      message: '是否等待倒计时完成？',
      default: diffMs < TEN_MINITES,
    })
    if (!wait) {
      return false
    }
    await this.countdown(openTimeMs - FOUR_MINITES, '等待倒计时完成，完成后需要输入预约码')
    Notify.notify('提示', '倒计时完成，请生成并输入预约码', true)
    return true
  }

  private async countdown(until: number, label: string) {
    return new Promise<void>((resolve) => {
      const formatLoadingText = () =>
        label + ' ' + chalk.yellow(formatCountdown(until)) + chalk.gray(' (Type `Ctrl + C` to exit)')
      const loading = new Loading(formatLoadingText()).start()
      const timer = setInterval(() => {
        const nowMs = moment().valueOf()
        if (until - nowMs <= 0) {
          loading.succeed(label + chalk.green(' 倒计时完成') + ' ' + chalk.gray(getCurrentTime(true)))
          clearInterval(timer)
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

  private async waitOpen() {
    if (this.config.openTime === 'now') return
    const openTimeMs = moment(this.config.openTime, 'HH:mm:ss').valueOf()
    const nowMs = moment().valueOf()
    const diffMs = openTimeMs - nowMs
    if (diffMs > FIVE_SECONDS) {
      await this.countdown(openTimeMs - FIVE_SECONDS, '等待场馆开放(提前 5 秒开始准备预约)')
      logger.debug('waitOpen', '倒计时完成')
    }
  }

  private async checkOpen() {
    if (this.config.openTime === 'now') return
    logger.debug('checkOpen', '检查场馆后台开放开始')
    const loading = new Loading(`等待场馆后台开放，检查第 ${chalk.green(1)} 次`).start()

    const errors = []
    let lastTimeWindow = Date.now()
    let checkTimes = 0
    let failTimes = 0
    let isOpen = false

    await this.fetchTypeIdAndPlaceId()

    while (!isOpen) {
      try {
        const startTime = Date.now()
        // 等待 this.config.checkInterval * (0.8~1.2) 秒
        checkTimes > 0 && (await sleep(this.config.checkInterval * (Math.random() * 0.4 + 0.8)))
        const sleepTime = Date.now() - startTime
        isOpen = await this.checkFirstCourtIsOpen(this.options.reserveToday ? getTodayDate() : getTomorrowDate())
        checkTimes++
        logger.debug(
          'checkOpen',
          `第 ${checkTimes} 次检查耗时 ${Date.now() - startTime} 毫秒，其中休眠 ${sleepTime} 毫秒`,
        )
        isOpen
          ? loading.succeed(
              `场馆后台已开放，共检查了 ${chalk.green(checkTimes)} 次。` + chalk.gray(getCurrentTime(true)),
            )
          : loading.setText(`等待场馆后台开放，检查第 ${chalk.green(checkTimes)} 次`)
      } catch (error) {
        if (error instanceof Error) {
          Reporter.report(error)
        }

        if (lastTimeWindow + ONE_MINITE < Date.now()) {
          errors.length = 0
          failTimes = 0
          lastTimeWindow = Date.now()
          logger.debug('checkOpen', '重置错误计数')
        }

        failTimes++
        errors.push(error)
        logger.debug('checkOpen', '检查场馆后台开放失败', failTimes, error)

        if (failTimes > this.checkOpenAllowFailTimesPerMin) {
          logger.debug('checkOpen', '检查场馆后台开放失败次数超过限制，放弃检查')
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

    logger.debug('checkOpen', '检查场馆后台开放完成')
  }

  private async reserve() {
    const reserveLogUid = uid()
    logger.debug('reserve', '🟢 开始预约', reserveLogUid)
    const courtCount = this.reserveSetting.minRequests
    const promiseFactories = this.reserveSetting.requestDataList.map(
      (each) => (useReserveFallback: boolean) =>
        this.loopReverve(() => this.reserveField(each, useReserveFallback), 3, each.fieldNum + ' 号场'),
    )
    const failedList: FailedList = []
    const successedList: SuccessedList = []

    for (const idx in promiseFactories) {
      const isBackup = +idx >= courtCount
      const isFirstBackup = +idx === courtCount

      if (isFirstBackup) {
        logger.log(chalk.yellow(`有 ${failedList.length} 个场地预约失败，尝试预约备用场地`))
      }

      const res = await promiseFactories[idx](isBackup)
      const requestData = this.reserveSetting.requestDataList[idx]

      if (typeof res === 'string') {
        failedList.push({
          placeName: requestData.placeName,
          fieldNum: requestData.fieldNum,
          error: res,
          isBackup,
        })
      } else {
        successedList.push({
          placeName: requestData.placeName,
          fieldNum: requestData.fieldNum,
          isBackup,
          isFallbacked: res.isFallbacked,
          period: res.period,
        })
      }

      // 达到预约数量限制
      if (successedList.length >= courtCount) {
        logger.debug('reserve', '预约数量达到限制，停止预约')
        break
      }
    }

    this.notifyResult(successedList, failedList)
    logger.debug('reserve', '🔴 结束预约', reserveLogUid)
  }

  private async loopReverve(
    request: () => Promise<{ status: 1 | unknown; isFallbacked: boolean; period: string }>,
    tryTimes = 3,
    label = '',
  ): Promise<
    | string
    | {
        isFallbacked: boolean
        period: string
      }
  > {
    try {
      const res = await request()
      if (res.status !== 1) {
        return label + chalk.gray(' 已被预定')
      }
      return {
        isFallbacked: res.isFallbacked,
        period: res.period,
      }
    } catch (error) {
      if (error instanceof Error) {
        Reporter.report(error)
      }
      if (
        tryTimes <= 1 ||
        error instanceof ErrorNoNeedRetry ||
        (error instanceof Error && error.message.includes('已被预定'))
      ) {
        // no try
        if (error instanceof Error) {
          return label + ' ' + chalk.gray(error.message)
        }
        return label + chalk.gray(' 未知错误')
      }
      return await this.loopReverve(request, tryTimes - 1, label)
    }
  }

  private notifyResult(successedList: SuccessedList, failedList: FailedList) {
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

    const fallbackList = successedList.filter((each) => each.isFallbacked)

    if (fallbackList.length > 0) {
      logger.info()
      fallbackList.forEach((each) => {
        logger.log(
          chalk.gray('[NOTICE]'),
          chalk.yellow(`${each.fieldNum} 号场地`) + ` 仅约了 ${chalk.yellow(each.period)} 时间段，其余时间段已被占用`,
        )
      })
    }

    Notify.notify(
      '预约结果',
      `${successedList.length} 个场地预约成功` + (failedList.length ? `，${failedList.length} 个场地预约失败` : ''),
    )
  }

  private notifySuccessReserved(name: string, fieldNums: string[]) {
    logger.log(chalk.green(`🎉 ${formatBracket(name)} ${fieldNums.join(',')} 号场地预约成功`))
  }

  private notifyFailedReserved(name: string, fieldNums: string[], errors: string[]) {
    logger.log(
      chalk.red(`\n❗️ ${formatBracket(name)} ${fieldNums.join(',')} 号场地预约失败`),
      `\n\n详细错误信息：\n\n${errors.join('\n\n')}\n`,
    )
  }
}

export default ReserveManager
