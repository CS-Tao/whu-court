import handler from '../data/getBookingDay'
import { MockData } from '../type'

const getBookingDay: MockData = {
  path: '/v1.0.0/ballBooking/getBookingDay',
  method: 'GET',
  handler,
}

export default getBookingDay
