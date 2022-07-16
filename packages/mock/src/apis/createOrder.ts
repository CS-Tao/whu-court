import handler from '../data/createOrder'
import { MockData } from '../type'

const createOrder: MockData = {
  path: '/v1.0.0/order/create',
  method: 'POST',
  handler,
}

export default createOrder
