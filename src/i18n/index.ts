import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '../locales/en/common.json'
import arCommon from '../locales/ar/common.json'
import enFinance from '../locales/en/finance.json'
import arFinance from '../locales/ar/finance.json'
import enLayout from '../locales/en/layout.json'
import arLayout from '../locales/ar/layout.json'
import enDashboard from '../locales/en/dashboard.json'
import arDashboard from '../locales/ar/dashboard.json'
import enGroups from '../locales/en/groups.json'
import arGroups from '../locales/ar/groups.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, finance: enFinance, layout: enLayout, dashboard: enDashboard, groups: enGroups },
      ar: { common: arCommon, finance: arFinance, layout: arLayout, dashboard: arDashboard, groups: arGroups },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'finance', 'layout', 'dashboard', 'groups'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
