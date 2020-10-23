
// if ((~window.navigator.userAgent.indexOf('MSIE')) ||
//   (~window.navigator.userAgent.indexOf('Trident/')) ||
//   (~window.navigator.userAgent.indexOf('Edge/'))) {
//   window.Promise = require('es6-promise').Promise;
//   require('es6-object-assign').polyfill();
// }

import Vue from 'vue';
import VueSession from 'vue-session';
import AuthenticationUtils from "./AuthenticationUtils";


window._ = require('lodash');

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = require('axios');

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

window.isAuthenticated = AuthenticationUtils.isAuthenticated();

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */
// const locale = document.documentElement.lang;


Vue.use(VueSession, { persist: true });
