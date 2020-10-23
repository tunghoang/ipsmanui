import Vue from 'vue';

export default class AuthenticationUtils {

  static isAuthenticated () {
    return true
    AuthenticationUtils.loadDataIfNeed();
    return !!AuthenticationUtils.accessToken;
  }

  static saveAuthenticationData (data) {
    AuthenticationUtils.accessToken = data.access_token || '';
    window.localStorage.setItem('access_token', data.access_token || '');
  }

  static removeAuthenticationData () {
    AuthenticationUtils.saveAuthenticationData({});
    AuthenticationUtils.accessToken = '';
    AuthenticationUtils.setLocale('en');
  }

  static getAccessToken () {
    AuthenticationUtils.loadDataIfNeed();

    return AuthenticationUtils.accessToken;
  }


  static loadData () {
    AuthenticationUtils.accessToken = window.localStorage.getItem('access_token') || '';
    AuthenticationUtils.dataLoaded = true;
  }

  static loadDataIfNeed () {
    if (AuthenticationUtils.dataLoaded === undefined || !AuthenticationUtils.dataLoaded) {
      AuthenticationUtils.loadData();
    }
  }

  static setLocale(newLocale = null) {
    const locale = newLocale || AuthenticationUtils.getLocale();

    if (locale === AuthenticationUtils.getLocale()) {
      return;
    }

    const html = document.documentElement;
    html.setAttribute('lang', locale);

    window.i18n.locale = locale;
    window.app.$broadcast('UPDATED_LOCALE', locale);

    return window.localStorage.setItem('locale', locale);
  }

  static logout () {
    window.app.$store.state.user || {};

    AuthenticationUtils.removeAuthenticationData();
    Vue.prototype.$isAuthenticated = window.isAuthenticated = false;
    window.axios.defaults.headers.common.Authorization = '';

    if (window.app.$store) {
      window.app.$store.dispatch('user/logout');
    }
  }

  static login (token) {
    AuthenticationUtils.saveAuthenticationData(token);
    window.axios.defaults.headers.common.Authorization = `Bearer ${AuthenticationUtils.getAccessToken()}`;

    window.isAuthenticated = AuthenticationUtils.isAuthenticated();
    Vue.prototype.$isAuthenticated = window.isAuthenticated;
  }
  static getLocale(defaultLocale = 'en') {
    return window.localStorage.getItem('locale') || defaultLocale;
  }
}
