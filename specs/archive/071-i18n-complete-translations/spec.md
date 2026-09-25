# Feature Specification: Complete i18n Translations

**Feature Branch**: `070-arabic-i18n-rtl`
**Created**: 2026-08-24
**Status**: Draft
**Parent Spec**: `070-arabic-i18n-rtl`
**Input**: Audit finding ~537 hardcoded English strings remaining across ~70 files

## Context

Phase 1-7 of the i18n work established the infrastructure (react-i18next, RTL layout, locale files, language switcher) and translated the highest-traffic pages (Dashboard, Directory, Staff, Reports, Groups, Attendance, Notifications, Tasks, Enrollments, Competitions, Login, Settings). An audit found ~537 hardcoded English strings remaining across ~70 files.

## Scope Boundaries

- **In scope**: All hardcoded user-facing strings in React components (JSX text, placeholders, aria-labels, toast messages, dialog text, button labels, error messages)
- **Out of scope**: API-sourced strings (status labels, error messages from backend responses). These remain English; the frontend renders them as-is. Translating API content requires backend changes outside this spec's frontend-only constitution.

## User Scenarios & Testing

### User Story 1 - Complete Auth Flow Translation (Priority: P1)

As a user who forgot my password or is registering, I want all auth-related screens (forgot password, reset password, register) to appear in my selected language.

**Acceptance Scenarios**:

1. **Given** the app is in Arabic, **When** the user clicks "Forgot Password?", **Then** all text on the forgot password page appears in Arabic.
2. **Given** the app is in Arabic, **When** the user resets their password via email link, **Then** the reset password page appears in Arabic.
3. **Given** the app is in Arabic, **When** a new user opens their invite link, **Then** the registration page appears in Arabic.

---

### User Story 2 - Complete Detail Pages Translation (Priority: P2)

As a user viewing student, team, parent, course, or competition details, I want all information, actions, and dialogs on these pages to appear in my selected language.

**Acceptance Scenarios**:

1. **Given** the app is in Arabic, **When** the user opens a team detail page, **Then** headings, labels, buttons, payment info, and placement sections appear in Arabic.
2. **Given** the app is in Arabic, **When** the user opens a student detail page, **Then** status banners, action buttons, and confirmation dialogs appear in Arabic.
3. **Given** the app is in Arabic, **When** the user views course or competition details, **Then** all info sections, tabs, and group tables appear in Arabic.

---

### User Story 3 - Complete Shared Components Translation (Priority: P3)

As a user, I want shared UI elements (pagination, error states, empty states, confirm dialogs) to appear in my selected language regardless of which page I'm on.

**Acceptance Scenarios**:

1. **Given** the app is in Arabic, **When** a data table shows pagination, **Then** "Showing 1-10 of 50 records" and page navigation labels appear in Arabic.
2. **Given** the app is in Arabic, **When** an error occurs, **Then** "Something went wrong" and "Try Again" appear in Arabic.
3. **Given** the app is in Arabic, **When** a list is empty, **Then** the empty state message appears in Arabic.

---

### User Story 4 - Complete Feature & Domain Components Translation (Priority: P4)

As a user interacting with dashboard widgets, CRM forms, enrollment panels, task modals, and group management tools, I want all placeholders, toast messages, and form labels in my selected language.

**Acceptance Scenarios**:

1. **Given** the app is in Arabic, **When** the user uses the Quick Register widget, **Then** the modal title, form placeholders, and success/error toasts appear in Arabic.
2. **Given** the app is in Arabic, **When** the user creates or modifies an enrollment, **Then** all panel text, placeholders, and toast messages appear in Arabic.
3. **Given** the app is in Arabic, **When** the user creates a task, **Then** the modal title, form placeholders, and submission messages appear in Arabic.

---

### User Story 5 - Locale File Cleanup (Priority: P5)

As a developer, I want unused translation keys removed from locale files and missing keys added, so the locale files are clean and complete.

**Acceptance Scenarios**:

1. **Given** the cleanup is complete, **When** a developer searches for a key in the codebase, **Then** every key in the locale files is referenced by at least one `t()` call.
2. **Given** the cleanup is complete, **When** a developer searches the codebase for `t('common.navigation.X')`, **Then** all keys used in SettingsPage exist in the locale file.

## Clarifications

### Session 2026-08-24

- Q: Should this spec cover translating API-sourced strings (e.g., status labels from backend responses), or only frontend hardcoded strings? → A: Frontend-only — only translate hardcoded strings in React components. API responses stay English.
- Q: How should strings with dynamic values (e.g., 'Showing ${count} of ${total} records') be handled? → A: Require i18next interpolation (`{{variable}}` syntax) for all dynamic strings. Enables pluralization and RTL-safe ordering.
- Q: What completion threshold should be used to verify all translations are done? → A: 100% coverage — every hardcoded frontend string must be translated. Verifiable via grep for remaining English text.
