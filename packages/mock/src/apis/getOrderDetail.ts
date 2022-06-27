import data from '../data/getOrderDetail.json'
import { MockData } from '../type'

const getOrderDetail: MockData = {
  path: /\/v1.0.0\/order\/details\/.+/,
  method: 'GET',
  handler: function () {
    return data
  },
}

export default getOrderDetail
