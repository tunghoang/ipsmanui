import moment from 'moment';
import i18n from '@/lang';
import { chain } from 'lodash'


/**
 * Show plural label if time is plural number
 * @param {number} time
 * @param {string} label
 * @return {string}
 */
function pluralize(time, label) {
  const after = i18n.locale == 'en' ? 's' : ''
  if (time === 1) {
    return time + label
  }
  return time + label + after
}

/**
 * @param {number} time
 */
export function betweenTime(time1, time2) {
  const between = Math.abs(parseInt(time1) - parseInt(time2))
  if (between < 3600) {
    return pluralize(~~(between / 60), ` ${i18n.t('time.minute')}`)
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ` ${i18n.t('time.hour')}`)
  }
  return pluralize(~~(between / 86400), ` ${i18n.t('time.day')}`)
}

/**
 * @param {number} time or {string} 'expired'
 */
export function expiryDate(time) {
  const between = parseInt(time) - Date.now() / 1000
  if (between < 3600 && between > 0) {
    return pluralize(~~(between / 60), ` ${i18n.t('time.minute')}`)
  } else if (between < 86400 && between >= 3600) {
    return pluralize(~~(between / 3600), ` ${i18n.t('time.hour')}`)
  } else if(between >= 86400) {
    return pluralize(~~(between / 86400), ` ${i18n.t('time.day')}`)
  }
  return i18n.t('time.expired')
}

/**
 * @param {number} time or {string} 'expired'
 */
export function isExpiried(time) {
  const between = parseInt(time) - Date.now() / 1000
  if (between < 0) {
    return true
  }
  return false
}


/**
 * Number formatting
 * like 10000 => 10k
 * @param {number} num
 * @param {number} digits
 */
export function numberFormatter(num, digits) {
  const si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9, symbol: 'G' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'k' }
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
    }
  }
  return num.toString()
}

/**
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter(num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

/**
 * Upper case first char
 * @param {String} string
 */
export function uppercaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * unixtime to date
 * @param {String} string, {Int} string
 * @param {String} string
 */
export function timestampToDate (timestamp, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(parseInt(timestamp)*1000, 'x').format(pattern);
}

export function datetimeFormatter (timestamp, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(timestamp).format(pattern);
}

export function timestampFormatter (timestamp) {
  const datetime  = moment(timestamp);
  const today     = new Date();

  if (datetime.isSame(today, 'day')) {
    return datetime.format('hh:mm A');
  }

  if (datetime.isSame(today, 'week')) {
    return datetime.format('ddd');
  }

  if (!datetime.isSame(today, 'year')) {
    return datetime.format('YYYY-MM-DD');
  }

  return datetime.format('DD MMM');
}


export function naturalPartOfNumber (number) {
  return Math.floor(number);
}

export function sliceChar (value, length = 3) {
  return chain(`${value}`)
                 .slice(0, length)
                 .join('')
                 .value();
}
