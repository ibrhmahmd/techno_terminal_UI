# Daily Reports API — Client Contract

**Base URL**: `/api/v1/notifications/reports/daily`
**Auth**: `Bearer <jwt>` — requires `admin` or `system_admin` role

## GET /notifications/reports/daily/data

Fetch report data as JSON.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `target_date` | `string` (YYYY-MM-DD) | today | The report date |

### Response 200

```json
{
  "success": true,
  "data": {
    "date": "2026-05-20",
    "total_revenue": 0.0,
    "new_enrollments": 4,
    "sessions_held": 1,
    "present_count": 4,
    "absent_count": 3,
    "attendance_rate": 0.571,
    "payment_count": 0,
    "payment_methods": {},
    "payment_details": [],
    "instructors_list": ["ibrahim el-marya"],
    "session_details": [
      {
        "instructor_name": "ibrahim el-marya",
        "session_time": "18:00 - 20:00",
        "present_count": 4,
        "absent_count": 3,
        "cancelled_count": 0,
        "student_names_present": "asiaa amr shereif, ibrahim ahmed abo elenin, karma mahmoud mahdy, Karma mahmoud mahdy Kandeel",
        "student_names_absent": "Aseyah amr sherif, Sereen Ahmad AlGanzory, Sila Ahmad AlGanzory"
      }
    ],
    "payments_by_type": [],
    "instructor_summary": [
      {
        "instructor_name": "ibrahim el-marya",
        "session_count": 1
      }
    ]
  },
  "message": null
}
```

### Error 404

```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "No data found for 2026-05-21"
}
```

---

## POST /notifications/reports/daily

Two modes depending on request body.

### Mode A — Get PDF (no body)

```
POST /notifications/reports/daily?target_date=2026-05-20
Content-Type: application/json
(no body)
```

#### Response 200

```json
{
  "success": true,
  "data": {
    "date": "2026-05-20",
    "pdf_base64": "JVBERi0xLjQK..."
  },
  "message": null
}
```

### Mode B — Email to recipients

```
POST /notifications/reports/daily?target_date=2026-05-20
Content-Type: application/json

{
  "email_recipients": ["admin@example.com", "manager@example.com"]
}
```

#### Response 200

```json
{
  "success": true,
  "data": "Daily report queued for 2 recipient(s)",
  "message": null
}
```

#### Error 422

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid email format"
}
```

---

## Error Reference

| Status | Error Type | Cause |
|--------|-----------|-------|
| 401 | Unauthorized | Missing/invalid JWT |
| 404 | NotFoundError | No data for the requested date |
| 422 | ValidationError | Invalid email format in email_recipients |
