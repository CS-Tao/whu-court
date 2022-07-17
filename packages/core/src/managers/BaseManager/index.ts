import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import { mockAxios } from '@whu-court/mock'
import { Loading, formatBracket, getTodayDate, getTomorrowDate } from '@whu-court/utils'
import { API_MAP, Config, CourtDetail, CourtList, CourtType, RequestData, ResponseData } from '../../types'

class BaseManager {
  public constructor(http: AxiosInstance, apis: API_MAP) {
    this.http = http
    this.apis = apis
    if (process.env.ENABLE_MOCK || process.env.NODE_ENV === 'development') {
      mockAxios(http)
    }
  }

  protected http: AxiosInstance
  protected apis: API_MAP
  protected config: Config = {
    openTime: configManager.get(ConfigKey.openTime) as string,
    token: configManager.get(ConfigKey.courtToken) as string,
    sid: configManager.get(ConfigKey.courtSid) as string,
    checkInterval: configManager.get(ConfigKey.checkOpenInterval) as number,
    courts: configManager.get(ConfigKey.courts) as string[],
    fields: configManager.get(ConfigKey.fields) as string[],
    backupFields: configManager.get(ConfigKey.backupFields) as string[],
    reserveTime: configManager.get(ConfigKey.time) as string,
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

  private getCourtToken() {
    return configManager.get(ConfigKey.courtToken) as string
  }

  private async checkUserAgent(token?: string, sid?: string, userAgent?: string) {
    await this.fetchTypeIdAndPlaceId()
    const courtInPage = await this.apis.queryPlaceListByTypeId(
      {
        typeId: this.badmintonTypeId,
        reserveDate: getTodayDate(),
        uid: token || this.getCourtToken(),
        pageSize: 4,
        currentPage: 1,
      },
      {
        timeout: 20000,
        headers: {
          ...(token && {
            'x-outh-token': token,
          }),
          ...(sid && {
            'x-outh-sid': sid,
          }),
          ...(userAgent && {
            'User-Agent': userAgent,
          }),
        },
      },
    )
    return !!courtInPage
  }

  protected async checkAuth(token?: string, sid?: string, userAgent?: string): Promise<string | false> {
    if (!(await this.checkUserAgent(token, sid, userAgent))) return false
    const orderList = await this.apis.myOrder(
      {
        currentPage: 1,
        pageSize: 5,
        userId: token || this.getCourtToken(),
        status: [1, 2, 3, 4, 5, 6],
        search: '',
      },
      {
        headers: {
          ...(token && {
            'x-outh-token': token,
          }),
          ...(sid && {
            'x-outh-sid': sid,
          }),
        },
      },
    )
    const currentUser = orderList?.pageData?.[0]?.creatorId
    if (currentUser) {
      return currentUser
    }
    return false
  }

  protected async fetchTypeIdAndPlaceId(showLoading = false) {
    const loading = new Loading('加载场馆类型')
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
    showLoading && loading.succeed('加载场馆类型')
    if (Object.keys(this.typeIdMap).length === 0 || Object.keys(this.placeIdMap).length === 0) {
      throw Error(`无法识别场馆接口 queryBookingQueryInfo res: ${JSON.stringify(res)}`)
    }
  }

  protected async checkFirstCourtIsOpen() {
    const placeList = Object.keys(this.placeIdMap)

    /**
     * 国软场地较少，数据量不大，适合轮询
     */
    const grCourt = placeList.filter((each) => each.includes('星湖体育馆'))[0] || placeList[0]
    const otherCourts = placeList.filter((each) => each !== grCourt && !each.includes('宋卿'))

    let courtInfo: null | ResponseData.QueryPlaceListByTypeIdData['pageData'][number] = null

    const courts = [grCourt, ...otherCourts]
    for (const idx in courts) {
      const court = this.placeIdMap[courts[idx]]
      courtInfo = (
        await this.apis.queryPlaceListByTypeId(
          {
            typeId: this.badmintonTypeId,
            reserveDate: getTomorrowDate(),
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
        name: formatBracket(court.placeName),
        id: court.placeId,
        placeUrl: court.placeUrl,
        placeAddress: formatBracket(court.placeName),
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

  protected async getFieldDetail(placeId: string, fieldId: string, fieldNum: string): Promise<CourtDetail> {
    const courtDetail = await this.apis.queryReservePlaceDetail({
      uid: this.config.token,
      placeId,
      typeId: this.badmintonTypeId,
      reserveDate: getTodayDate(),
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
    }
  }

  protected reserveField(data: RequestData.CreateOrderData) {
    return this.apis.createOrder(data)
  }
}

export default BaseManager
