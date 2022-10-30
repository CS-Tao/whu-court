const insertReturn = (str: string, insertPerPosition: number) => {
  let result = ''
  let idx = 0
  for (let i = 0, len = str.length; i < len; i++) {
    result += str[i]
    const isChinese = escape(str[i]).indexOf('%u') >= 0
    if ((isChinese && idx > 1 ? [0, 1] : [0]).includes((idx + 1) % insertPerPosition)) {
      result += '\n'
    }
    idx++
    if (isChinese) idx++
  }
  return result
}

export default insertReturn
