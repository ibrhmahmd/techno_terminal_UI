# Quickstart — Attendance Grid Cache/Update/Refresh Fix

Phase 1 output. How a developer implements and verifies this feature.

## Prerequisites

- Current branch: `074-attendance-cache-refresh-audit`
- Deps installed (node_modules present)

## Implementation order

1. **Shared utils/hooks first** (no dependencies):
   - `src/utils/attendanceStatus.ts` — `getNextStatus` + `ATTENDANCE_STATUSES`
   - `src/utils/attendanceInvalidation.ts` — `invalidateSessionCaches`
   - `src/hooks/useAttendanceCaches.ts` — `useAttendanceInvalidation`
   - `src/api/types.ts` or reuse — shared `SessionStatus` union
2. **Type consolidation** (US-3):
   - `src/api/attendance/types.ts` → re-export DTOs from academics, keep `AttendanceStatus`/`AttendanceEntry`
   - `src/api/attendance/attendance.ts` → re-export `getAttendanceForLevel` from academics
3. **Component wiring**:
   - `AttendanceGrid.tsx` → `useReducer`, shared invalidator on lifecycle handlers + save-all, shared `getNextStatus`, `EditSessionModal` import
   - `AttendanceMobileSheet.tsx` → `?? 'not_taken'` + `Number()` key + shared invalidator + shared `getNextStatus`
   - `AttendanceTableBody.tsx` → `?? 'not_taken'`
   - `LevelsTab.tsx` → `useMemo` around `transformRoster`/`transformSessions`
   - Rename `EditSessionPopup.tsx` → `EditSessionModal.tsx` (update imports)
4. **Tests**: add `src/tests/attendance/attendanceInvalidation.test.ts` for the cache-coverage contract.

## Verification

```bash
npm run lint
npm run build        # tsc -b && vite build — must pass
npm run test         # Vitest — must pass
npm run test -- src/tests/attendance/attendanceInvalidation.test.ts
```

### Manual (via browser)

- **US-1 (P1)**: On group-detail page, cancel/delete/reactivate/complete/edit a session → grid row updates immediately, no refresh.
- **US-2 (P2)**: Open a session whose student has no attendance record → mobile shows gray "Not Taken", matching desktop.
- **US-3 (P3)**: `rg "interface AttendanceRosterDTO" src` → exactly 1 hit (academics); `rg "getAttendanceForLevel" src/api` → 1 impl + re-exports only.

## Common pitfalls (from AGENTS.md §8)

- `markAttendance` filters `not_taken` and `parseInt`s `student_id` — keep this behavior; only the invalidation model changes.
- Do NOT change `useGroupAttendance` staleTime (60s) — intentional.
- Notes dirty-state ordering: await cache invalidation before clearing `dirtyNotes` (Fix-1 rule).
- Add any new i18n keys to BOTH `en/attendance.json` and `ar/attendance.json`.
