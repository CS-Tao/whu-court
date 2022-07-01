export interface GitHubUserInfoRes {
  login: string
  id: number
  node_id: 'MDQ6VXNlcjMxNzUwODQx'
  avatar_url: string
  html_url: 'https://github.com/GIS-Hacker'
  type: 'User' | unknown
  name?: string
  company: string
  blog: string
  location: string
  email: null | string
  bio: string
}

export interface CheckIfStaredRes {
  data: {
    viewer: {
      id: string
      login: string
    }
    repository: {
      id: string
      stargazers: {
        edges: Array<{
          node: {
            id: string
            login: string
          }
          cursor: string | null
        }>
      }
    }
  }
}

export interface AppConfig {
  available: boolean
  prohibitMsg?: string
  announcement?: string
  blackList?: Array<string>
  whiteList?: Array<string>
}
