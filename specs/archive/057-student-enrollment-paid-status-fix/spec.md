# Specification: Student Enrollment Paid Status & Balance Alignment

---

## 1. Problem Description

When a student has unpaid enrollments (i.e. they owe money/debt), the Create Receipt page in the Finance section erroneously lists all their enrollments as **Paid**. 
However, the Group Details page and Attendance Grid correctly display the status as **Not Paid / Due**.

---

## 2. Root Cause Analysis

### 2.1 Backend Data Misalignment
The API endpoint `GET /api/v1/enrollments/student/{student_id}` returns a list of enrollments. For each enrollment, the backend `EnrollmentDirectoryService` maps the outstanding amount:
```python
dto.amount_remaining = float(balance_info.balance)
```
Where `balance_info.balance` is retrieved from the PostgreSQL view `v_enrollment_balance`.
Following a Sprint 6 balance semantic inversion (migration `007_p6_enrollment_balance`), the view defines `balance` as:
$$\text{balance} = \text{total\_paid} - \text{net\_due}$$
- **Negative** = debt (unpaid/student owes money).
- **Zero** = settled (paid).
- **Positive** = credit (overpayment).

Because of this, for an unpaid enrollment of 700 EGP, `balance` is `-700.00`.
The backend directly sets `dto.amount_remaining = -700.0`, transmitting a negative number to the client.

### 2.2 Frontend Condition Evaluation
In the frontend, `remaining_balance` is evaluated:
```tsx
const isZeroOrNegative = enrollment.remaining_balance <= 0
```
Since `-700.0 <= 0` evaluates to `true`, the UI mistakenly flags the enrollment as **Paid**.
Furthermore, the UI hardcodes `amount_paid: 0` in the mapping function `mapEnrollments`, meaning that the cashier is presented with confusing fee breakdowns such as:
`Total: 700.00 EGP` | `Already Paid: 0.00 EGP` | `Remaining: 0.00 EGP` (which is inconsistent).

---

## 3. Proposed Fix

### 3.1 Backend Adjustment
Modify the mapping in `app/modules/enrollments/directory/service.py` to correctly calculate `amount_remaining` as the positive outstanding debt:
```python
dto.amount_remaining = max(0.0, -float(balance_info.balance))
```
- For debt (e.g. `balance = -700.0`), `amount_remaining = max(0.0, -(-700.0)) = 700.0` (positive).
- For paid or credit (e.g. `balance = 0.0` or `balance = +100.0`), `amount_remaining = 0.0`.

### 3.2 Frontend Adjustment
Modify the mapper `mapEnrollments` in `src/hooks/finance/useStudentEnrollments.ts` to compute the paid portion dynamically:
```tsx
amount_paid: (() => {
  const netDue = (e.amount_due || 0) - e.discount_applied
  const remaining = e.amount_remaining !== undefined ? e.amount_remaining : netDue
  return Math.max(0, netDue - remaining)
})()
```

---

## 4. Verification Plan

- Run unit tests in backend: `pytest tests/test_enrollments.py -v`.
- Build and lint frontend workspace: `npm run build && npm run lint`.
- Manually inspect student selection details in Finance page.
