# Spec 022 — Reports Feature Audit & Fix

## Feature Description

Audit and fix of the Reports feature across 5 user stories:
(1) Fix 7 runtime bugs including progress status mislabeling, fragile 404 detection, and error coalescing;
(2) Remove 1 dead code path (formattedAmount in RevenueChart);
(3) Fix 2 unsafe type assertions in useDailyReport and StudentProgressChart;
(4) Fix 3 data fetching anti-patterns including hijacked query keys and dropped errors;
(5) Add ErrorBoundary wrappers to 2 tabs, aria-labels to 2 charts, and scope="col" to 3 tables.

## User Stories

### US1 — Fix Runtime Bugs
As a user I want accurate data labels so that I can make correct decisions based on the reports.

- **US1-T001** Fix ProgressTab progress status mapping: rename `completed`/`inProgress`/`notStarted` to `onTrack`/`atRisk`/`behind` and update StudentProgressChart props/labels accordingly
- **US1-T002** Replace fragile `error.message.includes('404')` in DailyReportTab with `(error as any)?.response?.status === 404`
- **US1-T003** Fix error coalescing in RevenueAndCollectionsTab: use `??` instead of `||` to preserve both error messages
- **US1-T004** Add null fallback in useDailyReport `select: (response) => response.data ?? null`
- **US1-T005** Remove dead `formattedAmount` field from RevenueChart data mapping
- **US1-T006** Document attendance_rate API contract or remove `*100` multiplication if API returns percentage

### US2 — Fix TypeScript Safety
As a developer I want sound type assertions so that the TypeScript compiler can catch regressions.

- **US2-T001** Replace `date as string` with `date!` in useDailyReport queryFn
- **US2-T002** Replace double `as unknown as Record<string, unknown>` cast in StudentProgressChart Legend formatter with typed approach

### US3 — Fix Data Fetching Anti-Patterns
As a developer I want clean query keys and proper error handling so that cache semantics are correct.

- **US3-T001** Add `dailyReceipts(date)` factory to `queryKeys.ts` and use it in useDailyCollections instead of hijacking `dailyCollections(`${date}-receipts`)`
- **US3-T002** Fix error handling in useDailyCollections to surface both collections and receipts errors
- **US3-T003** Return Promise from useRevenueData refetch wrapper so callers can await

### US4 — Fix Accessibility Gaps
As a screen reader user I want accessible charts, tables, and error resilience so that I can navigate reports independently.

- **US4-T001** Wrap RevenueAndCollectionsTab and ProgressTab in ErrorBoundary in ReportsPage
- **US4-T002** Add `aria-label` to RevenueChart AreaChart
- **US4-T003** Add `aria-label` to StudentProgressChart PieChart
- **US4-T004** Add `scope="col"` to `<th>` elements in RevenueAndCollectionsTab receipts table
- **US4-T005** Add `scope="col"` to `<th>` elements in ReportSessionDetails
- **US4-T006** Add `scope="col"` to `<th>` elements in ReportPaymentDetails inner table

## Scope

### Files to Modify
| File | Change |
|------|--------|
| `src/components/reports/organisms/ProgressTab.tsx` | US1-T001 |
| `src/components/reports/StudentProgressChart.tsx` | US1-T001, US2-T002, US4-T003 |
| `src/components/reports/organisms/DailyReportTab.tsx` | US1-T002 |
| `src/components/reports/organisms/RevenueAndCollectionsTab.tsx` | US1-T003, US4-T001, US4-T004 |
| `src/components/reports/hooks/useDailyReport.ts` | US1-T004, US2-T001 |
| `src/components/reports/RevenueChart.tsx` | US1-T005, US4-T002 |
| `src/components/reports/atoms/ReportSummaryCards.tsx` | US1-T006 |
| `src/hooks/queryKeys.ts` | US3-T001 |
| `src/components/reports/hooks/useDailyCollections.ts` | US3-T001, US3-T002 |
| `src/components/reports/hooks/useRevenueData.ts` | US3-T003 |
| `src/pages/ReportsPage.tsx` | US4-T001 |
| `src/components/reports/atoms/ReportSessionDetails.tsx` | US4-T005 |
| `src/components/reports/atoms/ReportPaymentDetails.tsx` | US4-T006 |

### Files Not Modified (findings noted but out of scope)
- `src/components/reports/hooks/useStudentProgress.ts` — US3-T004 filtered params (feature enhancement, not fix)
- `src/utils/date.ts` / `src/utils/formatting.ts` — `getTodayISO()` duplication (cross-feature)

## Constraints
- Frontend-only changes
- Build must pass `tsc -b && vite build` with zero errors
- Lint must pass with zero new errors
- TypeScript strict mode enforced: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`
- No new dependencies
- All changes in `src/` only

## Verification
```bash
npm run build
npm run lint
rg ': any' src/components/reports/ src/components/reports/hooks/
rg 'console\.' src/components/reports/ src/components/reports/hooks/
```
