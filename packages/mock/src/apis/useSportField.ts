import { MockData } from '../type'
import data from '../data/useSportField.json'

const queryReservePlaceDetail: MockData = {
  path: '/v1.0.0/ballBooking/useSportField',
  method: 'POST',
  handler: function () {
    return data
  },
}

export default queryReservePlaceDetail
