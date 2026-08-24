import '@testing-library/jest-dom'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '../locales/en/common.json'
import enFinance from '../locales/en/finance.json'
import enLayout from '../locales/en/layout.json'
import enDashboard from '../locales/en/dashboard.json'
import enGroups from '../locales/en/groups.json'
import enAttendance from '../locales/en/attendance.json'
import enDirectory from '../locales/en/directory.json'
import enStaff from '../locales/en/staff.json'
import enReports from '../locales/en/reports.json'
import enCompetitions from '../locales/en/competitions.json'
import enEnrollments from '../locales/en/enrollments.json'
import enNotifications from '../locales/en/notifications.json'
import enTasks from '../locales/en/tasks.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, finance: enFinance, layout: enLayout, dashboard: enDashboard, groups: enGroups, attendance: enAttendance, directory: enDirectory, staff: enStaff, reports: enReports, competitions: enCompetitions, enrollments: enEnrollments, notifications: enNotifications, tasks: enTasks },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'finance', 'layout', 'dashboard', 'groups', 'attendance', 'directory', 'staff', 'reports', 'competitions', 'enrollments', 'notifications', 'tasks'],
  interpolation: { escapeValue: false },
})
