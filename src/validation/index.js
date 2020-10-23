import Vue from 'vue';
import VeeValidate, { Validator } from 'vee-validate';

const i18n = window.i18n;
import './vailidators';
import Dictionary from './dictionary';

const config = {
  errorBagName: 'errors', // change if property conflicts
  fieldsBagName: 'fieldss', 
};

Vue.use(VeeValidate, config);
Vue.use(VeeValidate, { i18n });
Validator.localize(i18n.locale, Dictionary[i18n.locale]);