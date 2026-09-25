# Feature Audit Report: Directory Page
Generated: 2026-06-11 | Phases: bug, dead-code, ts-quality, data-fetch, a11y-ux, react-perf, arch-compliance, ui-polish | Mode: standard

## Severity Heatmap
🟥 Critical: 1   🟧 High: 5   🟨 Medium: 25   🟩 Low: 23

## Breakdown by Phase

| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Bug | 1 | 1 | 1 | 0 | 3 |
| DeadCode | 0 | 3 | 0 | 15 | 18 |
| TS | 0 | 1 | 4 | 1 | 6 |
| Fetch | 0 | 0 | 5 | 1 | 6 |
| A11y | 0 | 2 | 7 | 1 | 10 |
| Perf | 0 | 3 | 7 | 6 | 16 |
| Arch | 0 | 2 | 4 | 1 | 7 |
| UI | 0 | 1 | 8 | 10 | 19 |
| **Total** | **1** | **13** | **36** | **35** | **85** |

## Top Findings (Critical & High)

### 🔴 Bug: src/pages/DirectoryPage.tsx:1006
**Rule**: missing-null-check | **Risk**: breaking
**Before**: `onSubmit={(data, parent, status) => handleEditStudent(editingStudent!, data, parent, status)}`
**After**: `onSubmit={(data, parent, status) => { if (!editingStudent) return; handleEditStudent(editingStudent, data, parent, status); }}`



### 🟧 Bug: src/components/directory/hooks/useStudentActions.ts:116
**Rule**: effect-anti-pattern | **Risk**: moderate
**Before**: `showToast(message, 'error')` then `throw new Error(message)` — unhandled promise rejection upstream
**After**: Remove the throw — toast already communicates the failure



### 🟧 Bug: src/hooks/directory/useDirectoryData.ts:152
**Rule**: status-mapping-error | **Risk**: moderate
**Before**: `waitingStudents` derived from current page only (25 records), not the full dataset total
**After**: Use dedicated waiting-list query total instead



### 🟧 Arch: src/components/directory/hooks/useStudentActions.ts:1
**Rule**: directory-structure-violation | **Risk**: breaking
**Before**: Hook located at `src/components/directory/hooks/` instead of `src/hooks/directory/`
**After**: Move to `src/hooks/directory/useStudentActions.ts`



### 🟧 A11y: src/components/common/SearchBar.tsx:33
**Rule**: focus-management | **Risk**: moderate
**Before**: `outline-none` with no focus ring fallback — keyboard users cannot see focus
**After**: Add `focus-visible:ring-2 focus-visible:ring-secondary/30`



### 🟧 A11y: src/components/directory/AlphabetSlider.tsx:13
**Rule**: focus-management | **Risk**: moderate
**Before**: Letter buttons lack any focus-visible styles
**After**: Add `focus-visible:ring-2 focus-visible:ring-secondary`

### 🟧 Perf: src/components/directory/hooks/useStudentActions.ts:72
**Rule**: async-parallel | **Risk**: moderate
**Before**: Sequential awaits for linkParentToStudent and logActivity after createStudent
**After**: Use `Promise.all()` for independent post-creation operations

### 🟧 Perf: src/pages/DirectoryPage.tsx:5
**Rule**: bundle-barrel | **Risk**: safe
**Before**: Barrel import from `../components/common` re-exports 25+ modules (HMR slowdown)
**After**: Import directly from individual module paths

### 🟧 Perf: src/pages/DirectoryPage.tsx:16
**Rule**: bundle-barrel | **Risk**: safe
**Before**: Barrel import from `../api/crm` — 3-level deep barrel chain
**After**: Import directly from individual module paths

### 🟧 UI: src/components/directory/StudentGroupBySelector.tsx:56
**Rule**: contrast-ratio | **Risk**: safe
**Before**: Disabled button text `text-slate-300` on `bg-slate-100` — ~1.5:1 contrast ratio
**After**: `text-slate-400/60` for minimum visibility

## File-by-File Summary

| File | Bugs | DeadCode | TS | Fetch | A11y | Perf | Arch | UI | Score |
|------|------|----------|----|-------|------|------|------|----|-------|
| DirectoryPage.tsx | 2 | 0 | 3 | 0 | 2 | 6 | 1 | 3 | 🟧 17 |
| useStudentActions.ts | 1 | 0 | 0 | 1 | 0 | 2 | 2 | 0 | 🟧 6 |
| useDirectoryData.ts | 1 | 0 | 1 | 2 | 0 | 1 | 0 | 0 | 🟨 5 |
| useWaitingList.ts | 0 | 3 | 0 | 1 | 0 | 0 | 0 | 0 | 🟨 4 |
| StudentMobileCard.tsx | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 5 | 🟨 4 |
| ParentMobileCard.tsx | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 4 | 🟨 3 |
| WaitingListPanel.tsx | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 2 | 🟩 3 |
| WaitingStudentCard.tsx | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 🟩 3 |
| SearchBar.tsx | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 🟩 2 |
| StudentGroupBySelector.tsx | 0 | 0 | 1 | 0 | 2 | 1 | 1 | 2 | 🟧 7 |
| AlphabetSlider.tsx | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 2 | 🟨 4 |
| StudentCard.tsx | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 🟩 3 |
| ParentCard.tsx | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 🟩 2 |
| MetricsStripCards.tsx | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 🟩 2 |
| CardSkeleton.tsx | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 🟩 2 |
| useAdvancedSearch.ts | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 🟩 1 |
| barrel (api/crm/index.ts) | 0 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 🟧 12 |
| useDirectory.ts | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 🟩 3 |
| AdvancedSearchPanel.tsx | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 3 | 🟨 5 |
| useStudentsGrouped.ts | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 0 |

Score legend:
- 🟩 0-2 findings — Clean
- 🟨 3-5 findings — Needs attention
- 🟧 6-10 findings — Needs significant work
- 🟥 10+ findings — Needs rewrite
