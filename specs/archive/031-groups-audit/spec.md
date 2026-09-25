# Groups Page — Audit & Fix

**Feature ID**: `031-groups-audit`
**Created**: 2026-06-03
**Scope**: Backend-free audit of the Groups page feature (components, hooks, API layer, pages, types)

## Summary

Audit and fix of the Groups feature across 5 user stories: (1) Fix 5 runtime bugs including `GroupStatusBadge` crash on unknown status, `instructor_id: 0` sent to PATCH, and silent multi-filter truncation; (2) Remove 5 dead exports (`processedGroups`, `GroupCardProps`, `GroupBySelectorValue`, `UseGroupAttendanceOptions`, unused detail barrel exports); (3) Eliminate 1 `any` type usage, 6 unsafe `as X` casts, 1 `Record<string, any>` param object, and 1 redundant default export survivor; (4) Migrate 1 manual `useEffect`-based fetch to `useCourses()` and centralize 2 local query key factories into `queryKeys.ts`; (5) Add `aria-label`, `aria-pressed`, `aria-selected`, `role="tabpanel"`, `role="alert"`, `<fieldset>`, and `aria-hidden="true"` to 21 interactive controls across the feature. All changes are frontend-only.

---

## User Stories

### US1: Runtime Bug Fixes

**As a** groups page user, **I want** the page to handle all server responses gracefully, **so that** I never see a crash or silent data loss.

#### Acceptance Criteria
- [ ] `GroupStatusBadge` renders "Unknown" fallback when backend sends an unrecognized `status` value, instead of crashing — `GroupStatusBadge.tsx:35`
- [ ] Multi-instructor and multi-level selections are all sent to the API, not just the first value — `useGroups.ts:52`
- [ ] `EditGroupDialog` skips `instructor_id` in the PATCH payload when no instructor is selected (never sends `instructor_id: 0`) — `EditGroupDialog.tsx:86`
- [ ] `EditGroupDialog` validates that `day` is non-empty before building schedule data — `EditGroupDialog.tsx:81`
- [ ] `completed` status dot renders blue (matching its text color), not amber — `GroupStatusBadge.tsx:41`
- [ ] GroupBySelector "All" button does not appear selected when `groupBy` is `undefined` and no data is loaded — `GroupsPage.tsx:213`
- [ ] `EditGroupDialog` strips `status` from PATCH payload since `UpdateGroupDTO` has no `status` field — `EditGroupDialog.tsx:84`
- [ ] Grouped view loads up to 200 items instead of 50 to reduce silent truncation — `useGroupQueries.ts:42`

#### Out of Scope
- Backend changes to support `instructor_ids[]` — frontend sends only for now; backend already accepts the field
- Adding pagination to grouped view — just raising the limit to 200

---

### US2: Dead Code Removal

**As a** developer, **I want** to remove unused exports, **so that** the codebase is easier to navigate and maintain.

#### Acceptance Criteria
- [ ] `processedGroups` removed from `useGroups()` return object (callers use `paginatedGroups` instead) — `useGroups.ts:141`
- [ ] `GroupCardProps` type removed from groups barrel export (`src/components/groups/index.ts`)
- [ ] `GroupBySelectorValue` type changed from `export` to internal-only — `GroupBySelector.tsx:4`
- [ ] `UseGroupAttendanceOptions` type export removed — `useGroupAttendance.ts`
- [ ] Unused barrel re-exports removed from `src/components/groups/detail/index.ts` (`LevelSelector`, `EditGroupDialog`)

#### Out of Scope
- Removing entire files — only removing exports; all components and hooks are actively used

---

### US3: TypeScript & Code Quality Cleanup

**As a** developer, **I want** safe, idiomatic TypeScript, **so that** the type system catches real bugs instead of being bypassed.

#### Acceptance Criteria
- [ ] Replace `as any` mode cast in `GroupCombobox.tsx:125` with a properly typed union
- [ ] Replace unsafe `as GroupByField` pre-check cast in `useGroups.ts:39` with validated parsing
- [ ] Replace `as Exclude<GroupByField, null>` with `non-null assertion` (safer when guard is present) — `useGroups.ts:65`
- [ ] Replace `Record<string, any>` with `Record<string, unknown>` in `groups/core.ts:137`
- [ ] Extract duplicate schedule parsing logic in `GroupForm.tsx` (body line 43 + useEffect line 74) into a shared helper
- [ ] Remove unnecessary `as Course[]` cast in `GroupForm.tsx:60`
- [ ] Remove unnecessary `as React.ReactNode` cast in `GroupCombobox.tsx:145`
- [ ] Fix double `as SortField` cast in `useGroups.ts:108`
- [ ] Remove redundant `as UpdateGroupDTO` cast in `GroupDetailPage.tsx:160`
- [ ] Add proper `Schedule` | `ScheduleInput` union type to `GroupForm`'s `initialData` to eliminate record casts

#### Out of Scope
- Full type coverage for all API functions — only fixing the pattern violations found in audit

---

### US4: Data Fetching & Cache Hygiene

**As a** developer, **I want** consistent data fetching patterns, **so that** the cache is always fresh and there's no duplicated fetch logic.

#### Acceptance Criteria
- [ ] Replace manual `useEffect` + `useState` + `getCourses()` in `GroupForm.tsx:56` with the existing `useCourses()` React Query hook
- [ ] Move `studentsGroupedKeys` from `useStudentsGrouped.ts` into centralized `queryKeys.ts` — `useStudentsGrouped.ts:6`
- [ ] Move `['employees', 'all']` inline key from `useProgressLevelForm.ts:61` into centralized `queryKeys.ts`
- [ ] Remove redundant `refresh()` calls after mutations that already auto-invalidate — `GroupsPage.tsx:144`
- [ ] Remove redundant `refetch()` calls after mutations that already auto-invalidate — `GroupDetailPage.tsx:96`
- [ ] Consolidate duplicate `groupKeys` (`useGroupQueries.ts:18`) into `queryKeys.ts` to prevent key drift (deprecate local factory, re-export from centralized)
- [ ] Replace fragile ref-based error toast guard in `GroupDetailPage.tsx:67` with a direct pattern
- [ ] Fix stale `mutationError` read in `GroupDetailPage.tsx:93` — read error from catch clause directly

#### Out of Scope
- Server-side pagination for grouped view — just the limit bump from US1
- Refactoring `useGroupQueries.ts` mutation keys — they're already in the local factory pattern

---

### US5: Accessibility & UX Polish

**As a** user of assistive technology, **I want** all interactive controls to have proper ARIA attributes, **so that** I can navigate and use the Groups page effectively.

#### Acceptance Criteria
- [ ] Add `aria-label="Close filters"` to the icon-only close button in `GroupFilters.tsx:87`
- [ ] Replace `title` with `aria-label` + `aria-hidden="true"` on icon-only action buttons (Edit, Archive, Delete) — `GroupInfoCard.tsx:97,103,110`
- [ ] Add `aria-label` to clickable GroupCard `role="button"` — `GroupCard.tsx:46`
- [ ] Fix `aria-selected` on GroupBySelector search pill to `true` when visually active — `GroupBySelector.tsx:50`
- [ ] Add `aria-pressed` to all toggle filter pills (Course, Instructor, Level, Day, Status) in `GroupFilters.tsx`
- [ ] Wrap Status radio group in `<fieldset>` + `<legend>` — `EditGroupDialog.tsx:190`
- [ ] Add `aria-hidden="true"` to decorative Lucide icons in `GroupInfoCard.tsx:122`
- [ ] Add `aria-hidden="true"` to 4x Material Symbol icons in `GroupCombobox.tsx`
- [ ] Wrap tab panels with `role="tabpanel"` + `aria-labelledby` in `GroupCategoryTabs.tsx` and `TabNavigation.tsx`
- [ ] Add `role="alert"` to all error banners across Groups feature files
- [ ] Add `role="status"` + `aria-label` to loading skeleton in `PaymentsTab.tsx:28`
- [ ] Improve "Change" button in `GroupCombobox.tsx:104` with descriptive `aria-label`
- [ ] Fix nested button-in-button pattern in `PaymentsTab.tsx:114`
- [ ] Add `role="region"` + `aria-labelledby` to accordion panels in `LevelsTab.tsx`

#### Out of Scope
- Full keyboard navigation rewrite — only fixing missing ARIA attributes
- Focus trap implementation in dialogs — dialogs are using the shared Modal component which should handle this

---

## Technical Context

- **Stack**: React 19, TypeScript (strict: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`), React Query (TanStack), Zustand, Axios, Tailwind v3, Vitest
- **Pattern**: Page → custom hook (React Query) → API function (Axios) → server → cache → render
- **Query keys**: Centralized factory at `src/hooks/queryKeys.ts`; local factories found in `useGroupQueries.ts`, `useStudentsGrouped.ts`
- **State management**: Filters state managed in `useGroups.ts` hook, passed as props to `GroupFilters` and `ActiveFilterTagsList`
- **Conventions**: Components suffix → location (Page, Tab, Dialog, etc.), no default exports, `import type` for type-only imports

## Dependencies

- All changes are frontend-only — no API, schema, or backend changes
- No new npm packages required
- No test changes needed — existing `GroupsHeader.test.tsx` should still pass

## Assumptions

- `instructor_ids[]` and `level_numbers[]` API query params are supported by the backend (they already exist in `GroupFilterOptions` type as singular fields — `instructor_id` → array param or backend handles comma-separated values)
- Grouped categories rarely exceed 200 items; if they do, content truncation is acceptable as a future enhancement
