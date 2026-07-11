# Implementation Plan: Payment Amount Suggestions

**Branch**: `058-payment-amount-suggestions` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/058-payment-amount-suggestions/spec.md)

---

## 1. Summary

This plan implements clickable suggestion chips below the payment amount input field:
* Primary Dynamic Chip: `Remaining (X EGP)` to instantly pay the exact remaining balance.
* Preset Chips: `[150, 500, 550, 600, 650, 700]` filtered to exclude values $\ge$ remaining balance.

---

## 2. Proposed Changes

### 2.1 Component Updates

#### [MODIFY] [ReceiptLineItemRow.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx)

- Define presets array: `const PRESETS = [150, 500, 550, 600, 650, 700]`.
- Below the amount input container, add a flex wrapper rendering the suggestion chips:
  ```tsx
  {item.selectedEnrollment && (
    <div className="mt-2 flex flex-wrap gap-2 items-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggestions:</span>
      {/* Remaining Balance Chip */}
      {item.selectedEnrollment.remaining_balance > 0 && (
        <button
          type="button"
          onClick={() => onUpdate({ amount: item.selectedEnrollment!.remaining_balance })}
          className="text-xs px-2.5 py-1 rounded-full border border-secondary bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors font-medium"
        >
          Remaining ({item.selectedEnrollment.remaining_balance.toFixed(0)} EGP)
        </button>
      )}
      {/* Presets */}
      {PRESETS.filter(p => p < item.selectedEnrollment!.remaining_balance).map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onUpdate({ amount: p })}
          className="text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  )}
  ```

---

## 3. Verification Plan

### Automated Verification
* `npm run build`
* `npm run lint`
