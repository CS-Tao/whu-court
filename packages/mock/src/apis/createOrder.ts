import { MockData } from '../type'
import data from '../data/createOrder.json'

const createOrder: MockData = {
  path: '/v1.0.0/order/create',
  method: 'POST',
  handler: function () {
    return data
  },
}

export default createOrder
