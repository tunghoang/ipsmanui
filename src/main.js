// if ((~window.navigator.userAgent.indexOf('MSIE')) ||
//   (~window.navigator.userAgent.indexOf('Trident/')) ||
//   (~window.navigator.userAgent.indexOf('Edge/'))) {
//   window.Promise = require('es6-promise').Promise;
//   require('es6-object-assign').polyfill();
// }

import Vue from 'vue';

Vue.config.devtools = true;
import AuthenticationUtils from "common/AuthenticationUtils"

import LocalStorage from 'common/LocalStorageUtils'

import i18n from "./lang"

import VueBroadcast from 'common/VueBroadcast'
import VueSession from 'vue-session'
import ClickOutside from 'vue-click-outside'


import Element from 'element-ui'
import 'normalize.css/normalize.css'
import '@/sass/element/element-variables.scss'

import '@/sass/element/index.scss' // global css
import '@/sass/app.scss' // global css

import store from './store';
import './permission'
import './icons'
import router from './router';


import * as filters from './filters' // global filters

import App from './App.vue';
import './validation';
import './utils/error-log'

import { BForm } from 'bootstrap-vue'
Vue.component('b-form', BForm)

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})


Vue.use(Element, {
  size: LocalStorage.getItem('size') || 'medium',
  i18n: (key, value) => i18n.t(key, value)
})


window.isAuthenticated = AuthenticationUtils.isAuthenticated();

Vue.prototype.$isAuthenticated = window.isAuthenticated;
Vue.directive('click-outside', ClickOutside);

Vue.use(VueBroadcast);
Vue.use(VueSession, { persist: true });


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
