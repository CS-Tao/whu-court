import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import logger from '@whu-court/logger'
import { getApiMap } from '../../apis'
import BaseManager from '../BaseManager'

interface UserInfo {
  account: string
}

class AuthManager extends BaseManager {
  constructor(http: AxiosInstance) {
    super(http, getApiMap(http))
  }

  private readonly tokenConfigKey = ConfigKey.courtToken
  private readonly accountConfigKey = ConfigKey.courtAccount
  private userInfo: UserInfo | null = null

  async login(token: string, sid: string) {
    this.userInfo = this.userInfo || (await this.getUserInfo(token, sid))
    configManager.set(this.tokenConfigKey, token)
    configManager.set(this.accountConfigKey, this.userInfo.account)
    return this.userInfo.account
  }

  async logout() {
    this.userInfo = null
    configManager.delete(this.tokenConfigKey)
    configManager.delete(this.accountConfigKey)
  }

  async validate(token: string, sid: string) {
    try {
      this.userInfo = await this.getUserInfo(token, sid)
      if (this.userInfo) {
        return true
      }
      return 'Token 无效'
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error)
        return error.message
      }
      return false
    }
  }

  get logined() {
    return !!configManager.get(this.tokenConfigKey)
  }

  private async getUserInfo(token: string, sid: string): Promise<UserInfo> {
    const account = await this.checkAuth(token, sid)
    if (!account) {
      throw new Error('Token 或 Sid 无效')
    }
    const userInfo = {
      account,
    }
    return userInfo
  }
}

export default AuthManager
