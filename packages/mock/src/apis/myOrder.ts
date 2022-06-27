import data from '../data/myOrder.json'
import { MockData } from '../type'

const myOrder: MockData = {
  path: /\/v1.0.0\/order\/myOrder/,
  method: 'POST',
  handler: function () {
    return data
  },
}

export default myOrder
