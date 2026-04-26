# Dashboard Endpoint Audit Report

Comprehensive audit of dashboard-related API endpoints, React Query hooks, and TypeScript types.

**Status:** ✅ **COMPLETE** - All deprecation candidates migrated or removed  
**Completed:** April 26, 2026  
**Scope:** Dashboard page, Group Detail page, Reports page, and related components

---

## Executive Summary

### Changes Completed

| Item | Action | Status |
|------|--------|--------|
| Reports page | Migrated from deprecated `useDashboardData` to new `useReportsSummary` hook | ✅ Done |
| `getDashboardSummary` API | Removed from analytics module | ✅ Done |
| `useDashboardData` hook | Deleted | ✅ Done |
| `getDailySchedule` API | Deleted (unused) | ✅ Done |
| `DailyScheduleItem` type | Removed | ✅ Done |
| `GetGroupRosterParams` type | Removed from enrollments | ✅ Done |
| AttendanceGrid fallback | Removed `getGroupRoster` fallback, made `roster` prop required | ✅ Done |

---

## 1. Endpoint Inventory

### Dashboard Page Endpoints

| Endpoint Path | HTTP Method | React Query Hook | Consuming Components | Status |
|--------------|-------------|------------------|---------------------|--------|
| `/dashboard/daily-overview` | GET | `useDashboard` | DashboardPage, GroupSessionCard, AttendanceGrid | ✅ Active |
| `/academics/groups/enriched` | GET | `useGroupsFlat` | StudentDetailPage, ManageEnrollmentPanel, EnrollPanel, UnpaidEnrollmentsPanel, useGroups hook | ✅ Active |
| `/academics/groups/{id}/enriched` | GET | `useGroupDetail` (via fetch) | GroupDetailPage, useGroupDetail hook | ✅ Active |
| `/academics/groups/{id}/attendance` | GET | `useGroupAttendance` | AttendanceTab (Group Detail) | ✅ Active |
| ~~`/analytics/academics/groups/{id}/roster`~~ | ~~GET~~ | ~~(direct call)~~ | ~~AttendanceGrid (fallback)~~ | 🗑️ **REMOVED** |
| ~~`/academics/sessions/daily-schedule`~~ | ~~GET~~ | ~~—~~ | ~~(unused)~~ | 🗑️ **REMOVED** |

### Reports Page Endpoints

| Endpoint Path | HTTP Method | React Query Hook | Consuming Components | Status |
|--------------|-------------|------------------|---------------------|--------|
| ~~`/analytics/dashboard/summary`~~ | ~~GET~~ | ~~`useDashboardData`~~ | ~~ReportsPage~~ | 🗑️ **REMOVED** |
| `/dashboard/daily-overview` | GET | `useReportsSummary` | ReportsPage (SummaryCards) | ✅ **NEW** |
| `/analytics/bi/revenue-metrics` | GET | `useRevenueData` | ReportsPage (RevenueTab) | ✅ Active |
| `/analytics/bi/instructor-performance` | GET | `useInstructorPerformance` | ReportsPage (InstructorsTab) | ✅ Active |
| `/analytics/academics/student-progress` | GET | `useStudentProgress` | ReportsPage (ProgressTab) | ✅ Active |

---

## 2. Active Endpoints (Post-Refactor)

### 2.1 Dashboard Overview (Consolidated)

**Endpoint:** `GET /dashboard/daily-overview`

**Request Schema:**
```typescript
interface GetDashboardOverviewParams {
  date: string                    // YYYY-MM-DD
  include_attendance?: boolean   // default: true
}
```

**Response Schema:** `DashboardDailyOverviewDTO`
```typescript
interface DashboardDailyOverviewDTO {
  date: string
  generated_at: string
  cache_ttl: number
  groups: Record<number, GroupInfoDTO>
  instructors: Record<number, InstructorInfoDTO>
  scheduled_groups: ScheduledGroupDTO[]
  summary: DashboardSummaryDTO
}

interface ScheduledGroupDTO {
  group_id: number
  today_session: TodaySessionDTO | null
  current_level: CurrentLevelDTO
  roster: StudentRosterDTO[]           // ← Embedded roster
}

interface SessionWithAttendanceDTO {
  session_id: number
  session_number: number
  date: string
  time_start: string
  time_end: string
  status: 'scheduled' | 'completed' | 'cancelled'
  is_extra_session: boolean
  attendance: AttendanceRecordDTO[] | null
  // ... other fields
}
```

**React Query Hook:** `useDashboard(selectedDate: string)`  
**File:** `src/hooks/dashboard/useDashboard.ts`  
**Cache:** 5 minutes

**Consumers:**
- `src/pages/DashboardPage.tsx` - Main dashboard page
- `src/components/dashboard/GroupSessionCard.tsx` - Card component (via props)
- `src/components/attendance/AttendanceGrid.tsx` - Attendance grid (via props)

---

### 2.2 Reports Summary (New Hook)

**Hook:** `useReportsSummary()`  
**File:** `src/components/reports/hooks/useReportsSummary.ts` *(NEW)*

Transforms new dashboard API data to legacy format for Reports page compatibility.

```typescript
function transformToLegacySummary(data: DashboardDailyOverviewDTO): DashboardSummaryPublic {
  // Calculates total students across all scheduled groups
  // Maps today's sessions to legacy SessionInfo format
}
```

**Consumers:**
- `src/pages/ReportsPage.tsx` - Overview tab summary cards

---

### 2.3 Group Attendance (Group Detail Page)

**Endpoint:** `GET /academics/groups/{group_id}/attendance?level_number={n}`

**React Query Hook:** `useGroupAttendance(groupId, levelNumber)`  
**File:** `src/hooks/useGroupAttendance.ts`

**Consumers:**
- `src/components/groups/AttendanceTab.tsx` - Group detail attendance tab

---

### 2.4 Enriched Groups (Global Group List)

**Endpoint:** `GET /academics/groups/enriched`

**React Query Hook:** `useGroupsFlat(enabled: boolean)`  
**File:** `src/hooks/useGroupQueries.ts`
**Cache:** 10 minutes

**Consumers:**
- `src/pages/StudentDetailPage.tsx` - Group selector for enrollment
- `src/components/enrollments/EnrollPanel.tsx` - Enrollment panel
- `src/components/enrollments/ManageEnrollmentPanel.tsx` - Manage enrollment
- `src/components/finance/UnpaidEnrollmentsPanel.tsx` - Group filtering
- `src/hooks/useGroups.ts` - General groups hook

---

## 3. Removed/Deprecated Items (Cleanup Complete)

### 3.1 Deleted Files

| File | Reason |
|------|--------|
| `src/components/reports/hooks/useDashboardData.ts` | Replaced by `useReportsSummary.ts` |
| `src/api/academics/schedule.ts` | `getDailySchedule` unused |

### 3.2 Removed Functions

| Function | Location | Reason |
|----------|----------|--------|
| `getDashboardSummary()` | `src/api/analytics/academic.ts` | Migrated to `useReportsSummary` |
| `getDailySchedule()` | `src/api/academics/schedule.ts` | Unused |
| `getGroupRoster()` fallback | `src/components/attendance/AttendanceGrid.tsx` | No longer needed - roster always provided |

### 3.3 Removed Types

| Type | Location | Reason |
|------|----------|--------|
| `DailyScheduleItem` | `src/api/academics/types/sessions/models.ts` | Unused |
| `GetGroupRosterParams` | `src/api/enrollments/types.ts` | Unused |

### 3.4 Updated Prop Types

| Component | Change |
|-----------|--------|
| `AttendanceGrid` | `roster?: StudentRosterDTO[]` → `roster: StudentRosterDTO[]` (required) |

---

## 4. File Structure (Final State)

```
src/
├── api/
│   ├── dashboard/
│   │   ├── dashboard.ts           # getDashboardOverview ✅
│   │   └── types/
│   │       └── models.ts          # DashboardDailyOverviewDTO, etc.
│   ├── analytics/
│   │   ├── academic.ts            # getUnpaidAttendees, etc. (no getDashboardSummary)
│   │   └── types/
│   │       └── academic.ts        # DashboardSummaryPublic (kept for Reports compatibility)
│   └── academics/
│       ├── groups/
│       │   ├── core.ts            # getEnrichedGroups, getEnrichedGroup
│       │   └── index.ts           # Exports (no schedule)
│       ├── sessions/
│       │   └── core.ts            # getGroupSessions
│       └── types/
│           └── sessions/
│               └── models.ts      # Session (no DailyScheduleItem)
├── hooks/
│   ├── dashboard/
│   │   ├── useDashboard.ts        # Main dashboard hook ✅
│   │   └── useAttendance.ts       # Attendance mutations
│   ├── useGroupQueries.ts         # useGroupsFlat
│   ├── useGroupDetail.ts          # Group detail fetch
│   └── useGroupAttendance.ts      # Group attendance hook ✅
├── components/
│   ├── attendance/
│   │   └── AttendanceGrid.tsx     # Uses embedded roster ✅
│   ├── dashboard/
│   │   └── GroupSessionCard.tsx   # Passes roster to AttendanceGrid
│   ├── groups/
│   │   └── AttendanceTab.tsx      # Uses new group attendance endpoint ✅
│   └── reports/
│       └── hooks/
│           ├── useReportsSummary.ts   # NEW: Transforms dashboard data for Reports
│           ├── useRevenueData.ts      # Uses BI endpoint
│           └── useInstructorPerformance.ts  # Uses BI endpoint
└── pages/
    ├── DashboardPage.tsx          # Uses useDashboard ✅
    ├── GroupDetailPage.tsx        # Uses useGroupDetail
    ├── ReportsPage.tsx            # Uses useReportsSummary ✅
    └── StudentDetailPage.tsx      # Uses useGroupsFlat
```

---

## 5. Verification Checklist

- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] Reports page uses new `useReportsSummary` hook
- [x] `getDashboardSummary` removed from API
- [x] `useDashboardData.ts` deleted
- [x] AttendanceGrid `roster` prop is now required
- [x] AttendanceGrid fallback to `getGroupRoster` removed
- [x] `getDailySchedule` API removed
- [x] `DailyScheduleItem` type removed
- [x] `GetGroupRosterParams` type removed

---

## 6. Migration Summary

### Reports Page Migration
**Before:** `useDashboardData` → `getDashboardSummary()` (deprecated endpoint)  
**After:** `useReportsSummary` → `getDashboardOverview()` (new consolidated endpoint with transform)

### AttendanceGrid Migration
**Before:** Optional `roster` prop with fallback to `getGroupRoster()`  
**After:** Required `roster` prop - always provided by parent component

---

*End of Audit Report - All items complete*
