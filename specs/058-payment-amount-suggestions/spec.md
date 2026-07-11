# Specification: Payment Amount Suggestions

---

## 1. Goal Description

To speed up receipt creation and minimize cashier keying errors, we want to add clickable suggestion chips (shortcuts) directly below the **Amount to Pay** input field.

---

## 2. Suggestion Chip Semantics

### 2.1 Dynamic Chip
If the selected enrollment has a positive remaining balance (`remaining_balance > 0`), we display a primary suggestion chip representing the exact outstanding balance:
* **Label**: `Remaining (X EGP)`
* **Action**: Sets the amount input value to `X`.
* **Visual Styling**: High contrast (e.g., solid secondary background or colored border) to indicate it is the recommended dynamic match.

### 2.2 Static Presets
We define a list of common tuition payments: `[150, 500, 550, 600, 650, 700]`.
To prevent cashiers from accidentally selecting an overpayment amount:
* We filter out any presets that are **greater than or equal to** the dynamic `remaining_balance`.
* **Action**: Clicking a preset chip sets the amount input value to that preset.
* **Visual Styling**: Sleek outline badge design (`bg-slate-100 hover:bg-slate-200 text-slate-700`).

---

## 3. UI Specification

Under the **Amount to Pay** input field:

```
Amount to Pay (EGP) *
[  700.00                   ] EGP

Suggestions:
[ Remaining (700 EGP) ]   [ 150 ]   [ 500 ]   [ 550 ]   [ 600 ]   [ 650 ]
```

---

## 4. Files to Change

| File | Change |
|------|--------|
| `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | MODIFY — Add suggestion chips section under the Amount input field, filter preset list based on `remaining_balance`, and update field value on click. |

---

## 5. Verification Plan

### Automated Verification
* Compile project using `npm run build`.
* Run ESLint checks using `npm run lint`.

### Manual Verification
* Navigate to the Create Receipt tab.
* Select a student and an enrollment (e.g., remaining balance of `700 EGP`).
* Verify that suggestion chips `Remaining (700 EGP)`, `150`, `500`, `550`, `600`, `650` are displayed below the input.
* Click `550` and verify the input changes to `550`.
* Select an enrollment with remaining balance `500 EGP`.
* Verify that only `Remaining (500 EGP)` and `150` are shown (preventing overpayment options).
