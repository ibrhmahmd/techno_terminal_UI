# Feature Specification: Settings Page Redesign

**Spec ID**: 021-settings-redesign  
**Date**: 2026-05-22  
**Status**: Draft  
**Author**: AI Agent

## 1. Overview

Redesign the Settings page to use the app's established design system patterns (`TopNavbar`, `PageHeader`, `PageSection`, `ActionButton`, `ErrorBoundary`) and refined tab navigation — matching the layout conventions used by CompetitionDetailPage, CourseDetailPage, and other detail pages.

**Current state**: Custom-built header, inline tab navigation with `h-0.5` active indicator, raw `<section>` wrapper, no `TopNavbar`, no `ErrorBoundary`.

**Target state**: Page shell composed entirely from common components, underline tabs matching CompetitionDetailPage, consistent error boundaries.

## 2. User Stories

### US1: Consistent Page Shell

> As a user, I want the Settings page to look and behave like every other detail page so that the app feels cohesive.

**Acceptance criteria:**
- The page renders `<TopNavbar activePage="Settings" />` at the top
- The header uses `<PageHeader>` with title "Settings" and subtitle "Manage your account and system preferences"
- Content is wrapped in `<PageSection>`
- Tab panel content is wrapped in `<ErrorBoundary>`

### US2: Refined Tab Navigation

> As a user, I want the Settings tabs to use the same underline style as other detail pages for visual consistency.

**Acceptance criteria:**
- Active tab shows `text-secondary border-b-2 border-secondary`
- Inactive tabs show `text-slate-500 hover:text-slate-700`
- Tabs display icon + label with `gap-2`
- Tab container has `role="tablist"` and `aria-orientation="horizontal"`
- Each tab button has `role="tab"` and `aria-selected`
- Content section has `role="tabpanel"` and `aria-labelledby`

### US3: Standardized Header Actions

> As an admin, I want the Notifications button in the header to use the same `ActionButton` component used elsewhere.

**Acceptance criteria:**
- The Notifications link renders as `<ActionButton variant="primary" icon="notifications">` using `useNavigate`
- Only visible to admin/system_admin roles (existing behavior preserved)
- Positioned in the `actions` slot of `PageHeader`

## 3. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR1 | Page must render `<TopNavbar activePage="Settings" />` | P1 |
| FR2 | Page must use `<PageHeader>` with title, subtitle, and actions slot | P1 |
| FR3 | Admin users see ActionButton for Notifications in PageHeader actions | P1 |
| FR4 | Tab navigation must use `border-b-2` underline style matching detail pages | P1 |
| FR5 | Tab container must have `role="tablist"` and `aria-orientation="horizontal"` | P1 |
| FR6 | Each tab must have `role="tab"` and `aria-selected` | P1 |
| FR7 | Content section must have `role="tabpanel"` and `aria-labelledby` | P1 |
| FR8 | Content must be wrapped in `<PageSection>` | P2 |
| FR9 | Tab panel must be wrapped in `<ErrorBoundary>` | P2 |
| FR10 | Tab selection logic and role-based visibility must be preserved unchanged | P1 |
| FR11 | The three `Audit*Section` local components must remain unchanged | P3 |

## 4. Constraints & Design Decisions

### 4.1 Technology Constraints

- **No new files** — all changes are edits to `src/pages/SettingsPage.tsx`
- **Strict TS**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`
- **Existing common components used**: `TopNavbar`, `PageHeader`, `PageSection`, `ErrorBoundary`, `ActionButton`

### 4.2 Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tab style | `border-b-2` underline | Matches CompetitionDetailPage, StudentDetailPage — most common pattern |
| Notifications button | `ActionButton` with `useNavigate` | Uses the shared component; navigation via `onClick` handler |
| ErrorBoundary wrapping | Wraps entire tab panel, not per-tab | Simpler, catches errors across all tabs |

## 5. Acceptance Scenarios

### Scenario 1: Page shell renders correctly
1. Navigate to `/settings`
2. Verify `TopNavbar` shows with "Home / Settings" breadcrumbs
3. Verify `PageHeader` shows "Settings" title with subtitle
4. Verify content is inside responsive container matching other pages

### Scenario 2: Tab navigation works
1. Click each tab
2. Verify active tab gets `border-b-2 border-secondary` underline
3. Verify inactive tabs have `text-slate-500`
4. Verify tab content switches correctly

### Scenario 3: Admin sees Notifications button
1. Log in as admin/system_admin
2. Navigate to `/settings`
3. Verify `ActionButton` with notifications icon appears in header
4. Click it → navigates to `/notifications`

### Scenario 4: Instructor does not see Notifications button
1. Log in as instructor
2. Navigate to `/settings`
3. Verify no Notifications button in header

### Scenario 5: ErrorBoundary catches errors
1. Cause a render error in a tab component
2. Verify ErrorBoundary fallback shows instead of white screen
