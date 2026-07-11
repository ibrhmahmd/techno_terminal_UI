# Specification: POS Sidebar Refactor & Color Polish

---

## 1. Goal Description

Polish the Create Receipt flow based on user feedback:
1. **Sidebar Checkout Details**: Move the Amount input, Discount input, Suggestion cards, and Overpayment warning to the right sidebar (Checkout Sidebar). These inputs will dynamically edit the currently focused/active student on the left.
2. **Horizontal Grid Split**: Widen the left section to `lg:col-span-3` and make the right sidebar thinner `lg:col-span-1` using a `grid grid-cols-1 lg:grid-cols-4` layout.
3. **Color Theme Alignment**:
   * **Paid Badge**: Solid green (`bg-emerald-600 text-white border-emerald-500`).
   * **Unpaid/Due Badge**: Solid red (`bg-rose-600 text-white border-rose-500`).
   * **Warning Banner**: Solid red borders and red texts/icons (`bg-rose-50 border-rose-500 text-rose-900`).
4. **Remove selected student label**: Do not render the "Select Student *" label if a student has already been selected, saving vertical space.
5. **Fully Display Group Names**: Remove the `truncate` class from group names in enrollment cards.

---

## 2. Technical details

### 2.1 Focusable Student Cards (Left Column)
- We add `activeLineItemId` state to `CreateReceiptPanel.tsx`.
- The cashier clicks a student card on the left to set `activeLineItemId = item.id`.
- The active card displays a colored border (`border-secondary bg-secondary/5`) and a badge indicating it's active.

### 2.2 Dynamic Checkout Sidebar (Right Column)
- Finds `activeItem = lineItems.find(item => item.id === activeLineItemId)`.
- Renders:
  * **Amount to Pay** input for `activeItem`.
  * **Discount** input for `activeItem`.
  * **Suggestions Preset Cards** for `activeItem`'s selected enrollment.
  * **Real-time border styles** and **match status text** on the Amount input.
  * **Payment Method Selector** (horizontal layout).
  * **Checkout Summary** and **Create Receipt** button.

---

## 3. Files to Change

| File | Change |
|------|--------|
| `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` | MODIFY — Update warning banner styles to red/rose; update Paid badge to solid green, Unpaid to solid red, and remove `truncate` from the group name. |
| `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | MODIFY — Remove Amount input, Discount input, suggestions, and warnings. Hide "Select Student *" label if selected. Add active card style and `onClick` focus handler. |
| `src/components/finance/CreateReceiptPanel.tsx` | MODIFY — Introduce `activeLineItemId` state. Update main JSX layout to 4-column POS split. Render Amount, Discount, suggestions, and overpayment warnings in the right checkout sidebar for the active item. |

---

## 4. Verification Plan

### Automated Verification
- Run `npm run build` to verify compilation.
- Run `npm run lint` to verify ESLint compliance.
