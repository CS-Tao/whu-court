import { MockData } from '../type'
import data from '../data/queryPlaceListByTypeId.json'

const queryPlaceListByTypeId: MockData = {
  path: '/v1.0.0/ballBooking/queryPlaceListByTypeId',
  method: 'POST',
  handler: function () {
    return data
  },
}

export default queryPlaceListByTypeId
