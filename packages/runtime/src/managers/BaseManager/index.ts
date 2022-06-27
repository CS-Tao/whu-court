import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import { mockAxios } from '@whu-court/mock'
import { API_MAP } from '../../types'

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

  private getToken() {
    return configManager.get(ConfigKey.courtToken) as string
  }

  protected async checkAuth(token?: string, sid?: string): Promise<string | false> {
    const orderList = await this.apis.myOrder(
      {
        currentPage: 1,
        pageSize: 5,
        userId: token || this.getToken(),
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
}

export default BaseManager
