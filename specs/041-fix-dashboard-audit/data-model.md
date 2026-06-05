# Data Model: Dashboard Audit Fix

No new entities — this is a code quality and accessibility fix. Documented below are the affected data flows and state changes.

## Affected Data Flows

### 1. Session Time Display

**Current**: `MobileGroupCard.tsx` uses `time.slice(0,5)` — produces 24h format ("09:00")
**Desired**: Uses `formatTime(time: string)` from `src/utils/formatting.ts` — produces 12h format ("9:00 AM")

**Data flow**:
```
API → DashboardDailyOverviewDTO.scheduled_groups[].default_time_start (string "09:00:00")
   → MobileGroupCard props: time: string
   → formatTime(time) → "9:00 AM"
```

**Contract**: `formatTime` accepts `string`, returns `string` (empty string for falsy input). Callers must provide a non-null string.

### 2. Group Level Display

**Current**: `DashboardPage.tsx:178` accesses `current_level.level_number` without null guard.
**Desired**: Optional chaining `current_level?.level_number` with fallback to `0`.

**Data flow**:
```
API → DashboardDailyOverviewDTO.scheduled_groups[].current_level: CurrentLevelDTO | null
   → DashboardPage renders: current_level?.level_number ?? 0
```

**Contract**: `CurrentLevelDTO.level_number` is `number` but `current_level` itself can be `null` for new groups.

### 3. getGroupInfo Access

**Current**: `DashboardPage.tsx` calls `getGroupInfo(openGroupId)` 4+ times per render in the edit session section.
**Desired**: Stored in local variable `const groupInfo = getGroupInfo(openGroupId)` and reused.

**Data flow**:
```
useDashboard() returns { groups: Record<number, GroupInfoDTO> }
   → getGroupInfo(openGroupId) transforms Map lookup
   → Stored once, referenced 4×
```

**Contract**: `getGroupInfo` is a memoized selector returning `GroupInfoDTO | undefined`. Single call reduces wasted work.

### 4. Query Key Migration

**Current**: `dashboardKeys` defined in `useDashboard.ts`, consumed by `useDashboard`, `AttendanceGrid`, `AttendanceMobileSheet`, `useGroupQueries`.
**Desired**: Keys defined in `src/hooks/queryKeys.ts` under `queryKeys.dashboard.*`.

**Migration**:
```
Before: dashboardKeys.overview(date) → ['dashboard', 'overview', date]  (in useDashboard.ts)
After:  queryKeys.dashboard.overview(date) → ['dashboard', 'overview', date]  (in queryKeys.ts)
```

**Contract**: The key values remain identical — only the import path changes.

## State Changes (No new state)

| Location | Current | After | Rationale |
|----------|---------|-------|-----------|
| `DashboardPage.tsx` | `current_level.level_number` (unsafe) | `current_level?.level_number ?? 0` | Prevent crash on null |
| `DashboardPage.tsx` | `getGroupInfo(openGroupId)` called 4× | `const group = getGroupInfo(openGroupId)` | Reduce redundant calls |
| `MobileDashboardFAB.tsx` | FAB open state (boolean) | Same + Escape key handler | Keyboard accessibility |
| `DaySelectorBar.tsx` | Tab selection state | Same + arrow key handler | Keyboard accessibility |
| `InstructorSelectorBar.tsx` | Tab selection state | Same + arrow key handler | Keyboard accessibility |

## Dead Files Removed

| File | Type | Consumption |
|------|------|-------------|
| `src/components/dashboard/DashboardHeader.tsx` | Dead placeholder | Nowhere imported |
| `src/hooks/dashboard/useAttendance.ts` | Dead placeholder | Nowhere imported |
