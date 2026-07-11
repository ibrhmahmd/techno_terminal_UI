# Specification: POS Arabic Translations, Responsive Grid & Theme Polish

---

## 1. Goal Description

Polish the Create Receipt flow based on final user requests:
1. **Arabic Translations**: Translate all warning messages, payment statuses (Paid/Unpaid), input validation status indicators, and helper texts to Arabic.
2. **Paid/Unpaid Terminology**: Ensure all references use "Paid" and "Unpaid" (in Arabic: `مدفوع` / `غير مدفوع`) instead of "Due" or other terminology.
3. **Card Borders & Halos**: Color the card borders and halos based on the payment status:
   * **Paid (Emerald)**: Emerald border and green shadow/bg.
   * **Unpaid (Rose)**: Rose border and red shadow/bg.
4. **Responsive Grid Layout**: Adjust grid classes dynamically based on the number of enrollment cards (e.g. if 1 card, set a max-width and prevent empty-column layout stretching).
5. **Light Mode POS Checkout Summary**: Convert the POS summary box in the sidebar from dark mode to a clean light mode layout.

---

## 2. Technical details

### 2.1 Arabic Translations Map
- **Warning Banner** (top of EnrollmentSelection):
  * Title: `تحذير: اشتراك مدفوع بالكامل`
  * Body: `المستوى المختار لـ {group_name} مدفوع بالكامل بالفعل (المتبقي 0.00 جنيه). تسجيل دفعة جديدة سيؤدي إلى دفع زائد. يرجى التأكيد مع ولي الأمر قبل المتابعة.`
- **Payment Status Badges**:
  * Unpaid: `غير مدفوع`
  * Paid: `مدفوع`
- **Remaining Balance Text**:
  * Unpaid: `{amount} ج.م متبقي`
  * Paid: `0.00 ج.م متبقي`
- **Sidebar Status & Helper Texts**:
  * Exceeds Balance: `يتجاوز الرصيد المتبقي ({balance} ج.م)`
  * Perfect Match: `تطابق كامل مع الرصيد المتبقي`
  * Partial Payment: `دفعة جزئية من الرصيد المتبقي`
  * Fallback Message: `اختر طالباً واشتراكاً من اليسار لإدخال قيمة الدفع.`

### 2.2 Payment-colored Card Borders (EnrollmentSelection)
- Card styling updates:
  * **Paid Card (Emerald)**:
    - Selected: `border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500 shadow-sm`
    - Not Selected: `border-emerald-150 bg-white hover:border-emerald-300 hover:shadow-sm opacity-80`
  * **Unpaid Card (Rose)**:
    - Selected: `border-rose-500 bg-rose-50/10 ring-1 ring-rose-500 shadow-sm`
    - Not Selected: `border-rose-200 bg-white hover:border-rose-350 hover:shadow-sm`

### 2.3 Responsive Enrollment Cards Grid
- Determine grid layout dynamically:
  ```tsx
  const gridClass = enrollments.length === 1
    ? "grid grid-cols-1 max-w-sm gap-3.5"
    : enrollments.length === 2
      ? "grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-3.5"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
  ```

### 2.4 Light Mode Checkout Summary
- Sidebar summary box background: `bg-slate-50 border border-slate-200 shadow-sm text-slate-800`.
- Text styles:
  * Headers: `text-slate-700`
  * Subtext / Mode: `text-slate-600`
  * Total Value: `text-slate-900`
  * Breakdown: `text-slate-650`

---

## 3. Files to Change

| File | Change |
|------|--------|
| `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` | MODIFY — Implement dynamic responsive grid sizing. Apply emerald/rose borders to cards based on Paid/Unpaid status. Translate warnings and badges to Arabic. |
| `src/components/finance/CreateReceiptPanel.tsx` | MODIFY — Translate sidebar warnings and fallback text to Arabic. Change POS Checkout Summary styles to light mode. |

---

## 4. Verification Plan

### Automated Verification
- Run `npm run build` to verify compilation.
- Run `npm run lint` to check styles.
