import ja from 'vee-validate/dist/locale/ja';
import en from 'vee-validate/dist/locale/en';
import vi from 'vee-validate/dist/locale/vi';

export default {
  en: {
    messages: en.messages,
    attributes: window.i18n.t('validation.attributes', 'en')
  },
  ja: {
    messages: ja.messages,
    attributes: window.i18n.t('validation.attributes', 'ja')
  },
  vi: {
    messages: vi.messages,
    attributes: window.i18n.t('validation.attributes', 'vi')
  },
};
