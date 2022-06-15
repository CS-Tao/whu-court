import MockAdapter from 'axios-mock-adapter'
import { AxiosInstance } from 'axios'
import chalk from 'chalk'
import Logger from '@whu-court/logger'
import { MockData } from './type'
import apis from './apis'

const logger = Logger.getLogger('@whu-court/mock')

export const mockAxios = (axios: AxiosInstance) => {
  logger.warn(chalk.yellow(`mock axios enabled for ${apis.length} apis`))
  const mock = new MockAdapter(axios, { delayResponse: 2000 })
  apis.forEach((each) => {
    const mockTypeMap: Record<MockData['method'], typeof mock.onGet> = {
      GET: mock.onGet.bind(mock),
      POST: mock.onPost.bind(mock),
      PUT: mock.onPut.bind(mock),
      DELETE: mock.onDelete.bind(mock),
    }
    const matcher = mockTypeMap[each.method]
    matcher(each.path).reply(200, each.handler())
  })
}
