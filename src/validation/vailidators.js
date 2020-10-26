import Vue from 'vue';
import _ from 'lodash';

Vue.mixin({
  methods: {
    async resetErrors () {
      this.serverErrors = []
      this.errors.clear()
    },
    _appendErrors (errors) {
      _.forEach(errors, (error, key) => {
        const message = window.i18n.te(_.head(error))
          ? window.i18n.t(_.head(error), { attribute: window.i18n.t(`validation.attributes.${key}`) })
          : window.i18n.t(`validation.${_.head(error)}`, { attribute: window.i18n.t(`validation.attributes.${key}`) })
        this.errors.add({
          field: key,
          msg: message
        })
      })
    }
  }
})
