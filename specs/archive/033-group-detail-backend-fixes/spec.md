# Backend Development Request — Group Detail Page Fixes

**Requested by**: Frontend Team  
**Priority**: High  
**Spec**: `033-group-detail-backend-fixes`  
**Date**: 2026-06-03  

---

## Executive Summary

The Group Detail page has **3 backend bugs** and **2 frontend bugs** that must be fixed to make the page fully operational. This document details each issue with root cause analysis, exact code locations, recommended solutions, and acceptance criteria.

---

## BUG-1: `get_levels_detailed()` Returns Only the Active Level

### Severity: **Critical** — Blocks multi-level navigation

### Problem Statement

When a group has progressed through multiple levels (e.g., Level 1 → 2 → 3), the frontend can only display the current active level. Users cannot view attendance, students, or session data for past levels.

### Root Cause (Backend)

**File**: `app/modules/academics/group/details/service.py` (lines 136-139)

```python
else:
    # Default to current active level
    active_level = level_repo.get_current_group_level(session, group_id)
    levels = [active_level] if active_level else []
```

The `get_levels_detailed()` method is called by the frontend via `GET /academics/groups/{group_id}/levels/detailed` **without** a `level_number` query param, so it enters the `else` branch and returns **only the single active level**. The frontend `LevelSelector` component then renders just 1 button — nothing to navigate to.

### Recommended Fix

Change the default behavior to return **all** levels (including completed/cancelled):

```python
else:
    # Return ALL levels for group (frontend needs full history for LevelSelector)
    levels = list(list_group_levels(session, group_id, include_inactive=True))
```

### Impact Analysis

- The `list_group_levels` function with `include_inactive=True` already exists and is already used by `get_group_payments()` (line 392) and `get_group_enrollments()` (line 498) — so this is a tested, safe pattern.
- Query count stays at 4 (levels + sessions + enrollment stats + payment stats). The only change is that Query 1 returns N rows instead of 1.
- The `level_number` query param codepath (lines 123-135) remains unchanged.

### Frontend Status

**No frontend changes needed.** The `LevelSelector`, `AttendanceTab`, `StudentsTab`, and `LevelsTab` components already support multi-level navigation — they're just starved of data.

### Acceptance Criteria

- [ ] `GET /academics/groups/{group_id}/levels/detailed` (no query params) returns ALL levels for the group
- [ ] Each level includes its sessions, enrollment stats, and payment summary
- [ ] Levels are ordered by `level_number ASC`
- [ ] The `level_number` query param still works to filter to a specific level

---

## BUG-2: `unpaid_count` Always Returns 0

### Severity: **High** — Displays incorrect financial data

### Problem Statement

In the Payments tab, every level shows `0 unpaid` even when students exist who have never made a payment.

### Root Cause (Backend)

**File**: `app/modules/academics/group/details/service.py` (lines 420-457)

```python
# Count unique students who paid
paid_students = set(
    p["student_id"] for p in level_payments
    if p["transaction_type"] != "refund"
)
total_students = len(set(p["student_id"] for p in level_payments))

# ...
paid_count=len(paid_students),
unpaid_count=total_students - len(paid_students),
```

**The bug**: `total_students` is derived from `level_payments` — which only contains students who have **at least one payment record**. Students who never paid don't appear in the `payments` table, so:

- `total_students` = count of students with ≥1 payment = same set as `paid_students`
- `unpaid_count` = `total_students - paid_students` = **always 0**

### Recommended Fix

Get the true enrolled student count from the `enrollments` table:

```python
# Get actual enrolled student count for this level (not just those with payments)
from app.modules.enrollments.models.enrollment_models import Enrollment
from sqlmodel import select, func

enrolled_stmt = select(func.count(Enrollment.id)).where(
    Enrollment.group_id == group_id,
    Enrollment.level_number == ln,
    Enrollment.status.in_(["active", "completed"])
)
total_students = session.exec(enrolled_stmt).first() or 0

# paid_students stays the same
paid_students = set(
    p["student_id"] for p in level_payments
    if p["transaction_type"] != "refund"
)

# NOW unpaid_count correctly reflects students without payments
paid_count = len(paid_students)
unpaid_count = max(0, total_students - paid_count)
```

### Impact Analysis

- Adds 1 lightweight `COUNT` query per level. For a group with 3 levels, that's 3 extra queries — negligible.
- No schema changes needed. The `LevelPaymentSummaryDTO` already has the `unpaid_count` field.
- No frontend changes needed. The `PaymentsTab` already renders `level.unpaid_count`.

### Acceptance Criteria

- [ ] `GET /finance/groups/{group_id}/payments` returns correct `unpaid_count` per level
- [ ] `unpaid_count` = (enrolled students in level) - (students with ≥1 non-refund payment)
- [ ] `paid_count` + `unpaid_count` = total enrolled students (not payment count)
- [ ] `total_students` reflects enrollment count, not payment record count

---

## BUG-3: `add_extra_session()` Returns 201 But Session Not Persisted

### Severity: **Critical** — Data loss

### Problem Statement

When adding an extra session via the AddSessionDialog, the API responds with HTTP 201 and a valid session object, but the session is **never actually saved** to the database. After refreshing, the session disappears.

### Root Cause (Backend)

**File**: `app/modules/academics/session/service.py` (lines 92-119)

```python
def add_extra_session(self, data: AddExtraSessionInput) -> CourseSession:
    """Adds an extra session numbered after the last existing session."""
    with get_session() as session:
        group = group_repo.get_group_by_id(session, data.group_id)
        # ... validation ...
        cs = CourseSession(...)
        apply_create_audit(cs)
        return repo.create_session(session, cs)
        # ← NO session.commit() ANYWHERE
```

The `get_session()` context manager (`app/db/connection.py` line 39-49) states: **"Caller is responsible for commit."** It auto-rollbacks on exception and auto-closes, but does **NOT** auto-commit.

The repository's `create_session()` calls `session.flush()` (which assigns an ID and makes it visible within the transaction) but never `session.commit()`. When the `with get_session()` block exits normally, the transaction is silently rolled back on close.

**Contrast with other working methods** that DO commit:
- `update_session()` (line 138): `session.commit()` ✅
- `delete_session()` (line 145): `session.commit()` ✅
- `cancel_session()` (line 220): `session.commit()` ✅
- `reactivate_session()` (line 282): `session.commit()` ✅

### Recommended Fix

Add `session.commit()` after `create_session`:

```python
def add_extra_session(self, data: AddExtraSessionInput) -> CourseSession:
    with get_session() as session:
        group = group_repo.get_group_by_id(session, data.group_id)
        if not group:
            raise NotFoundError(f"Group {data.group_id} not found.")

        next_num = repo.get_next_session_number(session, data.group_id, data.level_number)
        gl_id = repo.get_group_level_id(session, data.group_id, data.level_number)

        cs = CourseSession(
            group_id=data.group_id,
            level_number=data.level_number,
            session_number=next_num,
            session_date=data.extra_date,
            start_time=group.default_time_start,
            end_time=group.default_time_end,
            actual_instructor_id=group.instructor_id,
            is_extra_session=True,
            notes=data.notes,
            group_level_id=gl_id,
        )
        from app.shared.audit_utils import apply_create_audit
        apply_create_audit(cs)
        result = repo.create_session(session, cs)
        session.commit()           # ← ADD THIS
        session.refresh(result)    # ← reload to get any DB defaults
        return result
```

### Impact Analysis

- 1-line fix. Follows the exact same pattern as `update_session`, `cancel_session`, and `reactivate_session`.
- No schema or frontend changes needed.

### Acceptance Criteria

- [ ] `POST /academics/groups/{group_id}/sessions` creates a session that persists after page refresh
- [ ] The returned session object has a valid `id` and `session_number`
- [ ] The session appears in subsequent `GET /levels/detailed` responses
- [ ] Existing session operations (update, delete, cancel, reactivate) remain unaffected

---

## BUG-4: Notes Auto-Save Infinite Loop (Frontend)

### Severity: **High** — Continuous API calls, poor UX

### Problem Statement

When a user types a note in the GroupInfoCard, it enters an infinite save loop — the note keeps saving repeatedly without stopping.

### Root Cause (Frontend)

**File**: `src/components/groups/detail/GroupInfoCard.tsx` (lines 42-55)

```tsx
// Effect 1: Sync notes when group data changes
useEffect(() => {
  setNotes(group.notes || '')     // ← Re-sets local state from server
}, [group.notes])

// Effect 2: Save when debounced notes differ from server
useEffect(() => {
  if (isInitialMount.current) { isInitialMount.current = false; return }
  if (debouncedNotes !== (group.notes || '')) {
    onNotesChange?.(debouncedNotes)    // ← Triggers PATCH updateGroup
  }
}, [debouncedNotes, onNotesChange, group.notes])
```

**Combined with** `useGroupMutations.ts` (line 46): `onSuccess: invalidateGroups`

The cycle:
1. User types → `notes` state updates → debounce fires → `debouncedNotes` changes
2. Effect 2 sees `debouncedNotes !== group.notes` → calls `onNotesChange()` → `updateGroup({ notes })`
3. `updateGroup` mutation succeeds → `invalidateGroups()` refetches group data
4. Refetch completes → `group.notes` now equals the saved value → Effect 1 runs `setNotes(group.notes)` 
5. But `group.notes` dependency in Effect 2 changed → Effect 2 re-evaluates
6. Meanwhile, the `setNotes` from Effect 1 triggers a re-render → debounce resets → fires again
7. **Loop restarts** — especially if there's any timing mismatch between the optimistic local state and the refetched server state

### Recommended Fix

Replace the dual-effect pattern with a single controlled effect that uses a `lastSavedRef` to break the cycle:

```tsx
const lastSavedRef = useRef(group.notes || '')

useEffect(() => {
  if (isInitialMount.current) {
    isInitialMount.current = false
    return
  }
  // Only save if the debounced value differs from what we LAST SAVED
  // (not from group.notes which changes after refetch)
  if (debouncedNotes !== lastSavedRef.current) {
    lastSavedRef.current = debouncedNotes
    onNotesChange?.(debouncedNotes)
  }
}, [debouncedNotes, onNotesChange])

// Remove group.notes from the dependency array of the save effect
// Keep the sync effect but only for external changes (e.g., another user edited)
useEffect(() => {
  if (group.notes !== undefined && group.notes !== lastSavedRef.current) {
    setNotes(group.notes || '')
    lastSavedRef.current = group.notes || ''
  }
}, [group.notes])
```

### Location: **Frontend only** — no backend changes

### Acceptance Criteria

- [ ] Typing a note triggers exactly 1 API call after debounce period (300ms)
- [ ] No subsequent API calls occur after the save completes
- [ ] External group data changes (e.g., another tab editing the group) still sync the notes field
- [ ] The `isSavingNotes` indicator appears once and disappears

---

## BUG-5: Schedule Time Displayed in 24h Format (Frontend)

### Severity: **Low** — Cosmetic

### Problem Statement

The group schedule time in `GroupInfoCard` shows `14:00 - 16:00` instead of `2:00 PM - 4:00 PM`.

### Root Cause (Frontend)

**File**: `src/components/groups/detail/GroupInfoCard.tsx` (lines 36-39)

```tsx
const formatTime = (time: string | null | undefined) => {
  if (!time) return '--:--'
  return time.slice(0, 5)    // ← Just slices "14:00" from "14:00:00", no AM/PM conversion
}
```

The component defines its own **inline** `formatTime` that does a raw `slice(0,5)`. The project already has a shared `formatTime` in `src/utils/formatting.ts` (line 5) that properly converts to 12h AM/PM format.

### Recommended Fix

Replace the inline function with the shared utility:

```tsx
import { formatTime } from '../../../utils/formatting'

// Remove the inline formatTime function (lines 36-39)
// The imported formatTime already handles null and converts to 12h format
```

Update the template to handle null/undefined before passing to formatTime:

```tsx
{formatTime(group.schedule?.start_time || '')} - {formatTime(group.schedule?.end_time || '')}
```

### Location: **Frontend only** — no backend changes

### Acceptance Criteria

- [ ] Schedule time displays in 12h format: `2:00 PM - 4:00 PM`
- [ ] Null/undefined times still show `--:--`
- [ ] No regression in other time displays across the app

---

## Summary Table

| # | Bug | Type | Severity | Location | Fix Effort |
|---|-----|------|----------|----------|-----------|
| 1 | Only active level returned | Backend | Critical | `details/service.py:136-139` | 1 line |
| 2 | `unpaid_count` always 0 | Backend | High | `details/service.py:420-457` | ~10 lines |
| 3 | Session created but not committed | Backend | Critical | `session/service.py:92-119` | 2 lines |
| 4 | Notes infinite save loop | Frontend | High | `GroupInfoCard.tsx:42-55` | ~15 lines |
| 5 | Schedule time in 24h format | Frontend | Low | `GroupInfoCard.tsx:36-39` | 3 lines |

### Execution Dependencies

- **Backend bugs (1, 2, 3)** should be deployed first. Frontend bugs (4, 5) can be fixed independently in parallel.
- BUG-1 unblocks multi-level navigation across Attendance, Students, and Levels tabs
- BUG-3 unblocks the entire Add Session feature
- BUG-2 is a data correctness fix with no feature dependency
