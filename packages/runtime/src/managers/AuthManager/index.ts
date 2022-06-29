import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import Reporter from '@whu-court/reporter'
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
  private readonly sidConfigKey = ConfigKey.courtSid
  private readonly accountConfigKey = ConfigKey.courtAccount
  private readonly loginTimeKey = ConfigKey.loginTime
  public userInfo: UserInfo | null = null

  async login(token: string, sid: string) {
    this.userInfo = this.userInfo || (await this.getUserInfo(token, sid))
    configManager.set(this.tokenConfigKey, token)
    configManager.set(this.sidConfigKey, sid)
    configManager.set(this.accountConfigKey, this.userInfo.account)
    configManager.set(this.accountConfigKey, this.userInfo.account)
    configManager.set(this.loginTimeKey, new Date().getTime())
    return this.userInfo.account
  }

  async logout() {
    this.userInfo = null
    configManager.delete(this.tokenConfigKey)
    configManager.delete(this.sidConfigKey)
    configManager.delete(this.accountConfigKey)
    configManager.delete(this.loginTimeKey)
  }

  async validate(
    token = configManager.get(this.tokenConfigKey) as string,
    sid = configManager.get(this.sidConfigKey) as string,
  ) {
    try {
      this.userInfo = await this.getUserInfo(token, sid)
      if (this.userInfo) {
        return true
      }
      return false
    } catch (error) {
      if (error instanceof Error) {
        Reporter.report(error)
      }
      return false
    }
  }

  get logined() {
    return !!configManager.get(this.tokenConfigKey) && configManager.get(this.sidConfigKey)
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

  public getToken(plainText = false) {
    const token = configManager.get(this.tokenConfigKey) as string
    return plainText ? token : new Array(token.length).fill('*').join('')
  }

  public getSid(plainText = false) {
    const sid = configManager.get(this.sidConfigKey) as string
    return plainText ? sid : new Array(sid.length).fill('*').join('')
  }

  public getAccount() {
    return configManager.get(this.accountConfigKey) as string
  }

  public getLoginTime() {
    return configManager.get(this.loginTimeKey) as number
  }
}

export default AuthManager
