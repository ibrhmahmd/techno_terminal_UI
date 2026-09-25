# Implementation Plan: Group Detail Page — Backend & Frontend Fixes

**Branch**: `030-groups-ui-redesign` | **Date**: 2026-06-03 | **Spec**: [spec.md](specs/033-group-detail-backend-fixes/spec.md)
**Input**: Feature specification from `specs/033-group-detail-backend-fixes/spec.md`

## Summary

Fix 5 bugs across the Group Detail page: 3 backend bugs (missing commit, wrong unpaid count, single-level response) and 2 frontend bugs (notes infinite loop, 24h time format). All fixes are small, isolated, and independently testable.

## Technical Context

**Backend**:
- **Language/Version**: Python 3.10+
- **Framework**: FastAPI + SQLModel
- **Database**: PostgreSQL (Supabase) — pool_size=10, max_overflow=5
- **Session**: `get_session()` context manager — caller commits, auto-rollback on exception
- **Pattern**: Stateless services (Academics, Attendance) — each service opens own `get_session()`

**Frontend**:
- **Language/Version**: TypeScript ~5.9
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v3.4
- **State**: React Query 5 (server state), Zustand 5 (auth only)
- **Build Gate**: `tsc -b && vite build` must pass

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Principle | Status | Notes |
|------|-----------|--------|-------|
| Frontend-Only Scope | I | ⚠️ JUSTIFIED | Backend changes required — bugs are in `app/modules/` service layer. These are bug fixes to existing endpoints, not new features. |
| Server State Discipline | II | ✅ PASS | Notes fix uses React Query cache; no new direct API calls |
| Global State Minimalism | III | ✅ PASS | Fix uses `useRef` (local), not global state |
| TypeScript Strict Mode | IV | ✅ PASS | No new type violations; removing unused inline function |
| Component Naming | V | ✅ PASS | No new components; editing existing `GroupInfoCard.tsx` |
| API Layer | Cache & API | ✅ PASS | Using existing `formatTime` from `utils/formatting.ts` |
| Cache Keys | Cache & API | ✅ PASS | No new cache keys needed |
| Build Gates | Workflow | ✅ PASS | Will verify `npm run build` after changes |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Backend code changes (Principle I) | BUG-1, BUG-2, BUG-3 are backend bugs — the API returns wrong data or doesn't persist. Frontend cannot work around missing `session.commit()` or wrong SQL logic. | Frontend-only workarounds don't exist for data that never reaches the database. |

## Project Structure

### Documentation (this feature)

```text
specs/033-group-detail-backend-fixes/
├── spec.md              # Bug investigation & requirements
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contract changes)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Backend Source Changes

```text
app/modules/academics/
├── group/details/service.py     # BUG-1: get_levels_detailed() — return all levels
│                                 # BUG-2: get_group_payments() — fix unpaid_count
└── session/service.py            # BUG-3: add_extra_session() — add commit
```

### Frontend Source Changes

```text
src/components/groups/detail/
└── GroupInfoCard.tsx              # BUG-4: Notes loop fix
                                   # BUG-5: Time format fix (use shared formatTime)
```

## Changes Summary

### Backend Changes (3 bugs)

#### BUG-1: Return all levels from `get_levels_detailed()` 
**File**: `app/modules/academics/group/details/service.py` (line 136-139)
**Change**: Replace `get_current_group_level()` with `list_group_levels(include_inactive=True)` in the default (no `level_number` param) branch.
**Risk**: Low — this pattern already used by `get_group_payments()` and `get_group_enrollments()`.

#### BUG-2: Fix `unpaid_count` in `get_group_payments()`
**File**: `app/modules/academics/group/details/service.py` (lines 420-457)
**Change**: Replace `total_students = len(set(p["student_id"] for p in level_payments))` with enrollment count query. Adds 1 COUNT query per level.
**Risk**: Low — lightweight COUNT query, no schema changes.

#### BUG-3: Add `session.commit()` to `add_extra_session()`
**File**: `app/modules/academics/session/service.py` (line 119)
**Change**: Add `session.commit()` and `session.refresh(result)` after `repo.create_session()`.
**Risk**: None — follows identical pattern of all other write methods in the same file.

### Frontend Changes (2 bugs)

#### BUG-4: Fix notes auto-save infinite loop
**File**: `src/components/groups/detail/GroupInfoCard.tsx` (lines 33-55)
**Change**: Replace dual `useEffect` with `lastSavedRef` pattern to break the save→refetch→save cycle.

#### BUG-5: Fix 24h time format in schedule display
**File**: `src/components/groups/detail/GroupInfoCard.tsx` (lines 36-39)
**Change**: Remove inline `formatTime` function, import shared `formatTime` from `utils/formatting.ts`.

## Verification Plan

### Backend Verification
1. **BUG-1**: Call `GET /academics/groups/{group_id}/levels/detailed` and verify response contains all levels (not just active)
2. **BUG-2**: Call `GET /finance/groups/{group_id}/payments` and verify `unpaid_count > 0` for levels with unpaid students
3. **BUG-3**: Call `POST /academics/groups/{group_id}/sessions`, then verify session persists via `GET /levels/detailed`

### Frontend Verification
1. **BUG-4**: Open Network tab → type a note → verify exactly 1 PATCH request after debounce → no loop
2. **BUG-5**: Verify schedule shows `2:00 PM - 4:00 PM` format
3. **Build**: `npm run build` must pass with zero errors
