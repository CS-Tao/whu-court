import { MockData } from '../type'
import data from '../data/cancelOrder.json'

const cancelOrder: MockData = {
  path: /\/v1.0.0\/order\/cancel\/.+/,
  method: 'POST',
  handler: function () {
    return data
  },
}

export default cancelOrder