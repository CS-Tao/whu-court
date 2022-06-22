import axios, { AxiosInstance } from 'axios'
import { CheckIfStaredRes, GitHubUserInfoRes } from './types'

class GitHubService {
  constructor() {
    this.githubApiService = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 6000,
      withCredentials: true,
    })
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
  checkStared = async (authToken: string, cursor: string | null): Promise<[string, string | null, boolean]> => {
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
    if (response.status === 200) {
      const viewer = response.data.data.viewer
      const stargazers = response.data.data.repository.stargazers.edges
      if (stargazers.length === 0) {
        return [authToken, null, false]
      } else {
        const haveStared = stargazers.find((stargazer) => stargazer.node.id === viewer.id) !== undefined
        const lastCursor = stargazers[stargazers.length - 1].cursor
        return [authToken, lastCursor, haveStared]
      }
    } else {
      // TODO:
      throw new Error('数据加载失败，请重新尝试')
    }
  }
}

export default GitHubService
