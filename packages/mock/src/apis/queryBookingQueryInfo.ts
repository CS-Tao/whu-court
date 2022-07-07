import data from '../data/queryBookingQueryInfo.json'
import { MockData } from '../type'

const queryBookingQueryInfo: MockData = {
  path: '/v1.0.0/ballBooking/queryHomeBookingInfo',
  method: 'POST',
  handler: function () {
    return data
  },
}

export default queryBookingQueryInfo
