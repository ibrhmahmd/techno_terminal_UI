# Implementation Plan: POS Sidebar Refactor & Color Polish

**Branch**: `061-pos-sidebar-refactor-colors` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/061-pos-sidebar-refactor-colors/spec.md)

---

## 1. Proposed Changes

### 1.1 Components

#### [MODIFY] [EnrollmentSelection.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/EnrollmentSelection.tsx)
- Change warning banner to red themed (`bg-rose-50 border-rose-500 text-rose-900`).
- Remove `truncate` from the group name:
  `className="font-semibold text-slate-800 text-sm leading-tight flex-1"`
- In the card header, render solid badges for payment status:
  - Due: `bg-rose-600 border-rose-500 text-white`
  - Paid: `bg-emerald-600 border border-emerald-500 text-white`

#### [MODIFY] [ReceiptLineItemRow.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx)
- Add `isActive` and `onFocus` to props.
- If `isActive` is true, add border styling: `border-secondary bg-secondary/5 ring-1 ring-secondary`.
- Remove "Select Student *" label if `item.selectedStudent` is not null.
- Remove Amount to Pay, Discount, preset buttons, overpayment warning, and validation status text from the bottom (these move to the sidebar).
- Add `onClick={() => onFocus()}` on the card container wrapper so that clicking on any part of the card sets it as active.

#### [MODIFY] [CreateReceiptPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceiptPanel.tsx)
- Define `activeLineItemId` state.
- Add `activeLineItemId` setting inside `handleAddLineItem` and `handleRemoveLineItem`.
- Restructure JSX to `grid grid-cols-1 lg:grid-cols-4 gap-6 items-start`.
- Left Column (`lg:col-span-3`): holds line items loop and payer/notes cards. Pass `isActive={activeLineItemId === item.id}` and `onFocus={() => setActiveLineItemId(item.id)}` to `ReceiptLineItemRow`.
- Right Sidebar Column (`lg:col-span-1`):
  - Find `activeItem = lineItems.find(item => item.id === activeLineItemId) || lineItems[0]`.
  - Render an "Active Student Details" section containing:
    - Amount to Pay input (with green/orange/red border validation).
    - Discount input.
    - Presets suggestions cards.
    - Overpayment warning and matching status text.
  - Render Payment Method selector (horizontal).
  - Render POS Checkout Summary and "Create Receipt" action button.

---

## 2. Verification Plan

### Automated Verification
* `npm run build`
* `npm run lint`
