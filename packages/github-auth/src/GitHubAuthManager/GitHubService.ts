import Axios, { AxiosInstance } from 'axios'
import { Logger } from '@whu-court/logger'
import Reporter from '@whu-court/reporter'
import { AppConfig, CheckIfStaredRes, GitHubUserInfoRes } from './types'

const USER_NAME = 'CS-Tao'
const REPO_NAME = 'whu-court'

class GitHubService {
  constructor() {
    this.githubApiService = Axios.create({
      baseURL: 'https://api.github.com',
      timeout: 6000,
      withCredentials: true,
    })

    this.githubApiService.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error.response.status
        if (status === 401) {
          return Promise.reject(new Logger.Errors.ErrorNoNeedReport('GitHub token 无效'))
        }
        if (status !== 200) {
          return Promise.reject(new Error('验证失败'))
        }
        return Promise.reject(error)
      },
    )

    this.githubContentService = Axios.create({
      baseURL: 'https://raw.githubusercontent.com/CS-Tao/github-content/master/contents/github/whu-court',
      timeout: 8000,
      withCredentials: true,
    })
  }

  private readonly githubApiService: AxiosInstance
  private readonly githubContentService: AxiosInstance

  public readonly repoLink = `https://github.com/${USER_NAME}/${REPO_NAME}`

  /**
   * 获得用户信息
   */
  getUserInfo = async (token: string) => {
    return (
      await this.githubApiService.get<GitHubUserInfoRes>('/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      })
    ).data
  }

  /**
   * 检查是否点星
   */
  protected checkStared = async (
    authToken: string,
    cursor: string | null,
  ): Promise<[string, string | null, boolean]> => {
    const firstUserCount = 10
    const maxUserCount = 100
    let query = ''
    if (!cursor) {
      query = `query {
        viewer { id login }
        repository(owner:"${USER_NAME}", name:"${REPO_NAME}") {
          id
          stargazers (first: ${firstUserCount}, orderBy: {field: STARRED_AT, direction: DESC}) {
            edges {
              cursor
              starredAt
              node {
                id
                login
              }
            }
          }
        }
      }`
    } else {
      query = `query {
        viewer { id login }
        repository(owner:"${USER_NAME}", name:"${REPO_NAME}") {
          id
          stargazers (first: ${maxUserCount}, orderBy: {field: STARRED_AT, direction: DESC}, after: "${cursor}") {
            edges {
              cursor
              starredAt
              node {
                id
                login
              }
            }
          }
        }
      }`
    }

    const response = await this.githubApiService.post<CheckIfStaredRes>('/graphql', JSON.stringify({ query }), {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const viewer = response.data.data.viewer
    const stargazers = response.data.data.repository.stargazers.edges
    if (stargazers.length === 0) {
      return [authToken, null, false]
    } else {
      const haveStared = stargazers.find((stargazer) => stargazer.node.id === viewer.id) !== undefined
      const lastCursor = stargazers[stargazers.length - 1].cursor
      return [authToken, lastCursor, haveStared]
    }
  }

  protected getConfig = async (): Promise<AppConfig> => {
    try {
      const configData = (await this.githubContentService.get<AppConfig>('/config.json', { params: { t: Date.now() } }))
        .data
      return configData
    } catch (error) {
      if (error instanceof Error) {
        Reporter.report(error)
      }
      return { available: true, blackList: [], whiteList: [] }
    }
  }
}

export default GitHubService
