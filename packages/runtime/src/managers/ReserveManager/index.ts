import { AxiosInstance } from 'axios'
import Reporter from '@whu-court/reporter'
import BaseManager from '../BaseManager'
import { getApiMap } from '../../apis'

class ReserveManager extends BaseManager {
  constructor(http: AxiosInstance) {
    super(http, getApiMap(http))
  }

  public async getBookingDay() {
    Reporter.report(new Error('getBookingDay error'))
    return this.apis.getBookingDay()
  }
}

export default ReserveManager
