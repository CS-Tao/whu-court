import { AxiosInstance } from 'axios'
import chalk from 'chalk'
import moment from 'moment'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import { environment } from '@whu-court/env'
import logger from '@whu-court/logger'
import { mockAxios } from '@whu-court/mock'
import { Loading, fill0, getCurrentTime, getTodayDate } from '@whu-court/utils'
import { ErrorNoNeedRetry } from '../../consts'
import { API_MAP, Config, CourtDetail, CourtList, CourtType, RequestData, ResponseData } from '../../types'

class BaseManager {
  public constructor(http: AxiosInstance, apis: API_MAP) {
    this.http = http
    this.apis = apis
    if (process.env.ENABLE_MOCK && !['gray', 'production'].includes(environment)) {
      mockAxios(http)
    }
  }

  protected http: AxiosInstance
  protected apis: API_MAP
  protected allowedTimes = [8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20]
  protected countStatus?: { name: string; date: string; fieldsStatus: Record<string, Record<string, boolean>> }
  protected get config(): Config {
    return {
      openTime: configManager.get(ConfigKey.openTime) as string,
      token: configManager.get(ConfigKey.courtToken) as string,
      sid: configManager.get(ConfigKey.courtSid) as string,
      checkInterval: configManager.get(ConfigKey.checkOpenInterval) as number,
      courts: configManager.get(ConfigKey.courts) as string[],
      fields: configManager.get(ConfigKey.fields) as string[],
      backupFields: configManager.get(ConfigKey.backupFields) as string[],
      reserveTime: configManager.get(ConfigKey.time) as string,
    }
  }

  private placeIdMap: Record<string, string> = {}
  private typeIdMap: Record<CourtType, string> = {}

  protected get badmintonTypeId() {
    const typeList = Object.keys(this.typeIdMap)
    if (typeList.length === 0) {
      throw Error('数据异常 typeIdMap is empty')
    }
    return this.typeIdMap[typeList.find((each) => each.includes('羽毛球')) || typeList[0]]
  }

  protected get fieldsStatusTable() {
    if (!this.countStatus) {
      return ''
    }
    const table: string[][] = []
    Object.keys(this.countStatus.fieldsStatus).forEach((fieldNum) => {
      const fieldStatus = this.countStatus!.fieldsStatus[fieldNum]
      table.push([
        `[🏸 ${fill0(+fieldNum)} 号场地]`,
        ...Object.keys(fieldStatus).map((each) => each + (fieldStatus[each] ? '(✅)' : '(❌)')),
      ])
    })
    return (
      `[${this.countStatus.date}] ${this.countStatus.name}各场地详情\n` +
      table.map((each) => each.join('\t')).join('\n')
    )
  }

  private getCourtToken() {
    return configManager.get(ConfigKey.courtToken) as string
  }

  private async checkUserAgent() {
    await this.fetchTypeIdAndPlaceId(false)
    const courtInPage = await this.apis.queryPlaceListByTypeId(
      {
        typeId: this.badmintonTypeId,
        reserveDate: getTodayDate(),
        uid: this.getCourtToken(),
        pageSize: 4,
        currentPage: 1,
      },
      {
        timeout: 20000,
      },
    )
    return !!courtInPage
  }

  protected async checkAuth(): Promise<string | false> {
    if (!(await this.checkUserAgent())) return false
    const orderList = await this.apis.myOrder({
      currentPage: 1,
      pageSize: 5,
      userId: this.getCourtToken(),
      status: [1, 2, 3, 4, 5, 6],
      search: '',
    })
    const currentUser = orderList?.pageData?.[0]?.creatorId
    if (currentUser) {
      return currentUser
    }
    return false
  }

  protected async fetchTypeIdAndPlaceId(showLoading = false) {
    const loading = new Loading('加载基础信息')
    showLoading && loading.start()
    if (Object.keys(this.typeIdMap).length > 0 && Object.keys(this.placeIdMap).length === 0) {
      return
    }
    const res = await this.apis.queryBookingQueryInfo({
      uid: this.config.token,
    })
    this.typeIdMap = res.motionList
      .filter((each) => each.placeType === '1')
      .reduce((acc, cur) => ({ ...acc, [cur.typeName]: cur.typeId }), {})
    this.placeIdMap = res.gymnasiumList.reduce((acc, cur) => ({ ...acc, [cur.placeName]: cur.placeId }), {})
    showLoading && loading.succeed('加载基础信息')
    if (Object.keys(this.typeIdMap).length === 0 || Object.keys(this.placeIdMap).length === 0) {
      throw Error(`无法识别场馆接口 queryBookingQueryInfo res: ${JSON.stringify(res)}`)
    }
  }

  protected async checkFirstCourtIsOpen(reserveDate: string) {
    const placeList = Object.keys(this.placeIdMap)

    /**
     * 风雨场地较少，数据量不大，适合轮询
     */
    const fyCourt = placeList.filter((each) => each.includes('风雨体育馆'))[0] || placeList[0]
    const otherCourts = placeList.filter((each) => each !== fyCourt && !each.includes('宋卿'))

    let courtInfo: null | ResponseData.QueryPlaceListByTypeIdData['pageData'][number] = null

    const courts = [fyCourt, ...otherCourts]
    for (const idx in courts) {
      const court = this.placeIdMap[courts[idx]]
      courtInfo = (
        await this.apis.queryPlaceListByTypeId(
          {
            typeId: this.badmintonTypeId,
            reserveDate,
            uid: this.config.token,
            placeId: court,
            currentPage: 1,
            pageSize: 5,
          },
          { timeout: 20000 },
        )
      ).pageData[0]

      // 未闭馆
      if (courtInfo.placeStatus === '0') {
        break
      } else {
        courtInfo = null
      }
    }

    if (!courtInfo) {
      throw Error('所有场馆已关闭')
    }

    const canReserve = courtInfo.canReserve === '0'

    return canReserve
  }

  protected async getCourtListByPage(page: number, reserveDate: string): Promise<CourtList> {
    const courtInPage = await this.apis.queryPlaceListByTypeId(
      {
        typeId: this.badmintonTypeId,
        reserveDate,
        uid: this.config.token,
        pageSize: 4,
        currentPage: page,
      },
      { timeout: 20000 },
    )
    return courtInPage.pageData.map((court) => {
      return {
        name: court.placeName,
        id: court.placeId,
        placeUrl: court.placeUrl,
        placeAddress: court.placeName,
        isOpen: court.placeStatus === '0',
        fields: court.placeFieldInfoList
          .map((field) => {
            return {
              name: `${field.fieldNum} 号场`,
              id: field.fieldId,
              number: field.fieldNum,
              isOpen: field.fieldCloseStatus === '0',
              reserveTimeList: field.reserveTimeInfoList.map((time) => {
                return {
                  reserveBeginTime: time.reserveBeginTime,
                  reserveEndTime: time.reserveEndTime,
                  canReserve: time.canReserve === '0',
                }
              }),
            }
          })
          .sort(),
      }
    })
  }

  protected async getCourtList(reserveDate: string): Promise<CourtList> {
    const firstPageData = await this.getCourtListByPage(1, reserveDate)
    const firstPageIds = firstPageData.map((court) => court.id)
    const secondPageData = (await this.getCourtListByPage(2, reserveDate)).filter(
      (each) => !firstPageIds.includes(each.id),
    )
    return [...firstPageData, ...secondPageData]
  }

  protected async getFieldDetail(
    placeId: string,
    fieldId: string,
    fieldNum: string,
    reserveDate: string,
  ): Promise<CourtDetail> {
    const courtDetail = await this.apis.queryReservePlaceDetail({
      uid: this.config.token,
      placeId,
      typeId: this.badmintonTypeId,
      reserveDate,
      fieldId,
      fieldNum,
    })
    return {
      placeName: courtDetail.placeName,
      collegeId: courtDetail.collegeId,
      collegeName: courtDetail.collegeName,
      placeAddress: courtDetail.placeAddress,
      typeName: courtDetail.typeName,
      placeUrl: courtDetail.placeUrl,
      reserveTimeInfoList: courtDetail.reserveTimeInfoList,
    }
  }

  protected async reserveField(data: RequestData.CreateOrderData, useFallback = false) {
    logger.debug(
      'reserveField',
      'start',
      '[场馆]',
      data.placeName,
      '[场地]',
      data.fieldNum,
      '[日期]',
      data.appointmentDate,
      '[时间]',
      data.period,
      '[是否使用接受备用时间]',
      useFallback,
    )
    const detail = await this.getFieldDetail(data.placeId, data.fieldId, data.fieldNum, data.appointmentDate)
    const canReserveCourtsFromDetail = detail.reserveTimeInfoList.filter((each) => each.canReserve === '0')

    logger.debug(
      'reserveField',
      '[场馆详情]',
      detail.reserveTimeInfoList
        .map((each) => `${each.reserveBeginTime}-${each.reserveEndTime}` + (each.canReserve === '1' ? '(❌)' : '(✅)'))
        .join(', '),
    )

    if (!this.countStatus) {
      this.countStatus = { name: data.placeName, date: data.appointmentDate, fieldsStatus: {} }
    }

    this.countStatus!.fieldsStatus[data.fieldNum] = detail.reserveTimeInfoList.reduce((acc, cur) => {
      acc[`${cur.reserveBeginTime}-${cur.reserveEndTime}`] = cur.canReserve === '0'
      return acc
    }, {} as Record<string, boolean>)

    const timeList = data.period.split(',').map((each) => {
      return {
        beginTime: each.split('-')[0],
        endTime: each.split('-')[1],
      }
    })

    const checkList = await Promise.all(
      timeList.map(async (each) => {
        if (canReserveCourtsFromDetail.every((time) => time.reserveBeginTime !== each.beginTime)) {
          logger.debug('reserveField', `${each.beginTime}-${each.endTime}`, chalk.red('场馆详情标明不可预约'))
          return false
        }
        const req: RequestData.UseSportFieldData = {
          uid: this.config.token,
          placeId: data.placeId,
          typeId: data.motionTypeId,
          reserveDate: data.appointmentDate,
          fieldId: data.fieldId,
          fieldNum: data.fieldNum,
          isSelected: 'Y',
          reserveTimeList: [each],
        }
        const res = await this.apis.useSportField(req)
        logger.debug(
          'reserveField',
          `${each.beginTime}-${each.endTime}`,
          `useSportField ${res ? '可预约' : chalk.red('不可预约')}`,
          res
            ? `(${chalk.green(data.fieldNum)} 号场地锁单场地时间: ${chalk.green(moment().format('HH:mm:ss.SSS'))})`
            : '',
        )
        return res
      }),
    )

    const cantReserveList = timeList
      .filter((_, idx) => !checkList[idx])
      .map((each) => `${each.beginTime}-${each.endTime}`)
    const isEveryCantReserve = checkList.every((each) => !each)
    const isSomeCantReserve = checkList.some((each) => !each)

    if (!useFallback && isSomeCantReserve) {
      const msg = chalk.gray(
        `${cantReserveList.join(',')} 时间段已被预定` +
          (isEveryCantReserve ? '' : '(非备用场地不考虑空闲时间段)') +
          `。${getCurrentTime(true)}`,
      )
      logger.debug('reserveField', 'throw ErrorNoNeedRetry', msg)
      throw new ErrorNoNeedRetry(msg)
    }
    if (useFallback && isEveryCantReserve) {
      const msg = `${cantReserveList.join(',')} 时间段已被预定` + `。${getCurrentTime(true)}`
      logger.debug('reserveField', 'throw ErrorNoNeedRetry', msg)
      throw new ErrorNoNeedRetry(msg)
    }

    const period = timeList
      .filter((_, idx) => checkList[idx])
      .map((each) => `${each.beginTime}-${each.endTime}`)
      .join(',')

    logger.debug(
      'reserveField',
      '创建订单',
      '[场地]',
      data.fieldNum,
      '[预约时间段]',
      period,
      '[时间段是否有遗漏]',
      isSomeCantReserve,
    )

    const res = await this.apis.createOrder({
      ...data,
      period,
    })

    logger.debug('reserveField', '创建订单-结果', '[订单号]', res.orderNumber, '[状态码]', res.status)

    return {
      ...res,
      isFallbacked: isSomeCantReserve,
      period,
    }
  }
}

export default BaseManager
