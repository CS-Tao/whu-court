import handler from '../data/myOrder'
import { MockData } from '../type'

const myOrder: MockData = {
  path: /\/v1.0.0\/order\/myOrder/,
  method: 'POST',
  handler,
}

export default myOrder
