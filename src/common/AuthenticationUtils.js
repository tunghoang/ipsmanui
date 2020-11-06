import Vue from 'vue';
import LocalStorage from 'common/LocalStorageUtils'
import { deleteAllCookies } from '../utils'

export default class AuthenticationUtils {

  static isAuthenticated () {
    return LocalStorage.getItem('auth') || false
  }

  static saveAuthenticationData () {
    LocalStorage.saveItem('auth', true);
  }

  static removeAuthenticationData () {
    deleteAllCookies()
    LocalStorage.removeItem('auth');
    this.setLocale('en');
  }

  static setLocale(newLocale = null) {
    const locale = newLocale || this.getLocale();

    if (locale === this.getLocale()) {
      return;
    }

    const html = document.documentElement;
    html.setAttribute('lang', locale);

    window.i18n.locale = locale;
    window.app.$broadcast('UPDATED_LOCALE', locale);

    return LocalStorage.saveItem('locale', locale);
  }

  static logout () {
    this.removeAuthenticationData();
    Vue.prototype.$isAuthenticated = window.isAuthenticated = false;

    if (window.app.$store) {
      window.app.$store.dispatch('user/logout');
    }
  }

  static login () {
    this.saveAuthenticationData();
    Vue.prototype.$isAuthenticated = window.isAuthenticated;
  }
  static getLocale(defaultLocale = 'en') {
    return window.localStorage.getItem('locale') || defaultLocale;
  }
}
