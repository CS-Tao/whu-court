import { AxiosRequestConfig } from 'axios'

export type MockData = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string | RegExp
  handler: (config: AxiosRequestConfig<unknown>) => unknown
}
