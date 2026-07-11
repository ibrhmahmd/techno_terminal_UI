# Implementation Plan: POS Layout Revamp & Info Richness

**Branch**: `059-pos-layout-student-details-revamp` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/059-pos-layout-student-details-revamp/spec.md)

---

## 1. Summary

This plan updates the receipt creation page to use a POS two-column layout, enriches student combobox and enrollment selection metadata, styles levels as circles, and enlarges suggestions.

---

## 2. Proposed Changes

### 2.1 Hook Updates

#### [MODIFY] [useStudentEnrollments.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/hooks/finance/useStudentEnrollments.ts)
- Add `status: string` and `enrolled_at: string` to `StudentEnrollmentInfo` interface.
- In `mapEnrollments`, set:
  ```typescript
  status: e.status,
  enrolled_at: e.enrolled_at,
  ```

---

### 2.2 Component Updates

#### [MODIFY] [StudentCombobox.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/student/StudentCombobox.tsx)
- In the `value` selected block, render:
  - `#ID: {value.id}`
  - `Grade: {value.grade}` (if present)
  - `Group: {value.current_group_name}` (if present)
  - `DOB: {formatDate(value.date_of_birth)}` (if present)

#### [MODIFY] [EnrollmentSelection.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/EnrollmentSelection.tsx)
- Redesign the button contents inside `.map((enrollment) => { ... })`:
  - Flex container with left-circle and right-text.
  - Left-circle: large colored circle `L1`, `L2` with level colors.
  - Right-text: Group/Course name, joined date, status pill, and notes warning at bottom.

#### [MODIFY] [PaymentMethodPills.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/PaymentMethodPills.tsx)
- Add `layout?: 'horizontal' | 'vertical'` to `PaymentMethodPillsProps`.
- Support vertical stacked buttons styling.

#### [MODIFY] [ReceiptLineItemRow.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx)
- Enlarge preset and dynamic suggestion button classes (`px-3.5 py-2 text-sm font-bold shadow-sm hover:shadow active:scale-95`).

#### [MODIFY] [CreateReceiptPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceiptPanel.tsx)
- Rearrange wrapper JSX to use `grid grid-cols-1 lg:grid-cols-3 gap-6 items-start`.
- Move `PaymentMethodPills` and `Total & Actions` into the right sidebar column.
- Render `PaymentMethodPills` with `layout="vertical"`.

---

## 3. Verification Plan

### Automated Verification
* `npm run build`
* `npm run lint`
