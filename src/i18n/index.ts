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
import enAttendance from '../locales/en/attendance.json'
import arAttendance from '../locales/ar/attendance.json'
import enDirectory from '../locales/en/directory.json'
import arDirectory from '../locales/ar/directory.json'
import enStaff from '../locales/en/staff.json'
import arStaff from '../locales/ar/staff.json'
import enReports from '../locales/en/reports.json'
import arReports from '../locales/ar/reports.json'
import enCompetitions from '../locales/en/competitions.json'
import arCompetitions from '../locales/ar/competitions.json'
import enEnrollments from '../locales/en/enrollments.json'
import arEnrollments from '../locales/ar/enrollments.json'
import enNotifications from '../locales/en/notifications.json'
import arNotifications from '../locales/ar/notifications.json'
import enTasks from '../locales/en/tasks.json'
import arTasks from '../locales/ar/tasks.json'
import enCourses from '../locales/en/courses.json'
import arCourses from '../locales/ar/courses.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, finance: enFinance, layout: enLayout, dashboard: enDashboard, groups: enGroups, attendance: enAttendance, directory: enDirectory, staff: enStaff, reports: enReports, competitions: enCompetitions, enrollments: enEnrollments, notifications: enNotifications, tasks: enTasks, courses: enCourses },
      ar: { common: arCommon, finance: arFinance, layout: arLayout, dashboard: arDashboard, groups: arGroups, attendance: arAttendance, directory: arDirectory, staff: arStaff, reports: arReports, competitions: arCompetitions, enrollments: arEnrollments, notifications: arNotifications, tasks: arTasks, courses: arCourses },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'finance', 'layout', 'dashboard', 'groups', 'attendance', 'directory', 'staff', 'reports', 'competitions', 'enrollments', 'notifications', 'tasks', 'courses'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
