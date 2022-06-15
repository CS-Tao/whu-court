import { AxiosInterceptorManager, AxiosRequestConfig } from 'axios'

export type InterceptorFunction<T = any> = Parameters<AxiosInterceptorManager<AxiosRequestConfig<T>>['use']>[0]

export interface ServerData {
  errcode: number | string
  errmsg: null | string
  desc: null | string
  detailErrMsg: null | string
  hint: null | string
  data: null | string | Record<string, any>
}
