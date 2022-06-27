import data from '../data/getBookingDay.json'
import { MockData } from '../type'

const getBookingDay: MockData = {
  path: '/v1.0.0/ballBooking/getBookingDay',
  method: 'GET',
  handler: function () {
    return data
  },
}

export default getBookingDay
