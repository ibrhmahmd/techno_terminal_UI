# Audit Findings — 2026-08-31 (Attendance Cache-Refresh Close-Out)

Findings surfaced while closing out `specs/074-attendance-cache-refresh-audit` (attendance
cache refresh, missing-status unification, attendance type dedup). The spec's implementation is
complete and its build passes; the problems below are **repo-wide baseline debt** discovered while
running the mandatory quality gates. None were introduced by the spec itself, but they block a
clean `npm run lint` / `npm run test` and are tracked here so they are not lost.

Artifact: this file + annotated closure notes in
`specs/074-attendance-cache-refresh-audit/tasks.md`.

---

## 1. Repo-wide `npm run lint` fails with 43 errors / 21 warnings (pre-existing)

`npx eslint .` exits 1. **All 43 errors are in files outside the spec-074 touch-set.**
Root cause: `eslint-plugin-react-hooks` v7 flat config now activates react-compiler-era rules
(`react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`, `react-hooks/refs`,
`react-hooks/static-components`, `react-hooks/rules-of-hooks`) on top of pre-existing
`@typescript-eslint/no-explicit-any`, `no-unused-vars`, and `react-refresh/only-export-components`
findings.

### Error files (43 errors)

- `specs/007-groups-card-layout/contracts/*.tsx` — `GroupCard.tsx`, `GroupCardGrid.tsx`,
  `GroupCategoryTabs.tsx`, `ViewToggle.tsx` → `no-unused-vars` (unused prop interfaces)
- `specs/008-extend-card-layout/contracts/` — `CompetitionsTable.tsx`, `CourseCard.tsx`
  → `no-unused-vars`
- `src/components/certificates/CertificateForm.tsx` → `react-hooks/set-state-in-effect` (x4)
- `src/components/common/DateInput.tsx` → `set-state-in-effect`
- `src/components/common/SearchablePillSelector.tsx` → `set-state-in-effect`
- `src/components/common/Toast.tsx` → `react-refresh/only-export-components`
- `src/components/common/datatable/FlatTable.tsx` → `set-state-in-effect`
- `src/components/courses/CoursesTable.tsx` → `react-refresh/only-export-components`
- `src/components/crm/LogActivityModal.tsx`, `src/components/crm/ParentSearchDropdown.tsx`
  → `no-explicit-any`
- `src/components/enrollments/EditEnrollmentModal.tsx` → `set-state-in-effect` + `no-explicit-any`
- `src/components/finance/CreateReceipt/SlideToConfirm.tsx` → `react-hooks/refs` (ref read during render)
- `src/components/groups/GroupCategoryTabs.tsx` → `react-hooks/rules-of-hooks` (conditional hook after early return)
- `src/components/groups/GroupCombobox.tsx` → `react-hooks/preserve-manual-memoization` (x4) + `exhaustive-deps`
- `src/components/groups/detail/EditGroupLevelDialog.tsx`, `GroupInfoCard.tsx` → `set-state-in-effect`
- `src/components/notifications/tabs/LogsTab.tsx` → `react-hooks/static-components` (component created in render, x3)
- `src/components/student/ActivityHistoryTab.tsx`, `PaymentDetailsDialog.tsx` → `no-explicit-any` / `no-unused-vars`
- `src/hooks/useSearch.ts` → `set-state-in-effect`
- `src/pages/DashboardPage.tsx`, `EnrollmentsPage.tsx` → `set-state-in-effect`
- `src/pages/DirectoryPage.tsx` → `preserve-manual-memoization` (x6) + `exhaustive-deps`
- `src/pages/ParentDetailPage.tsx` → `no-explicit-any` (x2)

### 21 warnings (not errors, but noisy)

`exhaustive-deps` across `GroupCombobox`, `GroupFilters`, `AddSessionDialog`, `LogsTab`,
`CertificatesPage`, `DirectoryPage`, `EnrollmentsPage`, `GroupsPage`, `ParentDetailPage`,
`useCourses`, `useDropdownPosition`, `SlideToConfirm` (missing `t`/`handleEnd`/`handleMove`,
unstable logical-expression deps) — plus Vue-style `logical expression could make the dependencies
change on every render` advises.

### Spec-touched files: clean

`npx eslint src/utils/attendanceStatus.ts src/utils/attendanceInvalidation.ts
src/components/attendance/ src/components/groups/LevelsTab.tsx src/api/attendance/` → **0 errors**,
7 warnings (see §3).

---

## 2. Full test run is not a clean green (environmental, not failures)

`npx vitest run` → **63 tests passed across 9 files; 7 suites aborted** on forks-worker spawn
timeouts (slow box + parallel pool). Vitest warns dropped suites "might cause false positive tests".

Aborted suites:
- `src/tests/auth/LoginPage.test.tsx`
- `src/tests/CertificateCard.test.tsx`
- `src/tests/CertificatesHeader.test.tsx`
- `src/tests/TeamRegistrationModal.test.tsx`
- `src/tests/CompetitionDetailPage.test.tsx`
- `src/tests/CertificateDetailModal.test.tsx`
- `src/components/common/__tests__/DataTable.test.tsx`

The spec's own test passes in isolation:
`npx vitest run src/tests/attendance/attendanceInvalidation.test.ts` → **4/4 PASS**.

**Follow-up**: re-run full suite on a quieter machine or with `--pool=threads` /
`--no-file-parallelism` to separate infra flakiness from real failures.

---

## 3. `exhaustive-deps` warnings in the spec touch-set (`AttendanceGrid.tsx`)

The spec's rewrite of `AttendanceGrid.tsx` (commit `810ccc6`) authored 7 warnings —
missing `t` in `useCallback` dep arrays (lines 160, 174, 188, 202, 217, 407, 454). Warnings only;
the task bar ("fix all errors") was met. Recommend adding `t` to those dep arrays in a follow-up so
the attendance surface is warning-free.

---

## 4. Build passes with 2 non-blocking warnings

`npm run build` (`tsc -b && vite build`) → **PASS, zero errors**. Warning-level noise only:
- `INEFFECTIVE_DYNAMIC_IMPORT` — `src/api/auth/index.ts` is both dynamically imported by
  `src/api/client.ts` and statically imported by `src/components/settings/UsersTab.tsx`,
  `src/hooks/useAuthQueries.ts`, `src/store/authStore.ts` → chunk splitting is defeated.
- Plugin timings notice (`vite:css-post`, `vite:asset`, `vite:css`, `vite:build-html`) — informational.

---

## 5. Process notes

- **Branch deviation (spec T001)**: spec 074 work landed on `main` (commits `810ccc6`, `8ef397f`)
  rather than a dedicated `074-attendance-cache-refresh-audit` branch.
- **Attentional debt in attendance transforms** (flagged in AGENTS.md §8): `transformRoster` hardcodes
  `gender: 'male'`; `mapStatus` collapses `excused`/`late` → `present`; `billing_status: 'partial'` is
  coerced to `'due'`. Preserved intentionally — verify against the backend before changing.

---

## Suggested follow-ups

1. New spec: repo-wide lint baseline sweep (react-hooks v7 / react-compiler rule rework) →
   target zero errors on `npm run lint`.
2. Add `t` to `AttendanceGrid.tsx` useCallback dep arrays (7 lines).
3. Re-run full `npm run test` on stable infra; triage the 7 aborted suites if they persist.
4. Optional: resolve the `src/api/auth` double-import chunk warning.