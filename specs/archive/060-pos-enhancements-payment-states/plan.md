# Implementation Plan: POS UI Polish & Payment State Indicators

**Branch**: `060-pos-enhancements-payment-states` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/060-pos-enhancements-payment-states/spec.md)

---

## 1. Proposed Changes

### 1.1 Page Container Layout

#### [MODIFY] [FinancePage.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/pages/FinancePage.tsx)
- Replace all occurrences of `max-w-[1400px]` with `max-w-[1700px]` to utilize wider desktop displays.

---

### 1.2 Component Updates

#### [MODIFY] [CreateReceiptPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceiptPanel.tsx)
- Remove `layout="vertical"` from `PaymentMethodPills` inside the sticky sidebar. This will restore the horizontal button layout inside the sidebar to save vertical space.

#### [MODIFY] [EnrollmentSelection.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/EnrollmentSelection.tsx)
- Redesign the button structure inside the mapping loop:
  - Render Payment Status badge (Paid/Due) in the top-right corner.
  - Move enrollment status (Active/Completed/Dropped) into the details row.
- Move the selected fully-paid enrollment warning banner above the cards grid.

#### [MODIFY] [ReceiptLineItemRow.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx)
- Add border states logic based on amount entered:
  - Perfect match: `isPerfect`
  - Partial match: `isPartial`
  - Overpayment: `hasOverpayment`
- Style the Amount input borders accordingly in the JSX.

---

## 2. Verification Plan

### Automated Verification
* `npm run build`
* `npm run lint`
