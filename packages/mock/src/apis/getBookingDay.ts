import { MockData } from '../type'
import data from '../data/getBookingDay.json'

const getBookingDay: MockData = {
  path: '/v1.0.0/ballBooking/getBookingDay',
  method: 'GET',
  handler: function () {
    return data
  },
}

export default getBookingDay
