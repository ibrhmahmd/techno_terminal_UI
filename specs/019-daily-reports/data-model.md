# Data Model: Daily Reports

**Phase**: 1 — Design & Contracts | **Date**: 2026-05-21

## Entities

### DailyReportData

The full JSON report payload returned by `GET /notifications/reports/daily/data`.

```typescript
interface DailyReportData {
  date: string                          // ISO date "2026-05-20"
  total_revenue: number                 // Net revenue (payments - refunds)
  new_enrollments: number               // Enrollments created on this date
  sessions_held: number                 // Completed sessions
  present_count: number                 // Attendance marked present
  absent_count: number                  // Attendance marked absent
  attendance_rate: number               // present / (present + absent)
  payment_count: number                 // Number of payments
  payment_methods: Record<string, number> // {"cash": 3, "card": 2}
  payment_details: PaymentDetail[]
  instructors_list: string[]            // Unique instructor names
  session_details: SessionDetail[]
  payments_by_type: PaymentsByTypeItem[]
  instructor_summary: InstructorSummaryItem[]
}
```

### PaymentDetail

```typescript
interface PaymentDetail {
  student_name: string
  group_name: string
  amount: number
  payment_type: string
}
```

### SessionDetail

```typescript
interface SessionDetail {
  instructor_name: string
  session_time: string                    // "18:00 - 20:00"
  present_count: number
  absent_count: number
  cancelled_count: number
  student_names_present: string           // comma-separated
  student_names_absent: string            // comma-separated
}
```

### PaymentsByTypeItem

```typescript
interface PaymentsByTypeItem {
  payment_type: string                    // "cash", "card", "course_level"
  subtotal: number
  count: number
  items: PaymentDetail[]
}
```

### InstructorSummaryItem

```typescript
interface InstructorSummaryItem {
  instructor_name: string
  session_count: number
}
```

### DailyReportPdf

Response from `POST /notifications/reports/daily` (no body).

```typescript
interface DailyReportPdf {
  date: string
  pdf_base64: string
}
```

### EmailSendPayload

Request body for `POST /notifications/reports/daily` with recipients.

```typescript
interface EmailSendPayload {
  email_recipients: string[]
}
```

### EmailSendResponse

Response from email-send mode.

```typescript
interface EmailSendResponse {
  success: boolean
  data: string                            // "Daily report queued for 2 recipient(s)"
  message: string | null
}
```

## API Response Envelopes

### Single Resource (reused from `src/types/api.ts`)

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}
```

### Error

```typescript
interface ApiError {
  success: false
  error: string   // "NotFoundError", "ValidationError", "Unauthorized"
  message: string
}
```

## Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `target_date` | `string` (ISO: `YYYY-MM-DD`) | today | The report date |

## Validation Rules

| Rule | Applies To | Condition |
|------|-----------|-----------|
| Date must be past or today | Date selection | `date <= today` |
| Valid email format | Email send | Each recipient matches email regex |
| Non-empty recipients | Email send | `email_recipients.length >= 1` |
| Max 100 recipients | Email send | `email_recipients.length <= 100` |
