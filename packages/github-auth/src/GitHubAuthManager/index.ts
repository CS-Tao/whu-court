import configManager, { ConfigKey } from '@whu-court/config-manager'
import GitHubService from './GitHubService'
import { AppConfig } from './types'

interface UserInfo {
  id: number
  nickName: string
  name: string
  avatar: string
}

class GitHubAuthManager extends GitHubService {
  private checkIfStaredCore = async (token: string, cursor: string | null): Promise<boolean> => {
    const data = await this.checkStared(token, cursor).then(([token, lastCursor, haveStarted]) => {
      return {
        continue: !haveStarted && !!lastCursor,
        token,
        haveStarted,
        lastCursor,
      }
    })
    return data.continue ? this.checkIfStaredCore(data.token, data.lastCursor) : data.haveStarted
  }

  checkIfInWhiteList(additionalAccounts: string[] = []) {
    const whiteList = this.appConfig.whiteList || []
    if (whiteList.length === 0) {
      return true
    }
    const userInfo = this.userInfo
    const userId = String(userInfo?.id || -1)
    const userName = userInfo?.name ?? ''
    return [userId, userName, ...additionalAccounts].some((each) => whiteList.includes(each))
  }

  checkIfInBlackList(additionalAccounts: string[] = []) {
    const blackList = this.appConfig.blackList || []
    const userInfo = this.userInfo
    const userId = String(userInfo?.id || -1)
    const userName = userInfo?.name ?? ''
    return [userId, userName, ...additionalAccounts].some((each) => blackList.includes(each))
  }

  checkIfStared = async (token: string, ignoreError = false) => {
    try {
      const isAuthed = await this.checkIfStaredCore(token, null)
      if (!isAuthed) {
        this.clearUserInfos()
      }
      return isAuthed
    } catch (error) {
      if (!ignoreError) {
        throw error
      }
    }
  }

  public saveUserInfos = async (token: string) => {
    const userInfo = await this.getUserInfo(token)
    if (userInfo.avatar_url && userInfo.login) {
      configManager.set(ConfigKey.githubId, userInfo.id)
      configManager.set(ConfigKey.githubToken, token)
      configManager.set(ConfigKey.githubAvatar, userInfo.avatar_url)
      configManager.set(ConfigKey.githubUserName, userInfo.login)
      userInfo.name && configManager.set(ConfigKey.githubNickName, userInfo.name)
    }
  }

  clearUserInfos = () => {
    configManager.delete(ConfigKey.githubId)
    configManager.delete(ConfigKey.githubToken)
    configManager.delete(ConfigKey.githubAvatar)
    configManager.delete(ConfigKey.githubUserName)
    configManager.delete(ConfigKey.githubNickName)
  }

  async checkIfConfigured(useAsyncCheck = true) {
    const token = configManager.get(ConfigKey.githubToken)
    if (token && typeof token === 'string') {
      // async
      useAsyncCheck ? this.checkIfStared(token, true) : await this.checkIfStared(token, true)
      return true
    }
    return false
  }

  checkConfig = async () => {
    const config = await this.getConfig()
    configManager.set(ConfigKey.available, config.available)
    config.prohibitMsg && configManager.set(ConfigKey.prohibitMsg, config.prohibitMsg)
    config.announcement && configManager.set(ConfigKey.announcement, config.announcement)
    config.blackList && configManager.set(ConfigKey.blackList, config.blackList)
    config.whiteList && configManager.set(ConfigKey.whiteList, config.whiteList)
    return config
  }

  get userInfo(): UserInfo | null {
    const id = configManager.get(ConfigKey.githubId)
    const nickName = configManager.get(ConfigKey.githubNickName)
    const name = configManager.get(ConfigKey.githubUserName)
    const avatar = configManager.get(ConfigKey.githubAvatar)
    if ([id, name, avatar].every((each) => each && ['string', 'number'].includes(typeof each))) {
      return {
        id,
        nickName,
        name,
        avatar,
      } as UserInfo
    }
    return null
  }

  get confgured() {
    return !!this.userInfo
  }

  get appConfig(): AppConfig {
    return {
      available: configManager.get(ConfigKey.available) as boolean,
      prohibitMsg: configManager.get(ConfigKey.prohibitMsg) as string,
      announcement: configManager.get(ConfigKey.announcement) as string,
      blackList: configManager.get(ConfigKey.blackList) as string[],
      whiteList: configManager.get(ConfigKey.whiteList) as string[],
    }
  }
}

export default GitHubAuthManager
