# Enrich Receipts API — Backend Request

## Goal

Return student name, group name, and course name alongside each receipt/line item so the frontend can display them without N+1 queries.

---

## 1. `GET /finance/reports/daily-receipts`

Add a `students` array to each item in the response.

### Current response item

```json
{
  "receipt_id": 1,
  "receipt_number": "TR-20260301-001",
  "payer_name": "Ibrahim A.",
  "total_amount": 2400,
  "payment_method": "cash",
  "issued_at": "2026-03-01T10:30:00Z"
}
```

### Desired response item

```json
{
  "receipt_id": 1,
  "receipt_number": "TR-20260301-001",
  "payer_name": "Ibrahim A.",
  "total_amount": 2400,
  "payment_method": "cash",
  "issued_at": "2026-03-01T10:30:00Z",
  "students": [
    {
      "id": 42,
      "name": "Ahmed Said",
      "group_name": "Group A7",
      "course_name": "Mathematics",
      "payment_type": "course_level",
      "amount": 1500
    },
    {
      "id": 57,
      "name": "Mariam Khaled",
      "group_name": "Group B2",
      "course_name": "Science",
      "payment_type": "course_level",
      "amount": 900
    }
  ]
}
```

> `students` is derived from the receipt's line items. The receipt has `lines[].student_id` and `lines[].enrollment_id` — join through enrolments → groups → courses to resolve names.

---

## 2. `GET /finance/receipts/{id}`

Add name fields to each line item.

### Current line item

```json
{
  "id": 1,
  "student_id": 42,
  "enrollment_id": 15,
  "amount": 1500,
  "transaction_type": "charge",
  "payment_type": "course_level",
  "discount": 0
}
```

### Desired line item

```json
{
  "id": 1,
  "student_id": 42,
  "student_name": "Ahmed Said",
  "enrollment_id": 15,
  "group_name": "Group A7",
  "group_id": 9,
  "course_name": "Mathematics",
  "course_id": 3,
  "payment_type": "course_level",
  "amount": 1500,
  "transaction_type": "charge",
  "discount": 0
}
```

> For competition payment types (`payment_type: "competition"`), `group_name`/`course_name` won't apply; `team_member_id` is the join key instead. Acceptable to leave those null for competition lines.

---

## Data sources (for reference)

| Field | Join path |
|---|---|
| `student_name` | `lines.student_id` → `students.name` |
| `group_name` | `lines.enrollment_id` → `enrollments.group_id` → `groups.name` |
| `course_name` | `enrollments.group_id` → `groups.course_id` → `courses.name` |

---

## Edge cases

- **Refunds/credits** (`transaction_type: "refund"` or `"credit"`): still have `student_id` — resolve names the same way. The student is the one who received the refund.
- **Competition payments** (`payment_type: "competition"`): student name should resolve from `lines.student_id`. Group/course may be null — frontend will show "Competition" instead.
- **Deleted students**: if a student was deleted, return `student_name: "Deleted Student"` rather than failing the request.
