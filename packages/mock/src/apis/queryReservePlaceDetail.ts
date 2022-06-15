import { MockData } from '../type'
import data from '../data/queryReservePlaceDetail.json'

const queryReservePlaceDetail: MockData = {
  path: '/v1.0.0/ballBooking/queryReservePlaceDetail',
  method: 'POST',
  handler: function () {
    return data
  },
}

export default queryReservePlaceDetail
