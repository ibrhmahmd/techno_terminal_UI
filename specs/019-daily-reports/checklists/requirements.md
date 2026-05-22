# Requirements Checklist: Daily Reports

## API Layer (`src/api/reports/daily.ts`)

- [ ] `getDailyReportData(targetDate: string)` — GET endpoint
- [ ] `getDailyReportPdf(targetDate: string)` — POST (no body)
- [ ] `sendDailyReportEmail(targetDate: string, recipients: string[])` — POST (with body)
- [ ] All TypeScript interfaces defined and exported

## Hooks (`src/components/reports/hooks/useDailyReport.ts`)

- [ ] `useDailyReportData(date)` — fetches JSON report, `staleTime: 0`
- [ ] `useDailyReportPdf()` — one-shot download mutation
- [ ] `useSendDailyReport()` — email send mutation

## Components

### ReportDatePicker
- [ ] Native date input with `max={today}`
- [ ] Controlled value/onChange
- [ ] Defaults to today on mount

### ReportSummaryCards
- [ ] Total Revenue card
- [ ] New Enrollments card
- [ ] Sessions Held card
- [ ] Attendance Rate card (formatted as percentage)
- [ ] Grid layout, responsive

### ReportSessionDetails
- [ ] Table with instructor, time, present, absent, cancelled, student names
- [ ] Handles empty sessions array gracefully

### ReportPaymentDetails
- [ ] Grouped by payment_type
- [ ] Shows subtotal and count per group
- [ ] Expandable rows for individual items
- [ ] Handles empty payments array gracefully

### ReportEmailSender
- [ ] Comma-separated email input
- [ ] Client-side validation (regex)
- [ ] "Send Report" button
- [ ] Success/error toast feedback
- [ ] Disabled when no data

### DailyReportTab
- [ ] Loading state (skeleton/spinner)
- [ ] Empty state ("No data for {date}")
- [ ] Error state (message + retry)
- [ ] Data state (all sub-components rendered)
- [ ] Download PDF button
- [ ] Email sender section

## Page Integration

- [ ] `ReportsPage.tsx` has "Daily Report" tab
- [ ] Tab only visible to `admin` / `system_admin` roles

## Testing

- [ ] API function unit tests
- [ ] Component smoke tests
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
