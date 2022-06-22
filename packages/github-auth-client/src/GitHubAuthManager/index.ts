import io, { Socket } from 'socket.io-client'
import open from 'open'
import GitHubService from './GitHubService'

const SOCKET_BASE_URL = 'https://court-ghauth.cs-tao.cc'

enum AuthStatus {
  None = 'None',
  WaitConfirm = 'WaitConfirm',
  WaitLogin = 'WaitLogin',
  Login = 'Login',
  Staring = 'Staring',
}

class GitHubAuthManager extends GitHubService {
  private socket: Socket | null = null

  protected authStatus: AuthStatus = AuthStatus.None
  protected authFailMessage: string | null = null

  loginGitHub() {
    this.authStatus = AuthStatus.Login
    setTimeout(this.connectSocket)
  }

  cancelAuthen() {
    this.authFailMessage = null
    this.authStatus = AuthStatus.None
    this.disconnectSocket()
  }

  private connectSocket() {
    this.disconnectSocket()
    this.socket = io(SOCKET_BASE_URL, {
      reconnection: false,
      transportOptions: {
        polling: {
          extraHeaders: {
            'x-clientid': 'whu-court',
          },
        },
      },
    })
    this.socket.on('connect', () => {
      this.authFailMessage = null
      this.authStatus = AuthStatus.WaitConfirm
    })
    this.socket.on('connect_error', (error) => {
      this.authFailMessage = '无法连接服务器：' + error
      this.disconnectSocket()
      this.authStatus = AuthStatus.None
    })
    this.socket.on('error', (error) => {
      this.authFailMessage = '无法连接服务器：' + error
      this.disconnectSocket()
      this.authStatus = AuthStatus.None
    })
    this.socket.on('disconnect', (reason) => {
      if (reason !== 'io client disconnect') {
        this.authFailMessage = '已断开和服务器的连接'
        this.disconnectSocket()
        this.authStatus = AuthStatus.None
      }
    })
    this.socket.on('socketId', (socketId) => {
      this.openLink(`${SOCKET_BASE_URL}/comfirm?socketid=${socketId}&device=CLI`)
      this.authStatus = AuthStatus.WaitConfirm
    })
    this.socket.on('token', (token: string) => {
      this.disconnectSocket()
      this.loginGitHubCallback(token)
    })
    this.socket.on('cancel', () => {
      this.cancelAuthen()
    })
  }

  private disconnectSocket() {
    if (this.socket !== null && this.socket.connected) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private loginGitHubCallback = (token: string) => {
    // eslint-disable-next-line no-console
    console.log(token)
  }

  private checkIfStared = (token: string): Promise<[string, boolean]> => {
    return this.checkIfStared(token)
  }

  private checkIfStaredCore = async (token: string, cursor: string | null): Promise<[string, boolean]> => {
    this.authStatus = AuthStatus.Staring
    try {
      const data = await this.checkStared(token, cursor).then(([token, lastCursor, haveStarted]) => {
        return {
          continue: !haveStarted && !!lastCursor,
          token,
          haveStarted,
          lastCursor,
        }
      })
      return data.continue ? this.checkIfStaredCore(data.token, data.lastCursor) : [data.token, data.haveStarted]
    } catch (error) {
      // TODO:
      throw new Error('todo')
    }
  }

  private openLink(url: string) {
    open(url)
  }
}

export default GitHubAuthManager
