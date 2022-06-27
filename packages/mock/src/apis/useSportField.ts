import data from '../data/useSportField.json'
import { MockData } from '../type'

const queryReservePlaceDetail: MockData = {
  path: '/v1.0.0/ballBooking/useSportField',
  method: 'POST',
  handler: function () {
    return data
  },
}

export default queryReservePlaceDetail
