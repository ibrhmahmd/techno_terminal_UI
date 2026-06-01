# Feature Specification: Finance Page UI/UX & Navigation Overhaul

**Feature Branch**: `025-finance-ui-ux`
**Created**: 2026-05-30
**Status**: Draft
**Input**: User description: "great now lets focus on the finance page we need to develop its UI/UX and solve ints navigation issues for a better user experience so lets opena spec for it and lets exchange question and collect requirements"

## Clarifications

### Session 2026-06-01
- Q: Default view on page load (no tab bar) → A: Auto-open Today's Receipts panel below metrics on load (same as former first tab).
- Q: Navigation between panels without tabs → A: Metrics act as nav buttons — click a metric to open/switch to that panel. The active metric card is visually highlighted.
- Q: Payment Type UI — pills or dropdown? → A: Replace payment type dropdown with pills, same style as payment method (no default selection, inline validation).

### Session 2026-05-30

- Q: Payment type options → A: Keep course_level, competition, and other (catch-all). Remove materials and registration.
- Q: Check Risk button → A: Keep it as-is (do not remove).
- Q: Today's Receipts tab format → A: Flat paginated list of receipts for the selected day.
- Q: Search vs Today's Receipts overlap → A: Merge Search Receipts into Today's Receipts. The Today's Receipts tab has a day selector always visible, plus an expandable "Advanced Search" section for date range + payer name filter + sorting.
- Q: Tab order → A: Today's Receipts | Create Receipt | Unpaid Enrollments | Refunds (Coming Soon).
- UX Suggestion 1 (metrics strip) → A: Accepted. Add a horizontal metrics strip above tabs showing today's collections, outstanding balance, and receipt count.
- UX Suggestion 2 (payment method pills) → A: Accepted. Payment method as pills (not dropdown), no default selection, inline validation warning on submit if none selected.
- UX Suggestion 3 (line items compact) → A: Accepted. Line items flow horizontally on desktop (student, enrollment, amount, payment type, notes in a single row).
- UX Suggestion 4 (empty states) → A: Accepted. Each panel gets a designed empty state with illustration and message.
- UX Suggestion 5 (draft auto-save) → A: Accepted. Auto-save receipt drafts to sessionStorage to prevent data loss on accidental navigation.

## User Scenarios & Testing

### User Story 1 - Finance Overview Metrics Strip (Priority: P1)

An admin or finance staff member lands on the Finance page and immediately sees a clear summary of key financial metrics — today's collections, outstanding balances, receipt count — without needing to click into any panel. This metrics strip is always visible regardless of which tab is active.

**Why this priority**: The current page opens to an empty Create Receipt form with no visibility into financial health. Users need an at-a-glance financial snapshot.

**Independent Test**: Can be tested by navigating to the Finance page and verifying that a metrics strip with 3-4 stat cards is visible above the tabs on page load.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Finance page, **When** the page loads, **Then** they see a horizontal metrics strip above the tabs displaying today's total collections, outstanding balance, and receipt count
2. **Given** the metrics strip is displayed, **When** data is still loading, **Then** meaningful skeleton placeholders are shown for each stat card
3. **Given** the metrics strip experiences an error, **When** the page renders, **Then** a clear error state with retry option is shown for that stat card independently

---

### User Story 2 - Metrics-Driven Module Navigation (Priority: P1)

Users navigate financial modules by clicking metric strip cards: **Collected Today → Today's Receipts | Receipts Today → Create Receipt | Unpaid Count/Amount → Unpaid Enrollments**. The active metric card is visually highlighted and state is preserved when switching. On page load, Today's Receipts panel is open by default.

**Why this priority**: The user specifically called out "navigation issues" as a pain point. Making the metrics strip the navigation eliminates redundant UI while keeping financial KPIs always visible.

**Independent Test**: Can be tested by clicking each metric card and verifying the corresponding panel renders below, the active card is highlighted, and clicking "Collected Today" (default) opens Today's Receipts.

**Acceptance Scenarios**:

1. **Given** the Finance page is open, **When** a user clicks on a metric card, **Then** the corresponding panel renders immediately and the clicked metric card is visually highlighted with a distinct active state
2. **Given** the user navigates between panels, **When** they click a different metric card, **Then** the previous panel content unmounts and the new panel renders, with state from the previous panel auto-saved (draft receipts saved to sessionStorage)
3. **Given** the user is in a module with unsaved work (draft receipt), **When** they click a different metric card, **Then** the draft is auto-saved to browser storage so no data is lost
4. **Given** the Finance page metrics include "Unpaid Amount", **When** a user clicks that card, **Then** the Unpaid Enrollments panel is displayed
5. **Given** the page loads for the first time, **When** the metrics strip renders, **Then** the "Collected Today" card is active and the Today's Receipts panel is open below by default

---

### User Story 3 - Today's Receipts with Day Selector (Priority: P1)

Users can view all receipts for a selected day using a week strip day selector (like the Reports page). The default view shows today's receipts. An expandable "Advanced Search" section provides date range, payer name, and sorting for power users.

**Why this priority**: Replaces the old standalone Search Receipts tab with a more intuitive day-first approach while preserving advanced search capabilities.

**Independent Test**: Can be tested by loading the Today's Receipts tab and verifying the day selector shows the current week with today highlighted, and a paginated receipt list is displayed.

**Acceptance Scenarios**:

1. **Given** the Today's Receipts tab is open, **When** the page loads, **Then** the day selector defaults to today's date and receipts for today are displayed in a paginated list
2. **Given** the day selector is displayed, **When** a user clicks on a different day, **Then** the receipt list updates to show receipts for that day
3. **Given** a day has no receipts, **When** the user selects that day, **Then** a designed empty state with an illustration and message is shown ("No receipts for this day")
4. **Given** the user needs advanced search, **When** they click "Advanced Search", **Then** an expandable section reveals date range picker, payer name input, and sort options
5. **Given** search results are displayed, **When** a user clicks on a receipt row, **Then** a detail view or panel opens showing full receipt information with a PDF download button
6. **Given** a user views a receipt in the results, **When** they click on the student name, **Then** they are navigated to the Student Detail page for that student

---

### User Story 4 - Create Receipt with Improved UX (Priority: P1)

Users can create new receipts with a redesigned form. Payment method and payment type are both pill selectors (no default selection, inline validation warning if not chosen). Payment type offers only course level and competition options. Line items flow horizontally on desktop for less scrolling. A "Check Risk" button remains available for overpayment preview.

**Why this priority**: The user specifically requested these UX improvements to speed up receipt creation and reduce errors.

**Independent Test**: Can be tested by clicking the Receipts Today metric card to open the Create Receipt panel and verifying both payment method and payment type show pills (not dropdowns), no pill is pre-selected, and clicking "Create Receipt" without selecting shows inline warnings.

**Acceptance Scenarios**:

1. **Given** the Create Receipt panel is open, **When** a user views the payment method field, **Then** it is displayed as a row of clickable pills with no default selection
2. **Given** no payment method pill is selected, **When** the user clicks "Create Receipt", **Then** the payment method label turns red with a shake animation and a "Please select a payment method" message appears inline
3. **Given** the payment type field, **When** a user views it, **Then** it is displayed as a row of clickable pills (Course Level, Competition, Other) with no default selection — materials and registration are removed
4. **Given** no payment type pill is selected for a line item, **When** the user clicks "Create Receipt", **Then** inline validation warns "Please select a payment type for each line item"
5. **Given** a user is filling out a receipt, **When** they select a student with an existing balance, **Then** the outstanding balance is displayed inline for reference
6. **Given** a user fills out line items on desktop, **When** the form renders, **Then** each line item's fields (student, enrollment, amount, payment type, notes) flow in a single horizontal row to reduce vertical scrolling
7. **Given** a user has partially filled a receipt, **When** they accidentally navigate away, **Then** the draft is auto-saved to sessionStorage and a "Draft restored" message appears on return

---

### User Story 5 - Unpaid Enrollments (Priority: P2)

Users can view and manage unpaid enrollments with filtering and grouping options, and flow seamlessly from an unpaid enrollment to create a receipt with data pre-filled.

**Why this priority**: Existing functionality that needs UX polish — filters, grouping, empty states, and cross-panel flow.

**Independent Test**: Can be tested by clicking "Pay Now" on an unpaid enrollment and verifying the Create Receipt form opens with the enrollment data pre-filled.

**Acceptance Scenarios**:

1. **Given** a user views an unpaid enrollment, **When** they click "Pay Now", **Then** the Create Receipt panel opens with the student, enrollment, and amount pre-filled
2. **Given** the Unpaid Enrollments panel has no data, **When** it loads, **Then** a "No unpaid enrollments — great!" empty state with a green checkmark illustration is displayed
3. **Given** a user needs to adjust a student's balance, **When** viewing a receipt or unpaid enrollment, **Then** they can click a quick-link to open the Student Detail page where the balance adjustment form is available

---

### User Story 6 - Future-Proof Navigation with Placeholder Modules (Priority: P3)

Users can see the full range of financial capabilities available, even if some are not yet built. Placeholder tabs (Refunds) show a "Coming Soon" state, signaling the feature is planned.

**Why this priority**: Ensures the navigation architecture is extensible and users aren't confused when new modules appear later.

**Independent Test**: Can be tested by clicking on the "Refunds" tab and verifying a clear "Coming Soon" message is displayed.

**Acceptance Scenarios**:

1. **Given** the Finance page navigation is displayed, **When** a user sees the Refunds tab, **Then** it is clickable and navigates to a panel showing a "Coming Soon" message with an explanation

### Edge Cases

- What happens when a user has no financial data (empty state for each module)? → Designed empty state with illustration per panel (UX Suggestion 4)
- How does the page behave when the network is slow or disconnected? → Skeleton loaders for metrics, receipts list, and unpaid enrollments independently
- What happens when searching for receipts with no matching results? → Empty state with message "No receipts found for this date range"
- How are concurrent receipt creations handled? → Button is disabled during submission, preventing double-submit
- What happens when a receipt is created but PDF generation fails? → Receipt is still created, PDF download shows an error toast with retry option
- How are "Coming Soon" placeholder panels handled? → The Refunds section (from the unpaid amount metric click) shows a full-page placeholder with a message and icon until implemented
- What happens when a user tries to submit a receipt without selecting a payment method? → Inline validation: payment method pills area turns red with a shake animation and warning text
- What happens to draft receipts when the browser sessionStorage is cleared? → Draft is silently lost; user sees fresh empty form on next visit
- How does the day selector handle dates with no financial data (future dates, past dates before the system existed)? → Shows the designed empty state with "No receipts for this day"

## Requirements

### Functional Requirements

- **FR-001**: Finance page MUST display a horizontal metrics strip showing: today's total collections, today's receipt count, unpaid enrollment count, and unpaid amount. Each stat MUST be a compact card with a label, value, and icon. Metrics cards serve as the primary navigation — clicking a card opens its corresponding panel below. The active (currently open) metric card is visually highlighted.
- **FR-002**: There MUST NOT be a tab bar. Instead, the metrics strip doubles as navigation. Four cards are shown: collected today (receipts icon), receipts today (receipt icon), unpaid enrollment count (warning icon), unpaid amount (balance icon). Clicking a card opens/reveals its panel below: **Today's Receipts | Create Receipt | Unpaid Enrollments | Refunds**. The active card is visually highlighted. On page load, Today's Receipts panel is open by default (collected today card is active).
- **FR-003**: The Today's Receipts tab MUST show a week strip day selector (Saturday–Friday, matching the Reports page `ReportDaySelectorBar` pattern). Selecting a day MUST update the receipt list to show receipts for that day only.
- **FR-004**: The Today's Receipts tab MUST include an expandable "Advanced Search" section that reveals: date range picker (from/to), payer name text input, and sort options (date, amount). The default view is simple day-selector mode.
- **FR-005**: Receipt list results (in Today's tab) MUST be paginated. Each row MUST show: receipt number, student name, amount, payment method, and date/time. Clicking a row MUST open a detail panel with full receipt info and a PDF download button.
- **FR-006**: Users MUST be able to download a PDF for any receipt from the detail panel.
- **FR-007**: Create Receipt panel MUST display payment method as a row of **clickable pills** (not a dropdown): Cash, Card, Bank Transfer, Other. No pill is pre-selected by default.
- **FR-008**: If the user clicks "Create Receipt" without selecting a payment method, the payment method label MUST turn red with a shake animation and display "Please select a payment method" inline warning. The submission MUST be blocked until a method is selected.
- **FR-009**: Both payment method AND payment type in line items MUST use **clickable pills** (not dropdowns). Payment type pills: Course Level, Competition, Other. Materials and Registration options MUST be removed. No pill is pre-selected by default. Inline validation on submit if any are unselected.
- **FR-010**: Line items in Create Receipt MUST flow in a single horizontal row on desktop (student combobox, enrollment, amount, payment type, notes). On mobile they stack vertically.
- **FR-011**: The "Check Risk" button MUST remain available in the Create Receipt panel (alongside the Create Receipt button). It performs an overpayment risk preview as it currently does.
- **FR-012**: Create Receipt panel MUST auto-save the current form state (line items, amounts, selections) to sessionStorage every 10 seconds while the user is actively editing. On page load, if a draft exists in sessionStorage, a "Draft restored" toast is shown.
- **FR-013**: Users MUST be able to view and manage unpaid enrollments with filtering and grouping options.
- **FR-014**: Users MUST be able to flow seamlessly from an unpaid enrollment to create a receipt with data pre-filled ("Pay Now" flow).
- **FR-015**: Finance page MUST include a Refunds placeholder accessible via the metrics strip (mapped to a metric card, e.g., unpaid amount, or a dedicated fifth card). It displays a "Coming Soon" placeholder panel with a message that the feature is under development.
- **FR-016**: Finance page MUST provide quick-link shortcuts from receipts and unpaid enrollments to the Student Detail page for balance adjustments.
- **FR-017**: Each panel MUST have a designed empty state with an illustration and descriptive message. Loading states MUST use skeleton placeholders. Error states MUST show a message and retry button.
- **FR-018**: The page layout MUST be fully responsive, with metrics cards wrapping to multiple rows on smaller screens and panels stacking vertically.

### Key Entities

- **Receipt**: A financial document recording a payment. Contains receipt number, line items, payer, amount, payment method, timestamps, and PDF attachment.
- **Enrollment**: A student's registration in a group/course. Has associated fees, payment status, and balance information.
- **Student Balance**: The outstanding financial position for a student across all enrollments.
- **Refund**: A reversal of a previously issued receipt (coming soon).
- **Unpaid Enrollment**: An enrollment where the full fee has not been paid.
- **Daily Collection**: Aggregate financial data for a given day, used in reporting and metrics strip.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can navigate to any financial module within 1 click from the Finance page landing (tabs are always visible).
- **SC-002**: Users can complete a common task flow (e.g., identify unpaid enrollment → create receipt → download PDF) in under 3 minutes.
- **SC-003**: Users can find a specific past receipt within 15 seconds using the day selector or advanced search.
- **SC-004**: The page loads initial content within 2 seconds on a standard broadband connection.
- **SC-005**: 100% of navigation elements have clear visual active states and keyboard-accessible focus indicators.
- **SC-006**: Users can create a receipt without any validation errors 100% of the time once they understand the payment method pill requirement (tested via user acceptance).

## Assumptions

- Users of the Finance page are primarily admin and finance staff roles (not instructors).
- The existing API layer is stable and sufficient to support the redesigned UI — including the GET receipts endpoint for the Today's Receipts tab.
- The `ReportDaySelectorBar` component from `src/components/reports/molecules/ReportDaySelectorBar.tsx` can be reused or adapted for the Today's Receipts tab.
- Mobile responsiveness is important but the primary use case is desktop.
- The authentication, route protection, and layout shell (TopNavbar/AppLayout) remain unchanged.
- The metrics strip doubling as navigation does not require new API endpoints — the same metric data drives both the display and the click-to-navigate behavior.
- Existing financial data in the system will continue to be accessible via the same API endpoints.
- The current Create Receipt, Today's Receipts (via Search), and Unpaid Enrollments panels provide a functional baseline that can be improved incrementally.
- Draft auto-save uses sessionStorage (cleared on tab close) rather than localStorage, so no stale drafts persist across sessions.
- The payment type options "materials" and "registration" can be safely removed from the UI; existing receipts using those types remain unaffected in the database.
