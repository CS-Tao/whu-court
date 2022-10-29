import handler from '../data/getInformList'
import { MockData } from '../type'

const getInformList: MockData = {
  path: '/v1.0.0/inform/getInformList',
  method: 'POST',
  handler,
}

export default getInformList
