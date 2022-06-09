import { AxiosInstance } from 'axios'
import BaseManager from '../BaseManager'
import { getApiMap } from '../../apis'

class MonitorManager extends BaseManager {
  constructor(http: AxiosInstance) {
    super(http, getApiMap(http))
  }
}

export default MonitorManager
