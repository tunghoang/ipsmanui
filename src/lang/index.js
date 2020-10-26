import LocalStorage from 'common/LocalStorageUtils'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementViLocale from 'element-ui/lib/locale/lang/vi'// element-ui lang
import enLocale from './en'
import vnLocale from './vi'

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale
  },
  vi: {
    ...vnLocale,
    ...elementViLocale
  }
}

export function getLanguage() {
  const chooseLanguage = LocalStorage.getItem('language')
  if (chooseLanguage) return chooseLanguage

  // if has not choose language
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'en'
}

Vue.use(VueI18n)
 
window.i18n = new VueI18n({
  locale: getLanguage(),
  messages: messages
})

const i18n = new VueI18n({
  // set locale
  // options: en | zh | es
  locale: getLanguage(),
  // set locale messages
  messages: messages
})

export default i18n
