# Data Model: Group Detail Page Fixes

**Spec**: `033-group-detail-backend-fixes` | **Date**: 2026-06-03

## Entities Affected

> No new entities are introduced. This spec modifies the **behavior** of existing service methods that produce existing DTOs.

### Existing DTOs (unchanged schema, fixed values)

#### `LevelWithSessionsDTO` (BUG-1 impact)
| Field | Type | Current Behavior | Fixed Behavior |
|-------|------|------------------|----------------|
| `level_number` | `int` | Only active level returned | All levels returned |
| `level_id` | `int` | Single value | Multiple values |
| `course_id` | `int` | Active level's course | Per-level course |
| `instructor_id` | `int` | Active instructor | Per-level instructor |
| `status` | `str` | Always "active" | "active", "completed", "cancelled" |
| `sessions` | `list[SessionInLevelDTO]` | Active level only | Per-level sessions |
| `students_count` | `int` | Active level only | Per-level count |
| `payment_summary` | `PaymentSummaryDTO` | Active level only | Per-level summary |

#### `LevelPaymentSummaryDTO` (BUG-2 impact)
| Field | Type | Current Value | Fixed Value |
|-------|------|---------------|-------------|
| `total_students` | `int` | Count from payment records only | Count from enrollments table |
| `paid_count` | `int` | Correct (students with ≥1 payment) | No change |
| `unpaid_count` | `int` | Always 0 | `total_students - paid_count` |

#### `CourseSession` (BUG-3 impact)
| Field | Type | Current Behavior | Fixed Behavior |
|-------|------|------------------|----------------|
| All fields | — | Created in memory, never committed | Committed to DB, persists |

### Schema Changes: **NONE**

No database migrations, no DTO schema changes, no new fields. All fixes are in service-layer logic.

## State Transitions

### Session Lifecycle (BUG-3 context)
```
[User clicks Add] → API POST 201 → [flush only, NO commit] → session LOST on close
                                       ↓ (FIXED)
[User clicks Add] → API POST 201 → [flush + commit] → session PERSISTED → visible in GET
```

### Notes Save Lifecycle (BUG-4 context)
```
CURRENT (broken):
type → debounce → save → refetch → setNotes → debounce → save → ∞

FIXED:
type → debounce → compare(lastSavedRef) → save → update lastSavedRef → STOP
                                                   refetch → compare(lastSavedRef) → same → SKIP
```
