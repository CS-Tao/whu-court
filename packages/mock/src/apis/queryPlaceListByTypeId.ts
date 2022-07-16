import handler from '../data/queryPlaceListByTypeId'
import { MockData } from '../type'

const queryPlaceListByTypeId: MockData = {
  path: '/v1.0.0/ballBooking/queryPlaceListByTypeId',
  method: 'POST',
  handler,
}

export default queryPlaceListByTypeId
