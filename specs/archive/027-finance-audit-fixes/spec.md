# Feature Specification: Finance Audit Fixes

**Feature Branch**: `027-finance-audit-fixes`
**Created**: 2026-06-02
**Status**: Draft
**Input**: Comprehensive audit of the finance feature identified bugs, dead code, TypeScript issues, data-fetching anti-patterns, and accessibility gaps across 15+ source files.

## User Scenarios & Testing

### User Story 1 - Fix Breaking Bugs in Receipt Creation and Search (Priority: P1)

Finance staff frequently create receipts and search for existing ones. Four bugs currently cause incorrect data display or silent failure: the receipt creation error message always shows a generic message instead of the real API error; all advanced search results show amount zero; the "View Details" action in Search Receipts fetches data but never renders it; and the unpaid enrollments total shown on the Finance page may be incorrect when there are more than 200 unpaid enrollments.

**Why this priority**: These bugs directly impact the accuracy of financial data and the user's ability to diagnose failures. Incorrect totals and missing error messages erode trust in the system.

**Independent Test**: Can be tested by: (a) triggering a receipt creation error and verifying the real error message appears; (b) running an advanced search that returns receipts with amounts and verifying amounts are displayed; (c) clicking "View Details" on a search result and seeing a detail modal; (d) verifying the unpaid count/amount on the Finance page matches the actual unpaid enrollment data.

**Acceptance Scenarios**:

1. **Given** a receipt creation fails with a server error, **When** the user clicks "Create Receipt", **Then** the actual error message from the server is displayed instead of a generic "Failed to create receipt"
2. **Given** a user performs an advanced search that returns receipts with non-zero amounts, **When** the search results are displayed, **Then** each receipt shows its actual total amount (not zero)
3. **Given** a user clicks "View Details" on a receipt in search results, **When** the detail request completes, **Then** a receipt detail modal or panel is shown with the receipt information
4. **Given** a user views the Finance page when more than 200 unpaid enrollments exist, **When** the unpaid metrics cards render, **Then** the displayed unpaid count and amount reflect the actual totals (not just the first 200 records)

---

### User Story 2 - Keep Dashboard Metrics Up-to-Date After Transactions (Priority: P1)

After creating a receipt, adjusting a balance, or issuing a refund, the metrics strip cards (total collected today, receipt count, unpaid count, unpaid amount) and the daily receipts list show stale data until the page is hard-refreshed. Finance staff rely on these metrics for real-time decision making.

**Why this priority**: Stale metrics undermine the purpose of the dashboard. Staff cannot trust the displayed numbers without refreshing, reducing productivity and increasing the risk of decisions based on outdated information.

**Independent Test**: Can be tested by creating a new receipt and verifying the "Today's Receipts" card and daily receipts list update immediately (within a few seconds) without a page refresh.

**Acceptance Scenarios**:

1. **Given** a user creates a new receipt, **When** the creation succeeds, **Then** the daily metrics and receipt list update to reflect the new receipt within 5 seconds
2. **Given** a user adjusts a student balance, **When** the adjustment succeeds, **Then** the unpaid metrics update within 5 seconds
3. **Given** a user issues a refund, **When** the refund succeeds, **Then** the daily metrics update within 5 seconds

---

### User Story 3 - Remove Dead Finance Components (Priority: P2)

Two files in the finance module — `SearchReceiptsPanel.tsx` (178 lines) and `index.ts` (barrel re-export) — are never imported or consumed by any other part of the application. They add maintenance overhead and confuse developers exploring the codebase.

**Why this priority**: Dead code has no user-facing impact but increases cognitive load and introduces risk of unused dependencies accumulating over time.

**Independent Test**: Can be tested by removing the two files and verifying the application builds with zero errors and the finance page functions identically.

**Acceptance Scenarios**:

1. **Given** the two files are removed, **When** the application is built, **Then** the build completes with zero errors
2. **Given** the two files are removed, **When** a user navigates through all finance panels (receipts, create, unpaid, refunds), **Then** all panels render and function correctly

---

### User Story 4 - Show Correct Payment Method Labels in Search and Detail Views (Priority: P2)

Search results and detail modals for receipts paid via E-Wallet or instaPay show the raw API value (e_wallet, instapay) instead of a human-readable label. The method color badges in receipt lists also fail to colorize these new payment methods properly.

**Why this priority**: Users see raw internal values instead of familiar labels, reducing readability and professional appearance of the interface.

**Independent Test**: Can be tested by searching for a receipt paid via E-Wallet and verifying the label shows "E-Wallet" with a red color badge, and instaPay shows "instaPay" with a purple color badge.

**Acceptance Scenarios**:

1. **Given** a receipt was paid via E-Wallet, **When** it appears in search results or the detail modal, **Then** the method displays as "E-Wallet" with appropriate styling
2. **Given** a receipt was paid via instaPay, **When** it appears in search results or the detail modal, **Then** the method displays as "instaPay" with appropriate styling

---

### User Story 5 - Harden Runtime Type Safety in Receipt Creation (Priority: P2)

The receipt creation form uses unsafe type assertions (`as 'cash' | 'e_wallet' | 'instapay' | 'other'`) to cast user-selected values before sending to the API. There is no runtime validation. If a value falls outside the expected union, the API receives an unrecognized method with no compile-time or runtime protection.

**Why this priority**: Unsafe type assertions are a common source of hard-to-debug runtime errors. Adding validation prevents silent data corruption and makes the code more maintainable.

**Independent Test**: Can be tested by inspecting the receipt payload sent during creation and verifying that payment method and payment type values are validated against allowed values before being sent.

**Acceptance Scenarios**:

1. **Given** a user selects a payment method, **When** the receipt is created, **Then** the method value sent to the API is validated against the allowed set (cash, e_wallet, instapay, other)
2. **Given** a user selects a payment type on a line item, **When** the receipt is created, **Then** the payment type value sent to the API is validated against the allowed set (course_level, competition, other)

---

### User Story 6 - Improve Accessibility of Finance Interface (Priority: P3)

The finance interface has multiple accessibility gaps: Material Symbols decorative icons lack `aria-hidden` (causing screen readers to read icon names aloud), MetricsStripCards tab navigation lacks proper ARIA roles and states, form inputs lack `htmlFor`/`id` associations with their labels, and no single-panel error boundaries exist (a crash in one panel takes down the entire finance page).

**Why this priority**: Accessibility issues affect users who rely on screen readers and keyboard navigation. They also represent general UX quality concerns.

**Independent Test**: Can be tested by navigating the finance page with a screen reader: verify icons are not announced, tab controls are announced with proper roles, and form inputs are associated with their labels. Also, simulate a crash in one panel and verify other panels remain functional.

**Acceptance Scenarios**:

1. **Given** a user navigates the finance page with a screen reader, **When** they encounter any Material Symbols icon, **Then** the icon name is not announced (aria-hidden applied)
2. **Given** a user navigates the metrics strip with a screen reader, **When** they focus on a metric card, **Then** it is announced as a tab in a tablist with its selected state
3. **Given** a user fills out a form in the Create Receipt panel, **When** they focus on an input, **Then** the screen reader announces the correct label text
4. **Given** a panel crashes (e.g., TodayReceiptsList throws an error), **When** the error occurs, **Then** only that panel shows an error state and other panels remain interactive

---

### User Story 7 - Migrate Student Enrollments to Cached Query (Priority: P3)

The `useStudentEnrollments` hook uses a manual `useEffect` + `useState` pattern that fires independent API calls for every component that uses it (e.g., EnrollmentSelection and ManageEnrollmentPanel). There is no cache deduplication, so the same enrollment data may be fetched multiple times, and after a receipt is created, the enrollment data remains stale.

**Why this priority**: While not breaking, this pattern wastes bandwidth, increases load on the server, and can show stale enrollment data after financial transactions.

**Independent Test**: Can be tested by using two components that both call useStudentEnrollments with the same student ID and verifying only one API call is made (cached sharing).

**Acceptance Scenarios**:

1. **Given** two components both use useStudentEnrollments with the same student ID, **When** they render simultaneously, **Then** only one API call is made for that student's enrollments
2. **Given** a receipt is created for a student, **When** useStudentEnrollments is queried for that student, **Then** the enrollment data reflects the new payment within a reasonable time

---

### Edge Cases

- What happens when a receipt is created with a payment method value that doesn't match any known option? The validated narrowing should fall back to a safe default (e.g., "cash") rather than sending an invalid value.
- What happens when the enrollments API returns an empty list? The unpaid metrics should still display "0" rather than showing loading state or crashing.
- What happens when search returns 0 results? The search results panel should show a "No results found" message instead of an empty table with zero-amount rows.
- What happens when a component in a panel throws during render? The ErrorBoundary should catch it and show a fallback UI for that panel only, without affecting other panels.

## Requirements

### Functional Requirements

- **FR-001**: The receipt creation error display MUST show the actual server error message instead of a hardcoded fallback
- **FR-002**: Search results MUST display the actual total_amount from the API response (not hardcoded zero)
- **FR-003**: Clicking "View Details" on a search result MUST open a receipt detail modal/panel showing the receipt's full information
- **FR-004**: The unpaid enrollment metrics MUST use paginated/aggregated totals that correctly reflect enrollments beyond the first 200
- **FR-005**: After creating a receipt, the Finance page dashboard metrics MUST update to reflect the new receipt within 5 seconds without requiring a page refresh
- **FR-006**: After adjusting a student balance, the unpaid metrics on the Finance page MUST update within 5 seconds
- **FR-007**: After issuing a refund, the Finance page dashboard metrics MUST update within 5 seconds
- **FR-008**: Unused files (`SearchReceiptsPanel.tsx`, `finance/index.ts`) MUST be removed without affecting any other functionality
- **FR-009**: Receipt search results MUST display "E-Wallet" and "instaPay" as human-readable labels with distinguishing colors
- **FR-010**: Receipt detail modals MUST display "E-Wallet" and "instaPay" as human-readable labels
- **FR-011**: Payment method values sent to the API MUST be validated against the allowed set at runtime before submission
- **FR-012**: Payment type values sent to the API MUST be validated against the allowed set at runtime before submission
- **FR-013**: The pill option color values MUST be restricted to the set of four valid colors (emerald, red, purple, slate)
- **FR-014**: All decorative icons in finance components MUST be hidden from screen readers so the icon names are not announced
- **FR-015**: The metrics strip cards MUST be announced by screen readers as a set of tabs, with the active card indicated as selected
- **FR-016**: All form labels in finance components MUST be programmatically associated with their corresponding input fields
- **FR-017**: A crash in one finance panel (receipts, create, unpaid, refunds) MUST NOT affect the rendering or functionality of other panels
- **FR-018**: When multiple parts of the user interface request enrollment data for the same student, the system MUST make only one API call
- **FR-019**: The close button in the receipt detail modal MUST have a descriptive accessible label
- **FR-020**: Button groups that provide mutually exclusive filtering options (e.g., group-by, age filter) MUST be announced by screen readers as radio groups, with the active option indicated
- **FR-021**: The receipt detail modal MUST be announced by screen readers as a dialog
- **FR-022**: After switching between finance panels, keyboard focus MUST move to the new panel content

### Key Entities

No new entities. This feature modifies existing components, hooks, and types in the finance module. All changes are limited to frontend source files.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Receipt creation errors show the actual server-provided error message instead of a generic fallback in 100% of cases
- **SC-002**: Advanced search results display the correct total_amount for every receipt returned (zero false positives)
- **SC-003**: After creating a receipt, adjusting a balance, or issuing a refund, the Finance page metrics update within 5 seconds without requiring a page refresh
- **SC-004**: Navigation to all finance panels continues to work identically after removing dead code files — verified by the application building with zero errors
- **SC-005**: All decorative icons in the finance module are hidden from screen readers — verified by automated accessibility audit
- **SC-006**: A simulated crash in any single finance panel does not affect the rendering or functionality of other panels
- **SC-007**: All source code changes compile with zero errors
- **SC-008**: All changed files pass automated code quality checks with zero errors

## Assumptions

- The four payment method values (`cash`, `e_wallet`, `instapay`, `other`) match what the backend API accepts — no backend changes needed
- The backend API may not provide `total_amount` in the search response currently; the fix assumes the field exists in the response but may be missing from the TypeScript type definition
- All accessibility improvements follow standard web accessibility guidelines
- Error isolation components (such as error boundaries) exist elsewhere in the codebase and can be reused
- The existing data caching mechanism is used for cache invalidation — no new caching library is introduced
- The student enrollments data hook is only consumed by 2 components
- Catch clause type improvements may require downstream changes in error handling that could affect callers
