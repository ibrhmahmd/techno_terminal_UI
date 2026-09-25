# Research: Daily Reports

**Phase**: 0 — Design Decisions | **Date**: 2026-05-21

## 1. Page Location

**Decision**: Add a "Daily Report" tab inside the existing Reports page (`/reports`).

**Rationale**: The app already has a `/reports` route (protected). Adding a sub-tab avoids creating a new top-level nav entry and keeps report features grouped. The sidebar link stays as "Reports" and the page renders tabs for different report types.

**Alternatives considered**:
- Standalone page `/daily-report` — adds nav clutter for a single feature.
- Settings tab — reports are operational, not configuration.

## 2. PDF Download Strategy

**Decision**: On click, call the API (no-body mode), receive base64, create a Blob, trigger download via a temporary anchor element.

**Rationale**: The API returns base64 directly (no presigned URL). Frontend converts it client-side. This avoids needing a separate file server.

**Implementation**:
```typescript
async function downloadPdf(date: string) {
  const { pdf_base64 } = await getDailyReportPdf(date)
  const byteCharacters = atob(pdf_base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daily-report-${date}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
```

**Alternatives considered**:
- Open in new tab — inconsistent user expectation for a "download" action.
- Use a library (pdf.js) — overkill for a simple download trigger.

## 3. Email Send UI

**Decision**: A simple text input accepting comma-separated emails with client-side validation, plus a "Send Report" button. No multi-select user picker.

**Rationale**: Recipients may be external (e.g., board members not in the system). A free-form input is more flexible. Validation uses a regex on blur/submit.

**Email validation regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

## 4. Date Picker

**Decision**: Use native `<input type="date">` with `max` set to today.

**Rationale**: Native date inputs are well-supported in modern browsers, zero dependencies, and `max={today}` naturally prevents future date selection. The existing codebase doesn't appear to have a custom DatePicker component.

## 5. Cache Strategy

**Decision**: `staleTime: 0` (always fetch fresh).

**Rationale**: Each request is for a specific date snapshot that doesn't change after the day ends. However, since users might re-view the same date, and data could have been corrected (e.g., late attendance entry), always fetching fresh is safer and simpler. The performance cost is negligible at this scale.

## 6. API Domain Organization

**Decision**: Create `src/api/reports/daily.ts` containing all daily-report API functions.

**Rationale**: Reports are their own API domain. The existing API directory has a flat structure per domain. Following the same pattern keeps things predictable.

## 7. React Query Hooks

**Decision**: Create `src/components/reports/hooks/useDailyReport.ts` (following existing reports hook convention) with three hooks:
- `useDailyReportData(date)` — fetches JSON report data via `GET /notifications/reports/daily/data`
- `useDailyReportPdf()` — mutation for one-shot PDF download via `POST /notifications/reports/daily` (no body)
- `useSendDailyReport()` — mutation for email send via `POST /notifications/reports/daily` (with body)

**Rationale**: All existing report hooks live in `src/components/reports/hooks/` (e.g., `useDailyCollections.ts`, `useReportsSummary.ts`), so following the same pattern avoids confusion. Note: existing hooks use `useState`+`useEffect` (pre-React Query). New hooks should use React Query per the project constitution.

## 8. Existing Reports Page

**Decision**: The ReportsPage at `src/pages/ReportsPage.tsx` already has a robust tab system with 6 tabs (Overview, Revenue, Collections, Progress, plus Enrollment and Instructors commented out). It uses `TabNavigation` from `src/components/reports/molecules/TabNavigation.tsx` with a `TabId` union type. Adding a Daily tab requires:
1. Add `'daily'` to the `TabId` type in `TabNavigation.tsx`
2. Add the tab config to `DEFAULT_TABS` in the same file
3. Add a `case 'daily'` in `ReportsPage.tsx`'s `renderTabContent`

**Rationale**: Minimal changes — the infrastructure already exists.
