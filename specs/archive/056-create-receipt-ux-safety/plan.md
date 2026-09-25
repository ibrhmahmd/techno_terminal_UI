# Implementation Plan: Create Receipt UX & Layout Optimization

**Branch**: `056-create-receipt-ux-safety` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/056-create-receipt-ux-safety/spec.md)
**Input**: Feature specification from `/specs/056-create-receipt-ux-safety/spec.md`

---

## Summary

This plan updates the Create Receipt workflow to optimize layout ordering, enlarge inputs, and present enrollment selections horizontally:
1. Transitions the layout from side-by-side Left/Right columns to a clean linear top-to-bottom workflow.
2. Lays out enrollment cards in a responsive horizontal grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
3. Enlarges the Amount and Discount fields with larger font sizes and increased height/padding.
4. Moves the Payment Method selector below the Amount/Discount fields, keeping optional details (Payer Name/Notes) at the very bottom.

---

## Technical Context

- **Language/Version**: TypeScript, React 18, Vite.
- **Styling**: Tailwind CSS v3.
- **Testing**: Vitest (happy-dom setup).

---

## Constitution Check

- **Principle I: Frontend-Only Scope**: PASS. Changes are entirely restricted to frontend React UI files.
- **Principle II: Server State Discipline**: PASS. All states managed locally. No additional API requests.
- **Principle III: Typed Contracts**: PASS. Exposing standard Typescript types without `any`.

---

## Proposed Changes

### 1. `EnrollmentSelection.tsx` — Grid Layout Updates

#### [MODIFY] [EnrollmentSelection.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/EnrollmentSelection.tsx)
- Remove `lg:col-span-2` wrapper properties. Let the container occupy the full horizontal width of the line item step.
- Update the layout grid class:
  ```tsx
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
  ```

---

### 2. `ReceiptLineItemRow.tsx` — Linear Layout & Enlarged Inputs

#### [MODIFY] [ReceiptLineItemRow.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx)
- Remove Left/Right columns wrapper `flex flex-col md:flex-row gap-3`. Let elements stack vertically: StudentCombobox → EnrollmentSelection → Payment Inputs.
- Enlarge Amount and Discount input fields:
  - Add `py-3 px-4 text-lg font-bold shadow-sm` class styling.
  - Enlarge the label text.
  - Keep real-time overpayment alert and warnings.

---

### 3. `CreateReceiptPanel.tsx` — Reorder Form Fields

#### [MODIFY] [CreateReceiptPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceiptPanel.tsx)
- Reorder form components:
  1. Student Selection, Enrollment selection, Amount/Discount inputs (Line Items).
  2. Payment Method selector.
  3. Payer Name & Notes (moved below Payment Method).
  4. Actions & confirmation modal.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify strict TypeScript compilation.
- Run `npm run lint` to verify ESLint cleanliness.

### Manual Verification
1. Navigate to Create Receipt tab.
2. Verify linear top-to-bottom layout: StudentCombobox → Enrollment Grid → Large Amount/Discount Inputs.
3. Verify cards are side-by-side horizontally.
4. Verify inputs are visibly larger and taller.
5. Verify Payment Method is located below Amount.
6. Verify Payer Name and Notes are at the bottom.
