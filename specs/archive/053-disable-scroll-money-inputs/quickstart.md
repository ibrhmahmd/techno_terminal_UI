# Quickstart: Disable Scroll Wheel on Money Inputs

## Implementation

Add the following `onWheel` handler to each money-related `<input type="number">`:

```tsx
onWheel={(e) => (e.target as HTMLInputElement).blur()}
```

Place it immediately after the `onChange` or `value` attribute on each input element.

## File-by-File Changes

### 1. `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx`
- **Line 86-92**: Add `onWheel` to Amount input
- **Line 97-103**: Add `onWheel` to Discount input

### 2. `src/components/enrollments/ModifyEnrollmentPanel.tsx`
- **Line 232-241**: Add `onWheel` to Amount Due input
- **Line 249-257**: Add `onWheel` to Discount Applied input

### 3. `src/components/enrollments/EditEnrollmentModal.tsx`
- **Line 85-94**: Add `onWheel` to Amount Due input
- **Line 102-109**: Add `onWheel` to Discount Applied input

### 4. `src/pages/TeamDetailPage.tsx`
- **Line 749-758**: Add `onWheel` to Payment Amount input
- **Line 825-835**: Add `onWheel` to Refund Amount input

### 5. `src/components/staff/EmployeeForm/WorkSettingsSection.tsx`
- **Line 64-71**: Add `onWheel` to Monthly Salary input

### 6. `src/components/courses/CourseForm.tsx`
- **Line 163-173**: Add `onWheel` to Price Per Level input

### 7. `src/components/competitions/CompetitionForm.tsx`
- **Line 153-162**: Add `onWheel` to Fee per Student input

### 8. `src/components/common/StudentMultiSelector.tsx`
- **Line 157-165**: Add `onWheel` to Per-student Fee input

### 9. `src/components/groups/detail/ProgressLevelDialog.tsx`
- **Line 239-248**: Add `onWheel` to Price Override input

### 10. `src/components/finance/UnpaidEnrollmentsFilters.tsx`
- **Line 52-61**: Add `onWheel` to Min Balance filter input

### 11. `src/components/enrollments/EnrollPanel.tsx`
- **Lines 230, 249**: Already protected — verify `onWheel` handler is present. No change needed.

## Verification

1. `npm run build` — must pass zero errors
2. `npm run lint` — must pass zero warnings
3. Manual testing per input: focus the input, scroll up/down with mouse wheel — value must not change, and input should lose focus (cursor disappears)

## Total Changes

- **14 inputs** modified (add 1 line each)
- **1 file** verified but unchanged
- **0 new files**, **0 new dependencies**, **0 backend changes**
