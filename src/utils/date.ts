import moment from 'moment'

const format = (unixTimestamp: number): string => {
  return moment(unixTimestamp * 1000).format('MM/DD/YYYY, hh:mm A')
}

export default {
  format
}
