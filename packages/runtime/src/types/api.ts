export namespace RouterPathParams {
  export interface CancelOrderParams {
    orderId: string
  }

  export interface GetOrderDetailsParams {
    orderId: string
  }

  export type CreateOrderData = 0
}

export namespace RequestData {
  export interface QueryPlaceListByTypeIdData {
    typeId: string
    /**
     * @example 2022-05-31
     */
    reserveDate: string
    uid: string
    /**
     * @example 4
     */
    pageSize: number
    currentPage: number
  }

  export interface QueryReservePlaceDetailData {
    uid: string
    placeId: string
    typeId: string
    /**
     * @example '2022-06-01'
     */
    reserveDate: string
    fieldId: string
    /**
     * @example '8'
     */
    fieldNum: number
  }

  export interface UseSportFieldData {
    uid: string
    placeId: string
    typeId: string
    /**
     * @example '2022-06-01'
     */
    reserveDate: string
    fieldId: string
    /**
     * @example '8'
     */
    fieldNum: string
    isSelected: 'Y' | unknown
    reserveTimeList: Array<{
      /**
       * @example '16:00'
       */
      beginTime: string
      /**
       * @example '17:00'
       */
      endTime: string
    }>
  }

  export interface CreateOrderData {
    /**
     * @example '2022-06-01'
     */
    appointmentDate: string
    creatorId: string
    placeType: 1 | unknown
    /**
     * @example '16:00-17:00,17:00-18:00'
     */
    period: string
    fieldId: string
    motionTypeId: string
    placeId: string
    /**
     * @example '乒乓球'
     */
    typeName: string
    placeUrl: string
    /**
     * @example '武汉大学竹园体育馆'
     */
    placeAddress: string
    /**
     * @example '竹园体育馆（信部东区体育馆）'
     */
    placeName: string
    fieldNum: '8' | unknown
    /**
     * @example  '信息学部'
     */
    collegeName: string
    collegeId: string
    code: string
  }
}

export namespace ResponseData {
  type IsEnable = '0' | '1'

  export type GetBookingDayData = 0 | 1

  export interface QueryPlaceListByTypeIdData {
    totalRows: number
    pageSize: number
    currentPage: number
    totalPages: number
    startRow: number
    forceStartRow: boolean
    formNumber: number
    pageData: Array<{
      placeName: string
      placeId: string
      placeUrl: string
      placePrice: number
      /**
       * @example '08:00-21:00'
       */
      bookingTimeArea: '08:00-21:00'
      placeStatus: IsEnable
      morningCanReserve: IsEnable
      afternoonCanReserve: IsEnable
      eveningCanReserve: IsEnable
      canReserve: IsEnable
      /**
       * @example '18'
       */
      canReserveTime: string
      sportTypeList: Array<{
        typeId: string
        /**
         * @example '羽毛球'
         */
        typeName: string
      }>
      placeFieldInfoList: Array<{
        fieldId: string
        fieldNum: IsEnable
        fieldCloseStatus: IsEnable
        fieldReserveStatus: IsEnable
        reserveTimeInfoList: [
          {
            canReserve: IsEnable
            isReserve: IsEnable
            /**
             * @example '08:00'
             */
            reserveBeginTime: string
            /**
             * @example '14:00'
             */
            reserveEndTime: string
            timeAreaVal: IsEnable
            fieldPrice: number
            lightPrice: number
            isSelfUseField: null | 'N' | unknown
            isStudent: null | 0 | unknown
          },
        ]
      }>
    }>
    lastId: null | unknown
    esSortValues: null | unknown
  }

  export interface QueryReservePlaceDetailData {
    placeName: string
    collegeId: string
    /**
     * @example '信息学部'
     */
    collegeName: '信息学部'
    placeUrl: string
    /**
     * @example '08:00'
     */
    placeBeginTime: string
    /**
     * @example '21:00'
     */
    placeEndTime: string
    /**
     * @example '武汉大学竹园体育馆'
     */
    placeAddress: string
    /**
     * @example '乒乓球'
     */
    typeName: string
    sportTypePrice: number
    /**
     * @example '2022年06月01日'
     */
    reserveDate: string
    discountDuration: number
    reserveTimeInfoList: Array<{
      canReserve: IsEnable
      isReserve: null | unknown
      /**
       * @example '16:00'
       */
      reserveBeginTime: string
      /**
       * @example '17:00'
       */
      reserveEndTime: string
      timeAreaVal: IsEnable
      fieldPrice: number
      lightPrice: number
      isSelfUseField: null | 'N' | unknown
      isStudent: null | 0 | unknown
    }>
  }

  export type UseSportFieldData = boolean

  export type CancelOrderData = null | unknown

  export interface GetOrderDetailsData {
    id: number
    orderNumber: string
    transactionId: null | unknown
    refundNumber: null | unknown
    refundId: null | unknown
    /**
     * @example '2022-05-31 21:37:34'
     */
    createTime: string
    /**
     * @example  '2022-06-01 15:00:00'
     */
    expiresTime: string
    payTime: null | unknown
    cancelTime: null | unknown
    cancelChannel: null | unknown
    status: 1 | unknown
    /**
     * 学号
     */
    creatorId: string
    creatorIdentity: '2' | unknown
    placeType: 1 | unknown
    amount: number
    /**
     * @example '16:00-17:00,17:00-18:00'
     */
    period: string
    /**
     * @example '2022-06-01'
     */
    appointmentDate: string
    duration: '2' | unknown
    placeId: string
    motionTypeId: string
    fieldId: string
    lightingAmount: number
    isEvaluate: 0 | unknown
    payChannel: null | unknown
    fieldAmount: number
    discount: number
    applyRefundTime: null | unknown
    refundTime: null | unknown
    /**
     * @example '2022-05-31 21:37:34'
     */
    updateTime: string
    finishTime: null | unknown
    comfortScore: null | unknown
    hygieneScore: null | unknown
    serviceScore: null | unknown
    evaluateDesc: null | unknown
    evaluateTime: null | unknown
    /**
     * @example '乒乓球'
     */
    typeName: string
    placeUrl: string
    /**
     * @example '武汉大学竹园体育馆'
     */
    placeAddress: string
    /**
     * @example 竹园体育馆（信部东区体育馆）'
     */
    placeName: string
    fieldNum: '8' | unknown
    isDel: 0 | unknown
    payAmount: number
    discountDuration: '0' | unknown
    collegeId: string
    /**
     * @example '信息学部'
     */
    collegeName: string
    openId: string
    /**
     * @example 8545203
     */
    expiresMillisecond: number
    isPay: 0 | unknown
    code: null | unknown
    orderType: 0 | unknown
    cancelReason: null | unknown
    payNumber: null | unknown
    activityField: null | unknown
    isRefField: null | unknown
    activityBeginTime: null | unknown
    activityEndTime: null | unknown
    payType: null | unknown
    activityName: null | unknown
  }

  export interface CreateOrderData {
    orderNumber: string
    status: 1 | unknown
  }
}

export interface API_MAP {
  getBookingDay: () => Promise<ResponseData.GetBookingDayData>

  queryPlaceListByTypeId: (
    data: RequestData.QueryPlaceListByTypeIdData,
  ) => Promise<ResponseData.QueryPlaceListByTypeIdData>

  queryReservePlaceDetail: (
    data: RequestData.QueryReservePlaceDetailData,
  ) => Promise<ResponseData.QueryReservePlaceDetailData>

  useSportField: (data: RequestData.UseSportFieldData) => Promise<ResponseData.UseSportFieldData>

  cancelOrder: (params: RouterPathParams.CancelOrderParams) => Promise<ResponseData.CancelOrderData>

  getOrderDetails: (params: RouterPathParams.GetOrderDetailsParams) => Promise<ResponseData.GetOrderDetailsData>

  createOrder: (data: RequestData.CreateOrderData) => Promise<ResponseData.CreateOrderData>
}
