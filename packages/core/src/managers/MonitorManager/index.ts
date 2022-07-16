import http from '@whu-court/http'
import { getApiMap } from '../../apis'
import BaseManager from '../BaseManager'

class MonitorManager extends BaseManager {
  constructor() {
    super(http, getApiMap(http))
  }
}

export default MonitorManager
