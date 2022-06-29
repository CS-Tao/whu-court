import configManager, { ConfigKey } from '@whu-court/config-manager'
import GitHubService from './GitHubService'

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

  checkIfStared = async (token: string) => {
    const isAuthed = await this.checkIfStaredCore(token, null)
    if (isAuthed) {
      await this.saveInfos(token)
    } else {
      this.clearInfos()
    }
    return isAuthed
  }

  private saveInfos = async (token: string) => {
    const userInfo = await this.getUserInfo(token)
    if (userInfo.avatar_url && userInfo.login) {
      configManager.set(ConfigKey.githubId, userInfo.id)
      configManager.set(ConfigKey.githubToken, token)
      configManager.set(ConfigKey.githubAvatar, userInfo.avatar_url)
      configManager.set(ConfigKey.githubUserName, userInfo.login)
      userInfo.name && configManager.set(ConfigKey.githubNickName, userInfo.name)
    }
  }

  clearInfos = () => {
    configManager.delete(ConfigKey.githubId)
    configManager.delete(ConfigKey.githubToken)
    configManager.delete(ConfigKey.githubAvatar)
    configManager.delete(ConfigKey.githubUserName)
    configManager.delete(ConfigKey.githubNickName)
  }

  checkIfConfigured() {
    const token = configManager.get(ConfigKey.githubToken)
    if (token && typeof token === 'string') {
      // async
      this.checkIfStared(token)
      return true
    }
    return false
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
}

export default GitHubAuthManager
