import handler from '../data/queryReservePlaceDetail'
import { MockData } from '../type'

const queryReservePlaceDetail: MockData = {
  path: '/v1.0.0/ballBooking/queryReservePlaceDetail',
  method: 'POST',
  handler,
}

export default queryReservePlaceDetail
