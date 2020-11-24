import AuthenticationUtils from 'common/AuthenticationUtils'
import { MessageBox } from "element-ui"
import store from "@/store"
import router from '../../router'
window.axios = require("axios")

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// window.axios.create({
//   baseURL: 'http://112.137.129.214:15580',
//   withCredentials: true,
//   timeout: 5000
// })

window.axios.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

window.axios.interceptors.response.use(
  response => {
    if(response.status === 200) 
    // if (res.code !== 200) {
    //   Message({
    //     message: res.message || "Error",
    //     type: "error",
    //     duration: 2 * 1000
    //   });

    //   if (res.code === 401 || res.code === 419) {
    //     MessageBox.confirm(
    //       "You have been logged out, you can cancel to stay on this page, or log in again",
    //       "Confirm logout",
    //       {
    //         confirmButtonText: "Re-Login",
    //         cancelButtonText: "Cancel",
    //         type: "warning"
    //       }
    //     ).then(() => {
    //       AuthenticationUtils.logout();
    //     });
    //   }
      // return Promise.reject(new Error(res.message || "Error"));
    // } else {
    //   return res;
    // }
    return response
  },
  error => {
    store.dispatch('errorLog/addErrorLog', {
      err: {
        message: error.response.statusText,
        stack: JSON.stringify(error.response)
      },
      vm: 'Call API with Axios error',
      info: error.response.status,
      url: error.response.config.url
    })
    window.app.$broadcast("EVENT_COMMON_ERROR", error);
    if (error.response.status === 401 || error.response.status === 419) {
      MessageBox.confirm(
        "You have been logged out, you can cancel to stay on this page, or log in again",
        "Confirm logout",
        {
          confirmButtonText: "Re-Login",
          cancelButtonText: "Cancel",
          type: "warning"
        }
      ).then(() => {
        window.app.$broadcast("UserSessionRegistered");
        store.dispatch("user/logout").then(() => {
          AuthenticationUtils.removeAuthenticationData();
          router.push({ name: 'Login'})
        });
      });
    }
    // console.log("err" + error); // for debug
    // Message({
    //   message: error.message,
    //   type: "error",
    //   duration: 2 * 1000
    // });
    return Promise.reject(error);
  }
);

export default class BaseRequest {
  getUrlPrefix() {
    return '';
  }

  getCurrentLocale() {
    if (window.i18n) {
      return window.i18n.locale;
    }
  }

  appendLocale (data) {
    const lang = this.getCurrentLocale();
    return Object.assign(data, { lang });
  }

  async get(url, params = {}) {
    try {
      const config = {
        params: params
      }
      console.log('get', url)
      const response = await window.axios.get(this.getUrlPrefix('GET') + url, config);
      return this._responseHandler(response);
    } catch (error) {
      this._errorHandler(error);
    }
  }

  async put(url, data = {}) {
    try {
      console.log('put', url)
      const response = await window.axios.put(this.getUrlPrefix() + url, data);
      return this._responseHandler(response);
    } catch (error) {
      this._errorHandler(error);
    }
  }

  async post(url, data = {}) {
    try {
      console.log('post', url)
      const response = await window.axios.post(this.getUrlPrefix() + url, data);
      return this._responseHandler(response);
    } catch (error) {
      this._errorHandler(error);
    }
  }

  async del(url, data = {}) {
    try {
      console.log('delete', url)
      const response = await window.axios.delete(this.getUrlPrefix() + url, {data});
      return this._responseHandler(response);
    } catch (error) {
      this._errorHandler(error);
    }
  }

  async _responseHandler(response) {
    console.log(response)
    const data = response.data;
    if (response.status === 202) {
      data.redirectUrl = '/';
    }
    return data;
  }

  // async download(url, params, fileName) {
  //   const response = await this.get(url, params);
  //   CsvUtils.export(response, fileName);
  // }

  _errorHandler(err) {
    window.app.$broadcast('EVENT_COMMON_ERROR', err);
    if (err.response && err.response.status === 401) { // Unauthorized (session timeout)
      AuthenticationUtils.removeAuthenticationData();
      window.app.$broadcast('UserSessionRegistered');
    }
    // if (err.response && err.response.status === 503) { // maintenance
    //   window.location.reload();
    // }
    throw err;
  }

}
