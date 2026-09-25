# Specification: POS UI Polish & Payment State Indicators

---

## 1. Goal Description

Implement further POS enhancements based on user feedback:
1. **Horizontal Payment Methods**: Display the payment method pills horizontally inside the same right sidebar location to save vertical space.
2. **Prominent Payment Status**: Highlight the Payment Status (DUE / PAID) in the top-right corner of the enrollment selection cards. Move the Enrollment Status (Active/Completed) to the details metadata row.
3. **Wider Layout**: Expand the max-width container on the Finance page from `max-w-[1400px]` to `max-w-[1700px]` to make better use of available screen space.
4. **Section Warning Banner**: Position any overpayment/fully-paid warnings directly above the enrollment cards grid rather than under individual cards.
5. **Interactive Amount Border States**: Color the Amount to Pay input border dynamically in real-time:
   * **Green**: Perfect match of the remaining balance.
   * **Orange**: Partial payment (less than remaining balance).
   * **Red/Amber**: Overpayment (greater than remaining balance).
   * **Default/Slate**: Empty or zero.

---

## 2. UI Specifications

### 2.1 Enrollment Selection Warnings (EnrollmentSelection)
Warnings are now placed as a full-width banner above the grid:
```
[Select Enrollment *]
⚠️ Warning: Fully Paid Enrollment Selected
The selected level for Group X has a remaining balance of 0.00 EGP. 
Making a payment on this enrollment will result in an overpayment credit.

[ Card 1 ]   [ Card 2 ]   [ Card 3 ]
```

### 2.2 Enrollment Card Header Layout (EnrollmentSelection)
```
+------------------------------------------------------+
|  ( L1 )  Group Name                       [ DUE ]    |
|          Course: course                              |
|          Instructor: name • Joined: date • Active    |
|  --------------------------------------------------  |
|  [o] Selected                      Due: 700.00 EGP   |
+------------------------------------------------------+
```

### 2.3 Interactive Amount Input Borders (ReceiptLineItemRow)
- **Green border**: `border-emerald-500 focus:ring-emerald-500/20 text-emerald-700 bg-emerald-50/5`
- **Orange border**: `border-amber-400 focus:ring-amber-500/20 text-amber-700 bg-amber-50/5`
- **Red border**: `border-rose-500 focus:ring-rose-500/20 text-rose-700 bg-rose-50/5`

---

## 3. Files to Change

| File | Change |
|------|--------|
| `src/pages/FinancePage.tsx` | MODIFY — Increase max-width to `max-w-[1700px]` in container divs. |
| `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` | MODIFY — Move warnings above the card grid; redesign card header to render Payment Status Badge in top-right and Enrollment status in details meta-row. |
| `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | MODIFY — Apply dynamic border colors (Green/Orange/Red) to the Amount input field based on payment state. |
| `src/components/finance/CreateReceiptPanel.tsx` | MODIFY — Change `PaymentMethodPills` layout to horizontal. |

---

## 4. Verification Plan

### Automated Verification
- Run `npm run build`.
- Run `npm run lint`.
