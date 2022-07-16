import handler from '../data/useSportField'
import { MockData } from '../type'

const queryReservePlaceDetail: MockData = {
  path: '/v1.0.0/ballBooking/useSportField',
  method: 'POST',
  handler,
}

export default queryReservePlaceDetail
