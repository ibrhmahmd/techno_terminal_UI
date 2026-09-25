# Feature Specification: Finance UI Tweaks

**Feature Branch**: `026-finance-ui-tweaks`
**Created**: 2026-06-02
**Status**: Draft
**Input**: User description: "remove the metrics totally and replace it with the lables representing the tabs. in the payment options it should be (cash, E-Wallet, instaPay, other) each with different color, and icon. the alignment of the student selection and the next boxes of payment amount beside it needs a review. the payment method must be chosen."

## User Scenarios & Testing

### User Story 1 — Navigate Finance via Tab Labels (Priority: P1)

The user navigates the Finance page using labeled tabs instead of metric cards. On load they see clear tab labels (e.g., Today's Receipts, Create Receipt, Unpaid, Refunds) rendered as the primary navigation, with no metric cards above.

**Why this priority**: Core navigation structure change — affects every Finance page visit.

**Independent Test**: Navigate to Finance page — verify metric cards are gone and tab labels replace them as the primary navigation method. Click each tab to verify panel content switches.

**Acceptance Scenarios**:

1. **Given** the Finance page is loaded, **When** the page renders, **Then** no metric strip cards are shown
2. **Given** the Finance page is loaded, **When** the page renders, **Then** tab labels are visible: "Today's Receipts", "Create Receipt", "Unpaid", "Refunds"
3. **Given** tab labels are displayed, **When** the user clicks a tab label, **Then** the corresponding panel opens below and the clicked label is highlighted as active
4. **Given** a panel is open, **When** the user clicks a different tab label, **Then** the panel switches, the page scrolls to top, and the new tab becomes active
5. **Given** the Finance page loads for the first time, **When** no tab is pre-selected, **Then** the Today's Receipts panel is open by default (default tab)

### User Story 2 — Payment Options as Pills with Colors and Icons (Priority: P1)

The user sees payment method pills with options: Cash, E-Wallet, instaPay, Other. Each option has a distinct color and icon. Payment method selection is required before creating a receipt.

**Why this priority**: Directly affects receipt creation flow — must work for every transaction.

**Independent Test**: Open Create Receipt panel — verify 4 payment pills render (Cash, E-Wallet, instaPay, Other) each with different color and icon. Try to submit without selecting → see validation error.

**Acceptance Scenarios**:

1. **Given** the Create Receipt panel is open, **When** the payment method section renders, **Then** the user sees 4 pill buttons: Cash, E-Wallet, instaPay, Other
2. **Given** the 4 payment pills are displayed, **When** each pill renders, **Then** it has its assigned color and icon: Cash → green, E-Wallet → red, instaPay → purple, Other → grey
3. **Given** no pill is selected, **When** the user clicks Create Receipt, **Then** an inline validation error appears: "Please select a payment method"
4. **Given** pill options are displayed, **When** the user clicks one pill, **Then** it becomes selected (highlighted) and previously selected pill deselects
5. **Given** a payment method is selected, **When** the user creates the receipt, **Then** the selected method is used in the transaction

### User Story 3 — Improved Line Item Layout Alignment (Priority: P2)

The student selector and payment amount columns are better aligned in a horizontal row for a cleaner, more compact form.

**Why this priority**: UX improvement — affects visual clarity during receipt creation but not functionality.

**Independent Test**: Open Create Receipt panel with a line item — verify student selector and amount/discount inputs are aligned in a readable horizontal layout.

**Acceptance Scenarios**:

1. **Given** the Create Receipt panel has line items, **When** a line item row renders, **Then** the student selector + enrollment appear in a left column, and amount + discount + payment type pills appear in a right column (two-column layout)

### Edge Cases

- What happens if the user refreshes the page? Draft auto-save should preserve the form state including payment method pills selection
- How does the tab label navigation behave on mobile (small screen)? Tabs scroll horizontally (overflow-x-auto)
- What if the user clicks a tab repeatedly? Should not cause multiple renders

## Requirements

### Functional Requirements

- **FR-001**: The Finance page MUST NOT display the metrics strip cards as navigation
- **FR-002**: The Finance page MUST display labeled tabs as the primary navigation, with default Today's Receipts tab open on load
- **FR-003**: Payment method pills MUST include exactly 4 options: Cash, E-Wallet, instaPay, Other
- **FR-004**: Each payment pill MUST have a distinct background color and a unique icon
- **FR-005**: No payment method pill MAY be pre-selected by default (user must actively choose)
- **FR-006**: Creating a receipt WITHOUT a selected payment method MUST show an inline validation error "Please select a payment method"
- **FR-007**: E-Wallet and instaPay payment options are UI labels only — no real payment gateway integration is required (same store-on-receipt behavior as Cash)
- **FR-008**: The line item row layout MUST use the two-column layout: Student + Enrollment in left column, Amount + Discount + Payment Type pills in right column

### Key Entities

No new entities — modifies existing Finance page components.

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can navigate between all 4 Finance panels in under 2 seconds by clicking tab labels
- **SC-002**: User can identify each payment option by its unique color and icon within 1 second
- **SC-003**: User cannot submit a receipt without selecting a payment method (zero bypass risk)
- **SC-004**: Line item form fields are aligned in a horizontal row with no visual overlap on desktop viewports

## Clarifications

### Session 2026-06-02

- Q1: Are E-Wallet and instaPay real payment gateways or just UI labels? → A: Just UI labels — same store-on-receipt behavior as Cash
- Q2: How should the tab bar behave on mobile? → A: Horizontally scrollable (overflow-x-auto)
- Q3: Should the Refunds tab be implemented now or stay "Coming Soon"? → A: Keep "Coming Soon" placeholder

## Assumptions

- The existing 4 panels (Today's Receipts, Create Receipt, Unpaid Enrollments, Refunds) remain unchanged — only navigation changes
- Draft auto-save from the previous implementation continues to work for the payment method selection
- The current creation flow and API integration remain unchanged
- Tab labels match panel names verbatim: "Today's Receipts", "Create Receipt", "Unpaid", "Refunds"
- Payment pill icon selection will use reasonable defaults (Material Symbols) unless specified otherwise
- Line item layout follows Option A: Student + Enrollment left column, Amount + Discount + Payment Type right column
- E-Wallet and instaPay are UI-only labels — no payment gateway integration required
- Refunds tab continues to show "Coming Soon" placeholder
- Mobile tabs use horizontal scroll (overflow-x-auto) — no vertical stacking or drawer
