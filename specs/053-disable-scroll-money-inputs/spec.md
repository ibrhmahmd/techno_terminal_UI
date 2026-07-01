# Feature Specification: Disable Scroll Wheel on Money Inputs

**Feature Branch**: `053-disable-scroll-money-inputs`
**Created**: 2026-07-01
**Status**: Draft

---

## Problem Statement

When users interact with number inputs for monetary amounts (fees, payments, salaries, discounts), scrolling with a mouse wheel or trackpad accidentally changes the value by `step` increments. This is a well-known browser behavior for `<input type="number">`, and it causes:

- **Financial errors**: accidental changes to payment amounts, discounts, or fees go unnoticed by the user
- **Frustration**: the scroll wheel should scroll the page, not change a focused input
- **One existing workaround** exists in `EnrollPanel.tsx` (`onWheel` → blur), but is inconsistently applied — most money inputs lack any protection

---

## Scope

### In Scope

All **money/payment/financial** `<input type="number">` fields across the application. These are inputs where an accidental value change could result in a financial record error:

| # | File | Inputs |
|---|------|--------|
| 1 | `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | Amount (EGP), Discount |
| 2 | `src/components/enrollments/ModifyEnrollmentPanel.tsx` | Amount Due, Discount Applied |
| 3 | `src/components/enrollments/EditEnrollmentModal.tsx` | Amount Due, Discount Applied |
| 4 | `src/pages/TeamDetailPage.tsx` | Payment Amount, Refund Amount |
| 5 | `src/components/staff/EmployeeForm/WorkSettingsSection.tsx` | Monthly Salary |
| 6 | `src/components/courses/CourseForm.tsx` | Price Per Level |
| 7 | `src/components/competitions/CompetitionForm.tsx` | Fee per Student |
| 8 | `src/components/common/StudentMultiSelector.tsx` | Per-student Fee |
| 9 | `src/components/groups/detail/ProgressLevelDialog.tsx` | Price Override |
| 10 | `src/components/finance/UnpaidEnrollmentsFilters.tsx` | Min Balance filter |
| 11 | `src/components/enrollments/EnrollPanel.tsx` | Course Fee, Discount *(already has scroll prevention — verify and keep)* |

### Out of Scope

- Non-monetary number inputs (session counts, capacities, ranks, percentages) — lower impact, address separately if needed
- `<input type="text">` fields that accept money via formatting libraries (none found)
- Mobile virtual keyboard behavior — scroll wheel is a desktop/trackpad concern; mobile already requires explicit key entry
- Backend validation — this is purely a frontend UX fix

---

## User Stories

### US1 — Prevent Accidental Value Changes on Money Inputs (P1)

As a user entering a payment amount, fee, or salary, I want the mouse scroll wheel to NOT change the value while I am focused on the input, so that I don't accidentally commit a financial error.

**Acceptance**: All 14 unprotected money inputs (identified above) have scroll wheel changes disabled. The existing 2 protected inputs in `EnrollPanel.tsx` continue to work as before.

### US2 — Consistent Behavior Across the App (P2)

As a user, I want the same scroll-prevention behavior on every money input in the application, so I don't have to guess which inputs are protected.

**Acceptance**: Every `<input type="number">` associated with a monetary value applies the same scroll prevention technique. No money input is left unprotected.

### US3 — No Regression to Existing Inputs (P2)

As a developer, I want the fix to not interfere with normal input behavior — typing values, focusing/blurring, tab navigation, and form submission should all continue to work as before.

**Acceptance**: All existing money inputs remain usable. Keyboard entry, copy-paste, and form submission are unaffected. The scroll wheel only is suppressed while the input is focused.

---

## Functional Requirements

### FR1 — Scroll Prevention on Focused Number Inputs

When a user focuses a money-related `<input type="number">` and attempts to scroll (mouse wheel, trackpad), the value must not change. The page scroll should also be unaffected — the scroll event should pass through to the page.

### FR2 — Consistent Implementation

All in-scope money inputs must use the same scroll-prevention technique. No file should be missed. The existing `EnrollPanel.tsx` implementation may be used as reference but should be normalized to match the chosen approach.

### FR3 — Keep Existing Attribute Constraints

All existing `min`, `max`, `step`, and validation attributes on the targeted inputs must be preserved. The fix is additive only.

---

## Success Criteria

1. **100% coverage**: All 14 unprotected money inputs have scroll wheel changes disabled. Verified by inspecting each file.
2. **No financial errors from scrolling**: A user focused on any money input and scrolling does not change the value by even a single step increment.
3. **Zero regressions**: All existing money inputs continue to accept typed values, respond to onChange handlers, and submit correctly.
4. **Consistent technique**: The same approach is used in all 10+ files — no ad-hoc variations.

---

## Assumptions

- The `onWheel` → `blur()` pattern from `EnrollPanel.tsx` is an acceptable baseline approach
- An alternative `onWheel` → `preventDefault()` (allowing the input to keep focus) would be preferable if it works reliably across Chrome, Firefox, and Edge
- No reusable input component exists — the fix is applied individually per file (no refactoring into a shared component needed)
- The existing `ReceiptLineItemRow.tsx` inputs are part of a dynamic list and the fix must work for each row

---

## Dependencies

- No external libraries or packages needed — this is a DOM event handling change
- No backend changes required
- No design system changes required
