export default () => {
  const shouldError = Math.random() > 0.85
  if (shouldError) {
    return {
      errcode: 1,
      errmsg: '[MOCK] 当前时间段:18:00-19:00,场馆已被预定',
      detailErrMsg: null,
      data: null,
      hint: null,
    }
  }
  return {
    errcode: 0,
    errmsg: '',
    detailErrMsg: null,
    data: {
      orderNumber: '1234567890',
      status: 1,
    },
    hint: null,
  }
}
