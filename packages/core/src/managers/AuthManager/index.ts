import { AxiosInstance } from 'axios'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import Reporter from '@whu-court/report'
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
  private readonly userAgentConfigKey = ConfigKey.courtUserAgent
  private readonly accountConfigKey = ConfigKey.courtAccount
  private readonly loginTimeKey = ConfigKey.loginTime
  public userInfo: UserInfo | null = null

  async login(token: string, sid: string, userAgent: string) {
    configManager.set(this.tokenConfigKey, token)
    configManager.set(this.sidConfigKey, sid)
    configManager.set(this.userAgentConfigKey, userAgent)
    this.userInfo = this.userInfo || (await this.getUserInfo())
    configManager.set(this.accountConfigKey, this.userInfo.account)
    configManager.set(this.loginTimeKey, new Date().getTime())
    return this.userInfo.account
  }

  async logout() {
    const keys = [
      this.tokenConfigKey,
      this.sidConfigKey,
      this.userAgentConfigKey,
      this.accountConfigKey,
      this.loginTimeKey,
    ]
    this.userInfo = null
    keys.forEach((key) => configManager.delete(key))
  }

  async validate(
    token = configManager.get(this.tokenConfigKey) as string,
    sid = configManager.get(this.sidConfigKey) as string,
    userAgent = configManager.get(this.userAgentConfigKey) as string,
  ) {
    try {
      if (!token || !sid || !userAgent) {
        return false
      }
      this.userInfo = await this.getUserInfo()
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

  private async getUserInfo(): Promise<UserInfo> {
    const account = await this.checkAuth()
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

  public getUserAgent() {
    return configManager.get(this.userAgentConfigKey) as string
  }
}

export default AuthManager
