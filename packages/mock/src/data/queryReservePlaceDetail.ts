import { fill0 } from '@whu-court/utils'

export default () => ({
  errcode: 0,
  errmsg: null,
  detailErrMsg: null,
  data: {
    placeName: '竹园体育馆（信部东区体育馆）',
    collegeId: '7269b8d5bfe44115aa01c1497ed52bc0',
    collegeName: '信息学部',
    placeUrl: 'https://miniapp.whu.edu.cn/fileweb/upload/file/wdportal/20211112/976ba3699d964b5ba276ed31be7a7878.png',
    placeBeginTime: '08:00',
    placeEndTime: '21:00',
    placeAddress: '武汉大学竹园体育馆',
    typeName: '乒乓球',
    sportTypePrice: 5.0,
    reserveDate: '2022年06月01日',
    discountDuration: 0,
    reserveTimeInfoList: [8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20].map((each) => ({
      canReserve: Math.random() > 0.15 ? '0' : '1',
      isReserve: null,
      reserveBeginTime: `${fill0(each)}:00`,
      reserveEndTime: `${fill0(each + 1)}:00`,
      timeAreaVal: '1',
      fieldPrice: 5.0,
      lightPrice: 0.0,
      isSelfUseField: 'N',
      isStudent: 0,
    })),
  },
  hint: null,
})
