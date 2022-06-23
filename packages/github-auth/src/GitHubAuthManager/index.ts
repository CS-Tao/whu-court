import GitHubService from './GitHubService'

class GitHubAuthManager extends GitHubService {
  isAuthed: boolean = false

  checkIfStared = async (token: string) => {
    this.isAuthed = await this.checkIfStaredCore(token, null)
    return this.isAuthed
  }

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
}

export default GitHubAuthManager
