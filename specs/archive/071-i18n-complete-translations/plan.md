# Implementation Plan: Complete i18n Translations

**Branch**: `070-arabic-i18n-rtl` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)
**Input**: Audit of remaining hardcoded English strings after Phase 1-7 i18n work

## Summary

Complete the remaining i18n work: translate ~50+ pages/components with hardcoded English strings, add 11 missing translation keys, and remove 273 dead keys from locale files. Work is organized into 7 batches for incremental delivery.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: react-i18next, i18next, i18next-browser-languagedetector
**Styling**: Tailwind CSS v3.4 (v3 config)
**Testing**: Vitest 4.1 + happy-dom
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (React single-page application)
**State**: Zustand 5 for locale persistence (settingsStore)
**Scale/Scope**: ~537 hardcoded strings across ~70 files, 13 existing i18n namespaces

**Established Patterns** (from Phase 1-7):
- `useTranslation('namespace')` hook in each component
- Keys follow dot notation: `namespace.section.key` (e.g., `auth.login`, `buttons.cancel`)
- EN locale files in `src/locales/en/`, AR in `src/locales/ar/`
- Egyptian Arabic for all AR translations
- `defaultValue` fallbacks used sparingly for Settings page navigation keys

## Constitution Check

*GATE: Must pass before Phase 0 research.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/`. Locale files, component updates only. |
| II. Server State Discipline | ✅ PASS | No API calls. String extraction is purely UI work. |
| III. Global State Minimalism | ✅ PASS | No new global state. Locale store already exists. |
| IV. TypeScript Strict Mode | ✅ PASS | Will use `import type`, no enums, no `any`. Build must pass `tsc -b`. |
| V. Component Naming Convention | ✅ PASS | No new components. Existing files modified in-place. |

**Gate Result**: PASS — no violations. Proceeding to Phase 0.

## Complexity Tracking

No violations — no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/071-i18n-complete-translations/
├── plan.md              # This file
├── spec.md              # Feature specification
└── research.md          # Phase 0 output
```

### Source Code (modified files)

```text
src/
├── locales/
│   ├── en/              # 13 existing + 1 new (courses.json) namespace files
│   └── ar/              # 13 existing + 1 new (courses.json) namespace files
├── pages/               # ~15 page files to update
├── components/
│   ├── common/          # ~7 shared components to update
│   ├── dashboard/       # ~2 components to update
│   ├── crm/             # ~5 components to update
│   ├── groups/          # ~10 components to update
│   ├── tasks/           # ~5 components to update
│   ├── staff/           # ~4 components to update
│   ├── enrollments/     # ~4 components to update
│   ├── competitions/    # ~2 components to update
│   ├── student/         # ~5 tab components to update
│   ├── courses/         # ~2 components to update
│   ├── certificates/    # ~3 components to update
│   └── finance/         # ~1 component to update
└── i18n/index.ts        # May need new namespace registration
```

## Batch Plan

### Batch 1: Auth Pages (~37 strings)
Small, isolated, high-traffic pages. Quick wins.

| File | Strings | Notes |
|------|---------|-------|
| `src/pages/ForgotPasswordPage.tsx` | ~10 | Uses AuthLayout, error messages |
| `src/pages/ResetPasswordPage.tsx` | ~15 | Password validation, status messages |
| `src/pages/RegisterPage.tsx` | ~12 | Form labels, validation |

**Locale additions**: `auth.forgotPassword.*`, `auth.resetPassword.*`, `auth.register.*` in common.json

### Batch 2: Detail Pages (~205 strings)
Large pages with many strings — headings, labels, dialogs, toasts.

| File | Strings | Notes |
|------|---------|-------|
| `src/pages/TeamDetailPage.tsx` | ~70 | Biggest file — team info, members, payments, placement |
| `src/pages/StudentDetailPage.tsx` | ~30 | Delete/restore flows, status labels |
| `src/pages/ParentDetailPage.tsx` | ~25 | Contact info, children list |
| `src/pages/CourseDetailPage.tsx` | ~35 | Course info, groups table, tabs |
| `src/pages/CompetitionDetailPage.tsx` | ~30 | Overview, teams, categories |
| `src/pages/CompetitionEditPage.tsx` | ~5 | Simple edit form |

**Locale additions**: New keys in `competitions.json`, `groups.json`, `common.json`

### Batch 3: Feature Pages (~60 strings)
Medium pages with moderate string counts.

| File | Strings | Notes |
|------|---------|-------|
| `src/pages/FinancePage.tsx` | ~10 | Metrics, refund placeholder |
| `src/pages/CoursesPage.tsx` | ~15 | CRUD toasts, pagination |
| `src/pages/CertificatesPage.tsx` | ~20 | Search, filters, generate/revoke |
| `src/pages/CapabilitiesPage.tsx` | ~3 | Badge, fallback text |

**Locale additions**: `courses.json` (new file), keys in `certificates.json`

### Batch 4: Common Components (~50 strings)
Shared components used across the entire app — high impact.

| File | Strings | Notes |
|------|---------|-------|
| `src/components/common/Pagination.tsx` | ~15 | "Showing X-Y of Z", page labels |
| `src/components/common/ErrorBoundary.tsx` | ~3 | "Something went wrong" |
| `src/components/common/ErrorState.tsx` | ~3 | Default title/message |
| `src/components/common/EmptyState.tsx` | ~2 | Default title/message |
| `src/components/common/ConfirmDialog.tsx` | ~2 | Default confirm/cancel |
| `src/components/common/LoadingState.tsx` | ~1 | "Loading..." |
| `src/components/finance/ComingSoonPlaceholder.tsx` | ~2 | Default title/description |

**Locale additions**: Keys in `common.json`

### Batch 5: Dashboard & CRM Components (~55 strings)
Dashboard widgets and CRM forms.

| File | Strings | Notes |
|------|---------|-------|
| `src/components/dashboard/QuickActionsGrid.tsx` | ~12 | Widget titles, toast messages |
| `src/components/dashboard/MobileGroupCard.tsx` | ~3 | Attendance badge, button |
| `src/components/crm/StudentForm.tsx` | ~3 | Placeholders |
| `src/components/crm/ParentForm.tsx` | ~2 | Placeholders |
| `src/components/crm/LogActivityModal.tsx` | ~7 | Toast messages, placeholders |
| `src/components/crm/LinkParentModal.tsx` | ~2 | Title, placeholder |
| `src/components/crm/WaitingListPanel.tsx` | ~1 | Placeholder |

**Locale additions**: Keys in `dashboard.json`, `directory.json`

### Batch 6: Domain Components (~100 strings)
Groups, Tasks, Staff, Enrollments, Competitions, Student tabs, Courses, Certificates.

| File | Strings | Notes |
|------|---------|-------|
| **Groups** (10 files) | ~40 | Placeholders, toast messages, titles |
| **Tasks** (5 files) | ~10 | Placeholders, aria-labels |
| **Staff** (4 files) | ~8 | Placeholders, modal titles |
| **Enrollments** (4 files) | ~15 | Toast messages, placeholders |
| **Competitions** (2 files) | ~8 | Placeholders, titles |
| **Student tabs** (5 files) | ~10 | Title attributes |
| **Courses** (2 files) | ~4 | Placeholders |
| **Certificates** (3 files) | ~5 | Placeholders, titles |

**Locale additions**: Keys across multiple namespace files

### Batch 7: Cleanup + Settings + Remaining (~30 strings)
Final cleanup pass.

| Task | Details |
|------|---------|
| Add 11 missing `common.navigation.*` keys | Settings page tab labels |
| Translate remaining SettingsPage strings | ~10 strings |
| Translate remaining DirectoryPage strings | ~25 strings |
| Translate remaining StaffPage strings | ~4 strings |
| Translate remaining GroupsPage strings | ~2 strings |
| Translate remaining TasksPage strings | ~5 strings |
| Translate remaining NotificationsPage strings | 3 tab labels |
| Remove 273 dead keys from locale files | Clean up unused boilerplate |
| Fix LoginPage aria-label | `showPassword`/`hidePassword` |

**Locale additions**: `common.navigation.*` keys, cleanup of dead keys

## String Count Summary

| Batch | Files | Approx. Strings |
|-------|-------|-----------------|
| 1. Auth Pages | 3 | ~37 |
| 2. Detail Pages | 6 | ~205 |
| 3. Feature Pages | 4 | ~60 |
| 4. Common Components | 7 | ~50 |
| 5. Dashboard & CRM | 7 | ~55 |
| 6. Domain Components | ~35 | ~100 |
| 7. Cleanup + Remaining | ~8 | ~30 |
| **Total** | **~70** | **~537** |

## Execution Rules

1. **Each batch**: Update EN locale → Update AR locale → Update component → Verify `tsc -b` passes
2. **New keys**: Use Egyptian Arabic for AR translations (matching existing convention)
3. **Key naming**: Follow existing patterns (e.g., `auth.login`, `buttons.cancel`, `empty.noResults`)
4. **Locale file structure**: Add keys to existing namespace files, create `courses.json` if needed
5. **After all batches**: Run `npm run test`, verify no regressions
6. **Dead key cleanup**: Only after all active keys are translated (Batch 7)
