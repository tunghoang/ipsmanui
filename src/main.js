
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */
import 'common/bootstrap';
import 'common/Filters';

import Vue from 'vue';

import LocalStorage from 'common/LocalStorageUtils'

import 'normalize.css/normalize.css'

import Element from 'element-ui'
import '@/sass/element/element-variables.scss'

import '@/sass/element/index.scss' // global css


import i18n from "./lang";

import App from './App.vue';

import store from './store';
import './permission'
import './icons'
import router from './router';


import * as filters from './filters' // global filters

import VueBroadcast from 'common/VueBroadcast';
// import VueRequestCanceler from  'common/VueRequestCanceler';
// import GlobalSocket from 'common/GlobalSocket';
// import "common/registerServiceWorker";



import ClickOutside from 'vue-click-outside';
import './validation';


Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})


Vue.directive('click-outside', ClickOutside);


Vue.use(VueBroadcast);
// Vue.use(VueRequestCanceler);
Vue.use(Element, {
  size: LocalStorage.getItem('size') || 'medium',
  i18n: (key, value) => i18n.t(key, value)
})


// window.GlobalSocket = new GlobalSocket();

Vue.prototype.$isAuthenticated = window.isAuthenticated;



Vue.mixin({
  data () {
    return {
      isSubmitting: false,
    };
  },
  methods: {
    startSubmit () {
      this.isSubmitting = true;
    },

    endSubmit () {
      this.isSubmitting = false;
    },

    getSubmitName (name) {
      return this.isSubmitting ? this.$t('common.processing') : name;
    },
  },
});

window.app = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');