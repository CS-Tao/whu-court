import { AxiosInstance } from 'axios'
import BaseManager from '../BaseManager'
import { getApiMap } from '../../apis'

class ReserveManager extends BaseManager {
  constructor(http: AxiosInstance) {
    super(http, getApiMap(http))
  }

  public async getBookingDay() {
    return this.apis.getBookingDay()
  }
}

export default ReserveManager
