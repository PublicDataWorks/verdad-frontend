import moment from 'moment'

const options: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZoneName: 'short'
}

const format = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000)
  return date.toLocaleString(undefined, options).replace(',', '')
}

const diffInMinutes = (runAt: number) => {
  const runAtDate = new Date(runAt * 1000)
  const now = new Date()
  return Math.abs(runAtDate.getTime() - now.getTime()) / (1000 * 60)
}

const advance = (noMinutes: number) => {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 90)
  return date.toLocaleString(undefined, options).replace(',', '')
}

export default {
  format,
  diffInMinutes,
  advance
}
