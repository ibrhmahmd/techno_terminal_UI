# Walkthrough: Payment Amount Suggestions

**Branch**: `058-payment-amount-suggestions` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/058-payment-amount-suggestions/spec.md)

---

## Technical Details Implemented

### 1. Preset Values Array ([ReceiptLineItemRow.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx))
- Defined the constant array `PRESETS = [150, 500, 550, 600, 650, 700]` matching the school's most common payment tiers.

### 2. Suggestion Row Layout & Logic
Added a flex-wrap container below the **Amount to Pay** input. When an enrollment is selected, it renders the following suggestion options:
- **Dynamic Chip**: If `remaining_balance > 0`, renders `Remaining (X EGP)`. Clicking this button auto-fills the input field with the exact remaining balance of the level.
- **Filtered Presets**: Renders preset chips, filtered to only include values strictly less than the enrollment's remaining balance (`p < remaining_balance`). This ensures a cashier cannot accidentally click a preset that would result in an overpayment.
- **Actions**: Clicking any chip immediately updates the amount field, which naturally triggers the real-time overpayment alert or visual highlights if a user types or alters details subsequently.

---

## Verification & Build Checks
- **Frontend Build**: `npm run build` completed successfully without any compilation errors.
- **ESLint Linting**: `npx eslint` verified cleanliness with zero style or warning violations.
