export * from './api'

export interface Config {
  token: string
  sid: string
  checkInterval: number
}

export type CourtType = '羽毛球' | string
