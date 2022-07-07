import moment from 'moment'

export const getTomorrowDate = () => {
  return moment().add(1, 'd').format('YYYY-MM-DD')
}

export const getCurrentTime = (precise = false) => {
  return moment().format('YYYY-MM-DD HH:mm:ss' + (precise ? '.SSS' : ''))
}
