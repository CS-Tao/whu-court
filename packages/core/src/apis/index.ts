import { AxiosInstance } from 'axios'
import { API_MAP } from '../types'

export const getApiMap: (httpClient: AxiosInstance) => API_MAP = (httpClient) => {
  return {
    getBookingDay: (config) => {
      return httpClient.get('/v1.0.0/ballBooking/getBookingDay', config)
    },

    queryPlaceListByTypeId: (data, config) => {
      return httpClient.post('/v1.0.0/ballBooking/queryPlaceListByTypeId', data, config)
    },

    queryReservePlaceDetail: (data, config) => {
      return httpClient.post('/v1.0.0/ballBooking/queryReservePlaceDetail', data, config)
    },

    useSportField: (data, config) => {
      return httpClient.post('/v1.0.0/ballBooking/useSportField', data, config)
    },

    cancelOrder: (params, config) => {
      return httpClient.post(`/v1.0.0/order/cancel/${params.orderId}`, config)
    },

    getOrderDetails: (params, config) => {
      return httpClient.get(`/v1.0.0/order/details/${params.orderId}`, config)
    },

    createOrder: (data, config) => {
      return httpClient.post('/v1.0.0/order/create', data, config)
    },

    myOrder: (data, config) => {
      return httpClient.post('/v1.0.0/order/myOrder', data, config)
    },

    queryBookingQueryInfo: (data, config) => {
      return httpClient.post('/v1.0.0/ballBooking/queryHomeBookingInfo', data, config)
    },
  }
}
