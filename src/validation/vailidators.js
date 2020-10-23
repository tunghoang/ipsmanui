import { Validator } from 'vee-validate';
import Vue from 'vue';
import _ from 'lodash';
// load errors from server

Vue.mixin({
  data () {
    return {
      serverErrors: [],
    };
  },
  methods: {
    async resetErrors () {
      this.serverErrors = [];
      this.errors.clear();
    },
    loadErrorsFromServer (errors) {
      this.resetErrors();
      if (_.isEmpty(errors)) {
        return;
      }
      this.serverErrors = errors;
      this._appendErrors(errors);
    },
    _appendErrors (errors) {
      _.forEach(errors, (error, key) => {
        const message = window.i18n.te(_.head(error))
          ? window.i18n.t(_.head(error), { attribute: window.i18n.t(`validation.attributes.${key}`) })
          : window.i18n.t(`validation.${_.head(error)}`, { attribute: window.i18n.t(`validation.attributes.${key}`) });
        this.errors.add({
          field: key,
          msg: message,
        });
      });
    },
  },
});

Validator.prototype._formatErrorMessage = function _formatErrorMessage (field, rule, data, targetName) {
  if (data === void 0) {
    data = {};
  }
  if (targetName === void 0) {
    targetName = null;
  }

  const name = this._getFieldDisplayName(field);
  const params = this._getLocalizedParams(rule, targetName);

  return getFieldMessage(this.locale, field.name, rule.name, [name, params, data]);
};

function hasDictionaryMessage (locale, key) {
  return !!(window.app.$validator &&
    window.app.$validator.dictionary &&
    window.app.$validator.dictionary.container[locale].messages &&
    window.app.$validator.dictionary.container[locale].messages[key]
  );
}

function getFieldMessage (locale, field, rule, data) {
  const path = `validation.custom.${field}.${rule}`;
  if (window.i18n.te(path)) {
    return window.i18n.t(path, locale, data);
  }

  return getMessage(locale, rule, data);
}

function getMessage (locale, rule, data) {
  if (hasDictionaryMessage(locale, rule)) {
    const _message = window.app.$validator.dictionary.container[locale].messages[rule];
    return typeof _message === 'function' ? _message(...data) : _message;
  }

  const path = `validation.${rule}`;

  if (!window.i18n.te(path)) {
    if (hasDictionaryMessage(locale, '_default')) {
      const _message = window.app.$validator.dictionary.container[locale].messages._default;
      return typeof _message === 'function' ? _message(...data) : _message;
    }
    return window.i18n.t(('validation.messages._default'), locale, data);
  }

  const params = {};
  _.forEach(window.i18n.t(path).match(/{([^}]+)}/g), (field, index) => {
    params[field.replace(/[{:}]/g, '')] = data[index];
  });
  return window.i18n.t(path, locale, params);
}
