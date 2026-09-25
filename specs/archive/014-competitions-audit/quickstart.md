# Quickstart: Competitions Feature Audit & Quality Fix

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Backend API running at `https://techno-terminal-5c255cfe.fastapicloud.dev/` (or local dev server)

## Run the Dev Server

```bash
npm run dev
```

The Vite dev server starts at `http://localhost:5173` with API proxy to `/api/v1`.

## Verify the Audit Changes

### 1. Run Lint
```bash
npm run lint
```
Expected: Zero errors and zero warnings in competition-related files.

### 2. Run Build
```bash
npm run build
```
Expected: `tsc -b && vite build` succeeds with zero TypeScript errors.

### 3. Run Tests
```bash
npm run test
```
Expected: All existing tests pass. No new test failures introduced.

## Manual Testing Checklist

### Runtime Bugs
- [ ] Navigate to `/competitions/abc` (invalid ID) — should show error, not crash
- [ ] Navigate to a valid competition detail page — all data renders without crashes
- [ ] View a competition with no teams — shows zero counts gracefully

### Accessibility
- [ ] Tab through CompetitionDetailPage tabs using only keyboard — focus moves logically
- [ ] Press Enter/Space on a tab — panel activates
- [ ] Open a modal dialog, press Escape — dialog closes, focus returns to trigger
- [ ] Use a screen reader — decorative icons are skipped, meaningful content is announced

### Data Fetching
- [ ] Verify `useCompetitionFees` uses React Query (check DevTools)
- [ ] Verify all query keys use centralized factory (no inline `['competitions', ...]`)
- [ ] Verify `enabled` guards prevent requests with invalid IDs

### Code Quality
- [ ] Search for `: any` in competition files — zero results
- [ ] Search for `console.log` in competition files — zero results
- [ ] Search for unused exports — zero results

## Key Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/api/competitions/competitions.ts` | Bug fix | Null-safety on API responses |
| `src/api/teams/teams.ts` | Bug fix | Null-safety on API responses |
| `src/components/common/Modal.tsx` | A11y | Escape handler, focus management, ARIA roles |
| `src/components/common/datatable/TableActions.tsx` | A11y | aria-hidden on icons |
| `src/components/competitions/*.tsx` | Mixed | A11y, type safety, date formatting |
| `src/hooks/competitions/*.ts` | Data fetching | Centralized query keys |
| `src/hooks/teams/useTeams.ts` | Data fetching | Enabled guards, centralized keys |
| `src/hooks/finance/useCompetitionFees.ts` | Data fetching | Migrated to React Query |
| `src/hooks/queryKeys.ts` | Data fetching | Added missing factory methods |
| `src/pages/CompetitionDetailPage.tsx` | Mixed | A11y tabs, NaN guards, error boundaries |
| `src/pages/CompetitionEditPage.tsx` | Bug fix | NaN guard, type safety |
| `src/pages/CompetitionsPage.tsx` | Mixed | A11y, type safety |
| `src/pages/TeamDetailPage.tsx` | Mixed | A11y, type safety |
| `src/components/student/CompetitionsTab.tsx` | Mixed | Date formatting, a11y, dead export |
