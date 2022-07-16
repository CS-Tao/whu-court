import handler from '../data/cancelOrder'
import { MockData } from '../type'

const cancelOrder: MockData = {
  path: /\/v1.0.0\/order\/cancel\/.+/,
  method: 'POST',
  handler,
}

export default cancelOrder
