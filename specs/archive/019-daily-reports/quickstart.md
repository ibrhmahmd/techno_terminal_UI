# Quickstart: Daily Reports

**Phase**: 1 — Design & Contracts | **Date**: 2026-05-21

## Implementation Order

### Sprint 1: API Layer & Hooks

1. **Create `src/api/reports/daily.ts`** — Three API functions: `getDailyReportData(date)`, `getDailyReportPdf(date)`, `sendDailyReportEmail(date, recipients)`
2. **Create `src/components/reports/hooks/useDailyReport.ts`** — React Query hooks: `useDailyReportData(date)`, `useDailyReportPdf(date)` (one-shot), `useSendDailyReport()` (mutation)

### Sprint 2: Components

3. **Create `ReportSummaryCards.tsx`** — KPI cards showing total_revenue, new_enrollments, sessions_held, attendance_rate
4. **Create `ReportSessionDetails.tsx`** — Table of session_details with instructor, time, present/absent/cancelled counts, student names
5. **Create `ReportPaymentDetails.tsx`** — Table of payments_by_type with subtotals
6. **Create `ReportDatePicker.tsx`** — Date input with max=today constraint
7. **Create `ReportEmailSender.tsx`** — Comma-separated email input + send button
8. **Create `DailyReportTab.tsx`** — Assembles all sub-components, orchestrates data fetching

### Sprint 3: Page Integration

9. **Refactor `ReportsPage.tsx`** — Add "Daily Report" tab alongside any existing content
10. **Add tests** — API function tests + component smoke tests

## Files to Create

| File | Purpose |
|------|---------|
| `src/api/reports/daily.ts` | API functions for daily report endpoints |
| `src/components/reports/hooks/useDailyReport.ts` | React Query hooks |
| `src/components/reports/organisms/DailyReportTab.tsx` | Main daily report tab |
| `src/components/reports/atoms/ReportSummaryCards.tsx` | KPI summary cards |
| `src/components/reports/atoms/ReportSessionDetails.tsx` | Session detail table |
| `src/components/reports/atoms/ReportPaymentDetails.tsx` | Payment detail table |
| `src/components/reports/molecules/ReportDatePicker.tsx` | Date picker |
| `src/components/reports/molecules/ReportEmailSender.tsx` | Email send form |
| `src/tests/daily-reports.test.ts` | Tests |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/reports/molecules/TabNavigation.tsx` | Add `'daily'` to `TabId` union type + add tab config |
| `src/pages/ReportsPage.tsx` | Add Daily Report tab case in `renderTabContent` |

## Verification

```bash
npm run lint      # Zero errors
npm run build     # tsc -b && vite build must succeed
npm run test      # Pass all tests
```

## Key Decisions

- **Tab location**: New "Daily Report" tab in existing Reports page
- **PDF download**: base64 → Blob → anchor click (no external library)
- **Email input**: Free-form comma-separated text with client-side regex validation
- **Date picker**: Native `<input type="date">` with `max={today}`
- **Cache**: `staleTime: 0` — always fresh for date-specific snapshots
- **Empty state**: "No data for {date}" message when API returns 404
- **Loading state**: Skeleton/spinner while fetching
