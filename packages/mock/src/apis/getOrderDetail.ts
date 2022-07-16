import handler from '../data/getOrderDetail'
import { MockData } from '../type'

const getOrderDetail: MockData = {
  path: /\/v1.0.0\/order\/details\/.+/,
  method: 'GET',
  handler,
}

export default getOrderDetail
