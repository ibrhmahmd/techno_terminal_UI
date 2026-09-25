# API Contract: PATCH /api/v1/enrollments/{enrollment_id}

**Method**: `PATCH`  
**Auth**: `require_admin` (admin + system_admin roles)  
**Tag**: Enrollments

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enrollment_id` | `int` | Yes | ID of the enrollment to update |

### Request Body (JSON)

```json
{
  "amount_due": 450.0,
  "discount_applied": 50.0,
  "notes": "Family discount applied per parent request"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount_due` | `float \| null` | No | Custom per-student amount. Send `null` to revert to group default pricing. |
| `discount_applied` | `float` | No | Discount amount. Must be >= 0. |
| `notes` | `string \| null` | No | Internal admin notes. Send `null` to clear. |

All fields are optional. Only provided fields are updated.

## Response

### Success (200)

```json
{
  "success": true,
  "data": {
    "id": 42,
    "student_id": 15,
    "group_id": 3,
    "level_number": 2,
    "status": "active",
    "amount_due": 450.0,
    "discount_applied": 50.0,
    "payment_status": "partially_paid",
    "amount_remaining": 200.0,
    "notes": "Family discount applied per parent request",
    "enrolled_at": "2026-01-15T10:00:00Z"
  },
  "message": "Enrollment updated successfully."
}
```

### Success with Warnings (200)

When financial fields are modified and payments already exist:

```json
{
  "success": true,
  "data": { ... },
  "message": "Enrollment updated successfully. WARNING: Existing payments detected — balance recalculation may be needed."
}
```

### Error: Not Found (404)

```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Enrollment 999 not found."
}
```

### Error: Business Rule Violation (409)

```json
{
  "success": false,
  "error": "BusinessRuleError",
  "message": "Can only edit active enrollments. Current status: dropped"
}
```

### Error: Validation (422)

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "discount_applied must be >= 0"
}
```

## Side Effects

1. `updated_at` field is bumped via `apply_update_audit()`
2. Edit history entry appended to `enrollment_metadata.edit_history` JSONB
3. If financial fields changed: Gmail notification dispatched to parent via `BackgroundTasks`
