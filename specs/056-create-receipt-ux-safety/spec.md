# Spec: Create Receipt UX & Safety Overhaul

**Spec ID**: 056
**Date**: 2026-07-11
**Status**: Draft
**Author**: Product (via /grill-me interview)

---

## 1. Problem Statement

The Create Receipt form allows cashiers to make accidental payments through a combination of UX weaknesses:

1. **Level ambiguity**: A student can have Level 1 and Level 2 enrollments for the same group. The current enrollment card shows the level number as a tiny, low-contrast `bg-slate-100` pill that is easy to overlook, leading to cashiers selecting the wrong level.
2. **No payment confirmation**: Clicking "Create Receipt" immediately submits the payment with no opportunity to review or cancel.
3. **Late overpayment detection**: The overpayment check is a manual "Check Risk" button click — easily skipped.
4. **Unnecessary payment type picker**: The `PaymentMethodPills` "Payment Type" selector (Course Level / Competition / Other) adds a decision point that is always `course_level` for this form, creating noise and potential misconfiguration.
5. **Missing fee breakdown**: The amount field is auto-filled with the remaining balance, but the cashier cannot verify where that number comes from without navigating away.
6. **Settled enrollment selectability**: Fully-paid enrollments are clickable with only slight visual greying — a misclick results in duplicate payment risk.
7. **Optional fields (Payer Name, Notes) are at the top**: These draw attention away from the critical path (student → enrollment → amount → method).

---

## 2. User Story

> As a cashier creating a receipt, I want the form to guide me through the critical fields with clear visual hierarchy, warn me immediately when I'm about to make an incorrect payment, and require me to review a summary before any money is recorded — so that human errors and accidental payments are prevented at the point of entry.

---

## 3. Acceptance Criteria

| # | Criteria |
|---|----------|
| AC-1 | The "Payment Type" pills (Course Level / Competition / Other) are removed from the line item row. `payment_type` is silently hardcoded to `'course_level'` on every submission. |
| AC-2 | Each enrollment card displays a prominent level badge as the primary visual anchor — large, colored (e.g., Level 1 → blue, Level 2 → violet, Level 3 → emerald) — not a small grey pill. |
| AC-3 | Selecting a fully-paid (settled) enrollment shows an inline amber warning on the selected card: "⚠️ This enrollment is already fully paid." The card remains selectable. |
| AC-4 | When an enrollment is selected, a fee breakdown row is shown below/within the card: Total Fee / Already Paid / Remaining — so the cashier understands how the auto-filled amount was derived. |
| AC-5 | The amount input field shows a real-time amber border + inline message when the entered value exceeds `selectedEnrollment.remaining_balance`. No API call required — pure frontend comparison. |
| AC-6 | The "Check Risk" button is removed entirely. |
| AC-7 | Clicking "Create Receipt" opens a confirmation modal showing: Student name, Group, Level, Amount, Payment Method. Submission only proceeds after the cashier clicks "Confirm & Create" inside the modal. |
| AC-8 | Payer Name and Notes fields are moved to the bottom of the form (below the line items section). |
| AC-9 | The confirmation modal correctly lists all line items when the receipt contains multiple students. |
| AC-10 | The form field layout is a single linear top-to-bottom flow: Student Selection → Enrollment Grid (Horizontal layout) → Large Amount/Discount Inputs → Payment Method Selector → Payer/Notes. |

---

## 4. Data Flow Analysis

No new API calls are introduced. All changes are purely UI/UX:

- `EnrollmentSelection.tsx` reads `enrollment.amount_due`, `enrollment.amount_paid`, and `enrollment.remaining_balance` — all already present on `StudentEnrollmentInfo`.
- The overpayment check compares the typed `amount` to `selectedEnrollment.remaining_balance` in real-time inside `ReceiptLineItemRow`.
- The confirmation modal reads from the `lineItems` state already held in `CreateReceiptPanel`.

---

## 5. UI Specification

### 5.1 Linear Layout Flow

The receipt creation card uses a single vertical stack:
1. **Step 1: Student Combobox** (Full-width search bar).
2. **Step 2: Enrollment Selection** (Horizontal card grid using `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5`).
3. **Step 3: Payment Details** (Amount and Discount placed side-by-side, enlarged with `text-lg font-semibold py-3 px-4`).
4. **Step 4: Payment Method** (Pills selector).
5. **Step 5: Optional Details** (Payer Name & Notes).

### 5.2 Enrollment Card — Level Badge

Each enrollment card gets a full-width colored band at the top (or a large badge in the top-left corner):

```
┌──────────────────────────────────────────────────┐
│  🔵 Level 2                                      │ ← colored band
│  EV3 Monday Group  (Robotics)                    │
│  Instructor: Mariam Tawfik                       │
│  ────────────────────────────────────────────── │
│  Total: 1,200 EGP  │  Paid: 700 EGP  │  Due: 500 EGP │
└──────────────────────────────────────────────────┘
```

Level color map: 1 → blue, 2 → violet, 3 → emerald, 4 → amber, 5+ → slate.

### 5.3 Amount Field — Real-time Warning

When `amount > remaining_balance` and enrollment is selected:
- Input border becomes `ring-amber-400`
- Inline text below: `⚠️ Amount exceeds the remaining balance of X EGP`

### 5.4 Confirmation Modal

```
┌─────────────────────────────────────┐
│  Confirm Payment                    │
│                                     │
│  Student:  Ahmed Ali                │
│  Group:    EV3 Monday Group         │
│  Level:    Level 2                  │
│  Amount:   500.00 EGP               │
│  Method:   Cash                     │
│                                     │
│  [Cancel]        [Confirm & Create] │
└─────────────────────────────────────┘
```

---

## 6. Files to Change

| File | Change |
|------|--------|
| `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` | MODIFY — level badge redesign, fee breakdown row, paid-enrollment warning, grid cols to horizontal |
| `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | MODIFY — remove columns, stack vertically in linear steps, enlarge amount/discount inputs |
| `src/components/finance/CreateReceiptPanel.tsx` | MODIFY — remove Check Risk button/logic, add confirmation modal, reorder Payer Name + Notes to bottom, place Payment Method after line items |

---

## 7. Out of Scope

- No backend changes
- No changes to the `TodayReceiptsList` or `UnpaidEnrollmentsPanel`
- No changes to multi-line-item limit (still supported but not encouraged)
- No mobile-specific layout overrides (responsive layout inherits from existing flex/grid)

---

## 8. Constitution Check

| Principle | Status |
|-----------|--------|
| I. Frontend-Only Scope | PASS — All changes in `src/`. Zero backend code touched. |
| II. Server State Discipline | PASS — No new API calls. `previewRisk` call removed (simplification). |
| III. Global State Minimalism | PASS — Confirmation modal state is local `useState` in `CreateReceiptPanel`. |
| IV. TypeScript Strict Mode | PASS — `payment_type` field kept in `ReceiptLineItem` type (set to `'course_level'` silently); no `any` introduced. |
| V. Component Naming Convention | PASS — New modal is inline JSX in `CreateReceiptPanel`, not a separate file (too simple to warrant one). If it grows, extract to `ConfirmReceiptModal.tsx` in `components/finance/`. |

---

## 9. Resolved Open Items

1. **Level Color Constants**: The level color mappings will be defined as a local map inside `EnrollmentSelection.tsx` for simplicity and encapsulation, but designed in a way that is easy to export in the future if other views need it.
2. **Confirmation Modal Placement**: The confirmation modal will be kept inline in `CreateReceiptPanel.tsx` using a small helper component or clean conditional rendering to avoid adding unnecessary separate files.
