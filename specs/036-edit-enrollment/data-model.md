# Data Model: Edit Enrollment

**Date**: 2026-06-04 | **Branch**: `036-edit-enrollment`

## Entities

### Enrollment (Existing — Modified)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | `int` | No | PK |
| `student_id` | `int` | No | FK → students. **Immutable after creation.** |
| `group_id` | `int` | No | FK → groups. **Immutable after creation.** |
| `level_number` | `int` | No | Snapshot from group at enrollment time |
| `amount_due` | `float` | Yes | Custom per-student amount. `null` = use group default. **Editable.** |
| `discount_applied` | `float` | No | Default 0.0. **Editable.** |
| `status` | `EnrollmentStatus` | No | `active\|completed\|transferred\|dropped\|cancelled`. Only `active` enrollments are editable. |
| `notes` | `str` | Yes | Internal admin notes. **Editable.** |
| `enrollment_metadata` | `JSONB` | Yes | Stores edit history under `edit_history` key. |
| `transferred_from` | `int` | Yes | FK → enrollments |
| `enrolled_at` | `datetime` | Yes | |
| `created_by` | `int` | Yes | FK → users |
| `created_at` | `datetime` | Yes | |
| `updated_at` | `datetime` | Yes | Auto-bumped on edit via `apply_update_audit()` |

### Payment (Existing — Referenced for Validation)

| Field | Type | Notes |
|-------|------|-------|
| `enrollment_id` | `int` | Optional FK → enrollments. Used to detect conflicts. |
| `amount` | `float` | Payment amount |
| `transaction_type` | `Literal` | `charge\|payment\|refund` |

## New Schemas (Backend)

### UpdateEnrollmentInput (Pydantic)

```python
class UpdateEnrollmentInput(BaseModel):
    amount_due: Optional[float] = None      # null = clear to group default
    discount_applied: Optional[float] = None
    notes: Optional[str] = None
```

All fields are optional to support partial updates. The service must differentiate between "field not sent" vs "field sent as null".

### UpdateEnrollmentResult (Pydantic)

```python
class UpdateEnrollmentResult(BaseModel):
    enrollment: EnrollmentDTO
    warnings: list[str] = []
```

## New Types (Frontend)

### UpdateEnrollmentRequest

```typescript
interface UpdateEnrollmentRequest {
  amount_due?: number | null     // null = revert to group default
  discount_applied?: number
  notes?: string | null
}
```

### UpdateEnrollmentResponse

```typescript
interface UpdateEnrollmentResponse {
  success: boolean
  data: Enrollment
  message: string
}
```

## State Transitions

```
active → [edit allowed] → active (same status, updated fields)
dropped → [edit blocked]
transferred → [edit blocked]
completed → [edit blocked]
cancelled → [edit blocked]
```

## Validation Rules

1. `status` MUST be `"active"` — reject with `BusinessRuleError` otherwise
2. `amount_due` MUST be `>= 0` if provided (or `null` to clear)
3. `discount_applied` MUST be `>= 0` if provided
4. If payments exist for this enrollment and `amount_due` or `discount_applied` is being changed, include warning in response
5. `notes` has no length constraint (backend `Optional[str]`)

## Audit History Schema (JSONB)

```json
{
  "edit_history": [
    {
      "editor_id": 1,
      "timestamp": "2026-06-04T09:30:00Z",
      "changes": {
        "amount_due": { "old": 500.0, "new": 450.0 },
        "discount_applied": { "old": 0, "new": 50 }
      }
    }
  ]
}
```
