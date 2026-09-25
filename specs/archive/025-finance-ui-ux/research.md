# Research: Finance Page UI/UX & Navigation Overhaul

**Phase**: 0 (Outline & Research)  
**Date**: 2026-06-01  
**Plan**: [plan.md](./plan.md)

## Research Questions & Findings

### RQ1: What API endpoints are available for the metrics strip?

**Decision**: Use `getDailyCollections()` from `api/finance/reporting.ts`
- Returns `DailyCollectionItem[]` with `payment_method`, `total_amount`, `receipt_count`, `target_date`
- Already exists at `GET /finance/reports/daily-collections`
- Summing `total_amount` across all methods gives "Today's Collections"
- Summing `receipt_count` across all methods gives "Receipts Today"

Also use `getStudentBalance` from `api/finance/balance.ts` for outstanding balance — but this is per-student. A cumulative outstanding balance endpoint does not exist yet in the frontend API. The plan will use `getUnpaidEnrollments` and sum `remaining_balance` across all unpaid enrollments as a proxy, or show total from the first metrics card.

**Rationale**: These endpoints are already in the codebase and require no backend changes.

**Alternatives considered**: Dashboard daily overview (`GET /dashboard/daily-overview`) — doesn't include financial data.

---

### RQ2: What API endpoint powers the "Today's Receipts" tab?

**Decision**: Use `getDailyReceipts(targetDate)` from `api/finance/reporting.ts`
- Returns `DailyReceiptItem[]` with `receipt_id`, `receipt_number`, `payer_name`, `total_amount`, `payment_method`, `issued_at`
- Accepts optional `target_date` (YYYY-MM-DD), defaults to today
- Perfect for the day-selector-driven list

For the expandable "Advanced Search" section: use `searchReceipts(params)` from `api/finance/receipts.ts`
- Accepts `ReceiptSearchParams` with `from_date`, `to_date`, optional `payer_name`
- Returns `ReceiptListItem[]` — similar shape to `DailyReceiptItem`

**Rationale**: Both endpoints exist, zero backend changes needed.

**Alternatives considered**: Creating a new API endpoint — rejected as unnecessary.

---

### RQ3: Can `ReportDaySelectorBar` be reused directly?

**Decision**: Yes, reuse as-is
- Component at `src/components/reports/molecules/ReportDaySelectorBar.tsx`
- Props: `date: string`, `onDateChange: (date: string) => void`
- Drop-in compatible with the Today's Receipts tab
- Also consider extracting a shared version to `components/common/` if needed by other pages in the future, but for now import directly

**Rationale**: Avoids duplication. The Reports and Finance use cases are identical.

**Alternatives considered**: Creating a new finance-specific day selector — rejected as unnecessary complexity.

---

### RQ4: How should data fetching be structured for new components?

**Decision**: Use React Query hooks (new), not the existing raw-state hooks
- Create `useDailyMetrics(date)` — React Query hook wrapping `getDailyCollections` + `getDailyReceipts`
- Create `useDailyReceipts(date)` — React Query hook wrapping `getDailyReceipts`
- The existing `useReceipts` hook (raw state) stays for the Create Receipt panel form flow, which involves local form state and one-time create actions
- The Search Receipts functionality within the Today's tab uses React Query directly for list fetching

**Rationale**:
- Constitution Gate II requires React Query for server data
- The existing raw-state hooks are tightly coupled to form state; refactoring them is out of scope
- New React Query hooks follow the project pattern (see `useDailyCollections` in reports)

**Alternatives considered**: Refactoring `useReceipts` to React Query — rejected as scope creep for this feature.

---

### RQ5: Payment type changes — do they affect the API?

**Decision**: No API changes needed
- The backend `payment_type` field accepts all values: `course_level | competition | materials | registration | other`
- We only change the UI dropdown options in `ReceiptLineItemRow.tsx` to show: Course Level, Competition, Other
- Existing receipts with `materials` or `registration` types remain unaffected in the database

**Rationale**: Pure UI change — no backend impact.

**Alternatives considered**: Removing values from the backend enum — rejected; backend should remain permissive.

---

### RQ6: How should draft auto-save work?

**Decision**: sessionStorage-based auto-save
- Save the Create Receipt form state (line items, amounts, selections, notes) every 10 seconds while editing
- Use `sessionStorage` (cleared on tab close) rather than `localStorage` (persists across sessions)
- On mount, check for draft in sessionStorage; if found, show a "Draft restored" toast and populate the form
- Clear the draft on successful receipt creation

**Rationale**: sessionStorage is the right choice — drafts should not persist after the tab is closed (stale data risk). 10-second interval balances responsiveness with performance.

**Alternatives considered**: localStorage (rejected — stale drafts), every keystroke (rejected — performance overhead), React Query cache (rejected — form state is not server state).

---

### RQ7: How does metrics-as-navigation change the existing MetricsStripCards component?

**Decision**: Modify the existing `MetricsStripCards` component — already accepts `onClick` per card, so no structural change needed. The `FinancePage` passes navigation handlers as `onClick`. Add a visual active state (highlighted border/background) for the currently open card.

**Rationale**: The component was designed with optional `onClick` from the start — it's already clickable. Only the active-state highlighting needs adding.

**Alternatives considered**: Creating a separate `MetricsNavStrip` component — rejected; it's the same component with one prop toggle.

---

### RQ8: Payment type pills — should they be a shared component or inline?

**Decision**: Extract a shared `PaymentMethodPills.tsx` component that accepts an array of `{ value, label }` options, `selected`, `onChange`, and `error` props. Reuse for both payment method (Cash/Card/Transfer/Other) and payment type (Course Level/Competition/Other) in `ReceiptLineItemRow.tsx`.

**Rationale**: Both use the same pill visual style and validation pattern. A shared component avoids duplication and ensures consistent UX.

**Alternatives considered**: Separate components per use case — rejected; would duplicate styling and validation logic.

---

### RQ9: Without a tab bar, how is the "active" panel tracked in FinancePage?

**Decision**: Use a `activePanel` state variable (string union: `'receipts' | 'create' | 'unpaid' | 'refunds'`) — exactly like the current tab-based implementation but without rendering the tab bar. The metrics strip visually reflects this via an `activeIndex` prop.

**Rationale**: Minimal internal change — the panel switching logic already exists; we just remove the tab bar UI and wire metric card clicks to the same `handleTabChange` function.

**Alternatives considered**: URL-based routing (rejected — over-engineering for same-page panels), single-panel scroll layout (rejected — too much content to scroll through).
