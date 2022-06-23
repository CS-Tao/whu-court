import Axios, { AxiosInstance } from 'axios'
import { CheckIfStaredRes, GitHubUserInfoRes } from './types'

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
          return Promise.reject(Error('GitHub token 无效'))
        }
        if (status !== 200) {
          return Promise.reject(Error('验证失败'))
        }
        return Promise.reject(error)
      },
    )
  }

  private readonly githubApiService: AxiosInstance

  /**
   * 获得用户信息
   */
  getUserInfo = (token: string) => {
    return this.githubApiService.get<GitHubUserInfoRes>('/user', {
      headers: {
        Authorization: `token ${token}`,
      },
    })
  }

  /**
   * 检查是否点星
   */
  protected checkStared = async (
    authToken: string,
    cursor: string | null,
  ): Promise<[string, string | null, boolean]> => {
    const repoName = 'whu-library-seat'
    const firstUserCount = 10
    const maxUserCount = 100
    let query = ''
    if (!cursor) {
      query = `query {
        viewer { id login }
        repository(owner:"CS-Tao", name:"${repoName}") {
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
        repository(owner:"CS-Tao", name:"${repoName}") {
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

    const response = await this.githubApiService.post<CheckIfStaredRes>('/graphql', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: JSON.stringify({ query }),
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
}

export default GitHubService
