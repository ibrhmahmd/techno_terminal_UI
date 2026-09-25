# Research: Group Detail Page Fixes

**Spec**: `033-group-detail-backend-fixes` | **Date**: 2026-06-03

## Research Task 1: Session Commit Pattern in Stateless Services

### Decision
Add explicit `session.commit()` after `repo.create_session()` in `add_extra_session()`.

### Rationale
The `get_session()` context manager (`app/db/connection.py:39-49`) explicitly documents: **"Caller is responsible for commit."** It auto-rollbacks on exception but does NOT auto-commit. Every other write method in `SessionService` (`update_session`, `delete_session`, `cancel_session`, `reactivate_session`) calls `session.commit()` — `add_extra_session` is the only one missing it. This is a clear omission, not a design choice.

### Alternatives Considered
- **Auto-commit context manager**: Rejected — would change semantics for all services and break explicit rollback patterns in UoW-based modules (CRM, Finance, HR, Enrollments).
- **Commit in repository**: Rejected — repositories are pure query layer; commit belongs in service (per AGENTS.md architecture).

---

## Research Task 2: Multi-Level Response Pattern

### Decision
Change `get_levels_detailed()` to return all levels by default (using `list_group_levels(include_inactive=True)`).

### Rationale
Two other methods in the same service already use this exact pattern:
- `get_group_payments()` (line 392): `list_group_levels(session, group_id, include_inactive=True)`
- `get_group_enrollments()` (line 498): `list_group_levels(session, group_id, include_inactive=True)`

The frontend `useGroupDetail` hook, `LevelSelector`, and all tab components already handle arrays of levels — they're just receiving a 1-element array today.

### Alternatives Considered
- **Add `include_all` query param**: Rejected — creates unnecessary API complexity. The `level_number` param already handles the "get specific level" case.
- **Separate endpoint for all levels**: Rejected — violates DRY; the existing endpoint + query param already has the right structure.
- **Frontend calls per level**: Rejected — requires knowing level numbers ahead of time and wastes API calls.

---

## Research Task 3: Unpaid Count Derivation

### Decision
Query enrollment count from the `enrollments` table instead of deriving from payment records.

### Rationale
The current logic counts `total_students` from `level_payments` — which only includes students with ≥1 payment record. Students who never paid are invisible to this calculation, making `unpaid_count = total - paid = 0` always.

Interestingly, the `get_payment_stats_by_levels()` function in the analytics repository (`group/analytics/repository.py:326-377`) correctly derives unpaid count from **enrollment data** (it joins through `Enrollment` model and checks `due > 0`). The `get_group_payments()` method should follow this same pattern.

### Alternatives Considered
- **Use `v_enrollment_balance` view**: Considered — already exists and has `payment_status`. Rejected because it adds a view dependency and the inline COUNT is simpler.
- **Use `get_payment_stats_by_levels()` directly**: Partially adopted — the concept is the same (derive from enrollments), but applied inline to avoid refactoring the payment grouping logic.

---

## Research Task 4: Notes Auto-Save Loop Breaking

### Decision
Use `lastSavedRef` pattern to track what was last saved, breaking the cycle of `save → refetch → setNotes → debounce → save`.

### Rationale
The current dual-`useEffect` pattern creates a circular dependency:
1. Effect 2 depends on `[debouncedNotes, onNotesChange, group.notes]`
2. `onNotesChange` triggers `updateGroup()` mutation
3. Mutation `onSuccess` calls `invalidateGroups()` which refetches `group` data
4. Refetch changes `group.notes` → triggers Effect 1 which calls `setNotes()` → triggers Effect 2 again

By comparing against `lastSavedRef.current` instead of `group.notes`, we break the cycle because:
- After save, `lastSavedRef.current = debouncedNotes` → no diff → no re-save
- External changes (different from what we saved) still sync correctly

### Alternatives Considered
- **Optimistic update (skip refetch)**: Rejected — would desync if another user modifies the group simultaneously.
- **Longer debounce**: Rejected — delays save but doesn't fix the root cause; loop still occurs after debounce.
- **Remove `onSuccess: invalidateGroups`**: Rejected — would break all other mutations that share the same invalidation pattern.

---

## Research Task 5: Time Format Standardization

### Decision
Import shared `formatTime` from `utils/formatting.ts` instead of using inline `time.slice(0,5)`.

### Rationale
The project already has a well-tested `formatTime` function that handles:
- `HH:MM` format → converts to 12h AM/PM
- Full datetime strings → extracts time in 12h format
- Invalid/empty strings → returns empty string

The `GroupInfoCard` inline function was likely a quick implementation that wasn't aligned with the shared utility.

### Alternatives Considered
- **Add 12h conversion to inline function**: Rejected — duplicates existing utility code.
- **Backend returns 12h format**: Rejected — backend correctly stores/returns raw time values; formatting is a presentation concern.
