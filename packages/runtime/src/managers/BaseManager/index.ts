import { AxiosInstance } from 'axios'
import { API_MAP } from '../../types'

class BaseManager {
  public constructor(http: AxiosInstance, apis: API_MAP) {
    this.http = http
    this.apis = apis
  }

  protected http: AxiosInstance
  protected apis: API_MAP
}

export default BaseManager
