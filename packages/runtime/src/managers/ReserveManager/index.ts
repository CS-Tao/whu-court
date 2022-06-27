import http from '@whu-court/http'
import Reporter from '@whu-court/reporter'
import { getApiMap } from '../../apis'
import BaseManager from '../BaseManager'

class ReserveManager extends BaseManager {
  constructor() {
    super(http, getApiMap(http))
  }

  public async getBookingDay() {
    Reporter.report(new Error('getBookingDay error'))
    return this.apis.getBookingDay()
  }
}

export default ReserveManager
