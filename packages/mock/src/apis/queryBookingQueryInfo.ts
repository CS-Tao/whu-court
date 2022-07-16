import handler from '../data/queryBookingQueryInfo'
import { MockData } from '../type'

const queryBookingQueryInfo: MockData = {
  path: '/v1.0.0/ballBooking/queryHomeBookingInfo',
  method: 'POST',
  handler,
}

export default queryBookingQueryInfo
