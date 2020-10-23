import Vue from 'vue';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import Utils from './Utils';

Vue.filter('timestampToDate', function (timestamp, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(timestamp, 'x').format(pattern);
});

Vue.filter('datetimeFormatter', function (timestamp, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(timestamp).format(pattern);
});

Vue.filter('timestampFormatter', function (timestamp) {
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
});

Vue.filter( 'upperFirst', function (value) {
  return window._.upperFirst(value);
});

Vue.filter( 'uppercaseFirst', function (value) {
  return window._.startCase(value);
});

Vue.filter('toNumber', function (value) {
  const number = parseFloat(value);
  if (isNaN(number)) {
    return value;
  }
  // is e number (Ex: 1e-7)
  if (number.toString().includes('e')) {
    return Utils.trimEndZero(new BigNumber(`${value || 0}`).toFixed(20));
  }
  return number;
});

Vue.filter('naturalPartOfNumber', function (number) {
  return Math.floor(number);
});

Vue.filter('fractionPartOfNumber', function (number) {
  const num = parseFloat(number);
  return Number(String(num).split('.')[1] || 0);
});

Vue.filter('sliceChar', function (value, length = 3) {
  return window._.chain(`${value}`)
                 .slice(0, length)
                 .join('')
                 .value();
});
