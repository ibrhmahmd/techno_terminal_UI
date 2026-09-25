# API Contract Changes: Group Detail Page Fixes

**Spec**: `033-group-detail-backend-fixes` | **Date**: 2026-06-03

## Affected Endpoints

### 1. `GET /academics/groups/{group_id}/levels/detailed` (BUG-1)

**Current behavior**: Returns only the active level when no `level_number` query param is provided.

**Fixed behavior**: Returns ALL levels (active, completed, cancelled) ordered by `level_number ASC`.

#### Response Schema (unchanged)
```json
{
  "success": true,
  "data": {
    "group_id": 42,
    "generated_at": "2026-06-03T19:00:00Z",
    "cache_ttl": 300,
    "courses": { "1": { "course_id": 1, "course_name": "Robotics" } },
    "instructors": { "5": { "instructor_id": 5, "instructor_name": "John" } },
    "levels": [
      {
        "level_number": 1,
        "level_id": 101,
        "status": "completed",
        "sessions": [...],
        "students_count": 8,
        "payment_summary": { "total_expected": 800, "unpaid_students_count": 0 }
      },
      {
        "level_number": 2,
        "level_id": 102,
        "status": "active",
        "sessions": [...],
        "students_count": 10,
        "payment_summary": { "total_expected": 1000, "unpaid_students_count": 3 }
      }
    ]
  }
}
```

**Breaking change**: No — `levels` was always an array. Clients receiving 1 element will now receive N elements. The array contract is preserved.

---

### 2. `GET /finance/groups/{group_id}/payments` (BUG-2)

**Current behavior**: `unpaid_count` always returns 0 because `total_students` is derived from payment records.

**Fixed behavior**: `total_students` derived from enrollment count; `unpaid_count = total_students - paid_count`.

#### Response change (values only, not schema)
```json
{
  "by_level": [
    {
      "level_number": 2,
      "total_students": 10,
      "paid_count": 7,
      "unpaid_count": 3
    }
  ]
}
```

**Breaking change**: No — field names and types unchanged. Only the **values** are corrected.

---

### 3. `POST /academics/groups/{group_id}/sessions` (BUG-3)

**Current behavior**: Returns HTTP 201 with a valid session object, but the session is never committed to the database.

**Fixed behavior**: Session is committed and persists. Response is identical.

#### Request (unchanged)
```json
{
  "group_id": 42,
  "level_number": 2,
  "extra_date": "2026-06-15",
  "notes": "Make-up session"
}
```

#### Response (unchanged)
```json
{
  "success": true,
  "data": {
    "id": 456,
    "group_id": 42,
    "level_number": 2,
    "session_number": 9,
    "session_date": "2026-06-15",
    "status": "scheduled",
    "is_extra_session": true
  },
  "message": "Extra session added."
}
```

**Breaking change**: No — the response schema is unchanged. The only difference is that the session now actually exists in the database.

---

## Frontend-Only Changes (no API contract impact)

- **BUG-4** (Notes loop): No API contract change. The PATCH `/academics/groups/{group_id}` endpoint and its `{ notes: string }` payload are unchanged. The fix is purely in the React effect lifecycle.
- **BUG-5** (Time format): No API contract change. The backend correctly returns `"14:00:00"` — the fix is in frontend display formatting.
