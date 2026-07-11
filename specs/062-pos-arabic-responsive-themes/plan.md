# Implementation Plan: POS Arabic Translations, Responsive Grid & Theme Polish

**Branch**: `062-pos-arabic-responsive-themes` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/062-pos-arabic-responsive-themes/spec.md)

---

## 1. Proposed Changes

### 1.1 Components

#### [MODIFY] [EnrollmentSelection.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceipt/EnrollmentSelection.tsx)
- Translate warning banner title and text to Arabic.
- Translate status badges to "مدفوع" and "غير مدفوع".
- Translate balance values under card to Arabic: `{remaining} ج.م متبقي` or `0.00 ج.م متبقي`.
- Compute `gridClass` based on `enrollments.length`:
  * `1` card -> `grid grid-cols-1 max-w-sm gap-3.5`
  * `2` cards -> `grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-3.5`
  * `3+` cards -> `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5`
- Redesign card borders/halos by payment status:
  - If Paid (`isZeroOrNegative`):
    - Selected: `border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500 shadow-sm`
    - Not Selected: `border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-sm opacity-80`
  - If Unpaid (`hasOutstanding`):
    - Selected: `border-rose-500 bg-rose-50/10 ring-1 ring-rose-500 shadow-sm`
    - Not Selected: `border-rose-200 bg-white hover:border-rose-350 hover:shadow-sm`

#### [MODIFY] [CreateReceiptPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceiptPanel.tsx)
- Translate sidebar warnings and helper texts to Arabic:
  - Exceeds: `يتجاوز الرصيد المتبقي ({balance} ج.م)`
  - Match: `تطابق كامل مع الرصيد المتبقي`
  - Partial: `دفعة جزئية من الرصيد المتبقي`
  - Fallback message: `اختر طالباً واشتراكاً من اليسار لإدخال قيمة الدفع.`
- Convert POS Checkout Summary box to light mode:
  - Container classes: `bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 text-slate-800`
  - Headers: `text-slate-500 border-slate-200/65`
  - Details: `text-slate-600` / values `text-slate-800`
  - Total: `text-slate-500` / values `text-slate-900 font-black`
  - Submit Button: Keep solid secondary themed but with standard text styles (without dark contrast clashes).

---

## 2. Verification Plan

### Automated Verification
* `npm run build`
* `npm run lint`
