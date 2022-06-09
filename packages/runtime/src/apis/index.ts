import { AxiosInstance } from 'axios'
import { API_MAP } from '../types'

export const getApiMap: (httpClient: AxiosInstance) => API_MAP = (httpClient) => {
  return {
    getBookingDay: () => {
      return httpClient.get('/v1.0.0/ballBooking/getBookingDay')
    },

    queryPlaceListByTypeId: (data) => {
      return httpClient.post('/v1.0.0/ballBooking/queryPlaceListByTypeId', data)
    },

    queryReservePlaceDetail: (data) => {
      return httpClient.post('/v1.0.0/ballBooking/queryReservePlaceDetail', data)
    },

    useSportField: (data) => {
      return httpClient.post('/v1.0.0/ballBooking/useSportField', data)
    },

    cancelOrder: (params) => {
      return httpClient.post(`/v1.0.0/order/cancel/${params.orderId}`)
    },

    getOrderDetails: (params) => {
      return httpClient.get(`/v1.0.0/order/details/${params.orderId}`)
    },

    createOrder: (data) => {
      return httpClient.post('/v1.0.0/order/create', data)
    },
  }
}
