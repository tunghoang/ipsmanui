import Vue from 'vue';
import { head, forEach } from 'lodash';

Vue.mixin({
  methods: {
    async resetErrors () {
      this.serverErrors = []
      this.errors.clear()
    },
    _appendErrors (errors) {
      forEach(errors, (error, key) => {
        const message = window.i18n.te(head(error))
          ? window.i18n.t(head(error), { attribute: window.i18n.t(`validation.attributes.${key}`) })
          : window.i18n.t(`validation.${head(error)}`, { attribute: window.i18n.t(`validation.attributes.${key}`) })
        this.errors.add({
          field: key,
          msg: message
        })
      })
    }
  }
})
