import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import { mockAxios } from '@whu-court/mock'
import { getTomorrowDate } from '@whu-court/utils'
import { API_MAP, Config, CourtType, ResponseData } from '../../types'

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
    token: configManager.get(ConfigKey.courtToken) as string,
    sid: configManager.get(ConfigKey.courtSid) as string,
    checkInterval: configManager.get(ConfigKey.checkOpenInterval) as number,
  }

  private placeIdMap: Record<string, string> = {}
  private typeIdMap: Record<CourtType, string> = {}

  private getCourtToken() {
    return configManager.get(ConfigKey.courtToken) as string
  }

  protected async checkAuth(token?: string, sid?: string): Promise<string | false> {
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

  protected async fetchTypeIdAndPlaceId() {
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

    if (Object.keys(this.typeIdMap).length === 0 || Object.keys(this.placeIdMap).length === 0) {
      throw Error(`无法识别场馆接口 queryBookingQueryInfo res: ${JSON.stringify(res)}`)
    }
  }

  protected async checkFirstCourtIsOpen() {
    const typeList = Object.keys(this.typeIdMap)
    const placeList = Object.keys(this.placeIdMap)

    const badmintonType = typeList.find((each) => each === '羽毛球') || typeList[0]
    /**
     * 国软场地较少，数据量不大，适合轮询
     */
    const grCourt = placeList.filter((each) => each.includes('星湖体育馆'))[0] || placeList[0]
    const otherCourts = placeList.filter((each) => each !== grCourt && !each.includes('宋卿'))

    let courtInfo: null | ResponseData.QueryPlaceListByTypeIdData['pageData'][number] = null

    for (const court in [grCourt, otherCourts]) {
      courtInfo = (
        await this.apis.queryPlaceListByTypeId({
          typeId: this.typeIdMap[badmintonType],
          reserveDate: getTomorrowDate(),
          uid: this.config.token,
          placeId: court,
          currentPage: 1,
          pageSize: 5,
        })
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
}

export default BaseManager
