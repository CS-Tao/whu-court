import { RequestData, ResponseData } from './api'

export * from './api'

export interface Config {
  token: string
  sid: string
  checkInterval: number
  openTime: string
  courts: string[]
  fields: string[]
  backupFields: string[]
  reserveTime: string
}

export type CourtType = '羽毛球' | string

export interface ReserveSetting {
  minRequests: number
  requestDataList: RequestData.CreateOrderData[]
}

export type CourtList = Array<{
  id: string
  name: string
  placeUrl: string
  placeAddress: string
  isOpen: boolean
  tag?: string
  fields: Array<{
    id: string
    name: string
    number: string
    isOpen: boolean
    tag?: string
    reserveTimeList: Array<{
      reserveBeginTime: string
      reserveEndTime: string
      canReserve: boolean
    }>
  }>
}>

export interface CourtDetail {
  placeName: string
  placeAddress: string
  collegeId: string
  collegeName: string
  typeName: string
  placeUrl: string
  reserveTimeInfoList: ResponseData.QueryReservePlaceDetailData['reserveTimeInfoList']
}
