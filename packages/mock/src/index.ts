import { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import chalk from 'chalk'
import logger from '@whu-court/logger'
import apis from './apis'
import { MockData } from './type'

const mockMap = new WeakSet()

export const mockAxios = (axios: AxiosInstance) => {
  if (mockMap.has(axios)) return

  mockMap.add(axios)

  process.env.NODE_ENV !== 'development' &&
    logger.warn(chalk.gray('[MOCK]'), chalk.yellow(`Mock axios enabled for ${apis.length} apis`))
  const mock = new MockAdapter(axios, { delayResponse: 200 })
  apis.forEach((each) => {
    const mockTypeMap: Record<MockData['method'], typeof mock.onGet> = {
      GET: mock.onGet.bind(mock),
      POST: mock.onPost.bind(mock),
      PUT: mock.onPut.bind(mock),
      DELETE: mock.onDelete.bind(mock),
    }
    const matcher = mockTypeMap[each.method]
    matcher(each.path).reply((config) => {
      return [200, each.handler(config)]
    })
  })
}
