import store from "@/store"
import axios from 'axios'

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers['Authorization'] = localStorage.getItem('token')
axios = axios.create({
  baseURL: 'https://ipsmanagerapi.uetis.com',
  proxy: false
});
axios.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    if(!response.status === 200) return
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
      // Todo
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

export default class IpsManagerRequest {
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
      const response = await axios.get(this.getUrlPrefix('GET') + url, config);
      return this._responseHandler(response);
    } catch (error) {
      this._errorHandler(error);
    }
  }

  async put(url, data = {}) {
    try {
      console.log('put', url)
      const response = await axios.put(this.getUrlPrefix() + url, data);
      return this._responseHandler(response);
    } catch (error) {
      this._errorHandler(error);
    }
  }

  async post(url, data = {}) {
    try {
      console.log('post', url)
      const response = await axios.post(this.getUrlPrefix() + url, data);
      return this._responseHandler(response);
    } catch (error) {
      this._errorHandler(error);
    }
  }

  async del(url, data = {}) {
    try {
      console.log('delete', url)
      const response = await axios.delete(this.getUrlPrefix() + url, {data});
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
    }
    // if (err.response && err.response.status === 503) { // maintenance
    //   window.location.reload();
    // }
    throw err;
  }
}
