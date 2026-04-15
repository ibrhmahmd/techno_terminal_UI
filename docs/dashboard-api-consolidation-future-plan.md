# Dashboard API Consolidation & Performance Optimization Plan

**One-Sentence Summary:** Consolidate all dashboard-related API calls into a single cohesive module, eliminate N+1 query performance issues with bulk endpoints, add instructor filtering with frontend grouping, and implement React Query caching for optimal user experience.

---

## Executive Overview

| Metric | Current State | Target State | Impact |
|--------|---------------|--------------|--------|
| API Calls (10 groups) | 1 + 1 + 10 = 12 requests | 1 + 1 = 2 requests | **83% reduction** |
| Time to Interactive | ~3-5 seconds | <1 second | **70% faster** |
| Component Re-renders | 15+ per interaction | 2-3 per interaction | **80% reduction** |
| Lines in AttendanceGrid | 383 lines | <150 lines | **60% smaller** |
| Cache Hits | 0% | 85%+ | Massive UX improvement |

---

## Part 1: Current API Inventory & Endpoint Mapping

### 1.1 Complete Endpoint Usage Table

| # | Current Function | Current Endpoint | Method | Used In | Priority |
|---|-------------------|------------------|--------|---------|----------|
| 1 | `getDailySchedule(date)` | `/academics/sessions/daily-schedule?target_date={date}` | GET | DashboardPage.tsx | CRITICAL |
| 2 | `getEnrichedGroups()` | `/academics/groups/enriched` | GET | DashboardPage.tsx | CRITICAL |
| 3 | `getGroupSessions(groupId)` | `/academics/groups/{group_id}/sessions` | GET | DashboardPage.tsx (N+1) | CRITICAL |
| 4 | `getGroupRoster(groupId, level)` | `/analytics/academics/groups/{group_id}/roster?level_number={level}` | GET | AttendanceGrid.tsx | HIGH |
| 5 | `getSessionAttendance(sessionId)` | `/attendance/session/{sessionId}` | GET | AttendanceGrid.tsx (per session) | HIGH |
| 6 | `markAttendance(sessionId, entries)` | `/attendance/session/{sessionId}/mark` | POST | AttendanceGrid.tsx | HIGH |
| 7 | `cancelSession(sessionId)` | `/academics/sessions/{sessionId}/cancel` | POST | AttendanceGrid.tsx | MEDIUM |
| 8 | `updateSession(sessionId, data)` | `/academics/sessions/{sessionId}` | PATCH | AttendanceGrid.tsx | MEDIUM |
| 9 | `addExtraSession(data)` | `/academics/groups/{group_id}/sessions` | POST | AttendanceGrid.tsx | LOW |
| 10 | `markSubstituteInstructor(sessionId, instructorId)` | `/academics/sessions/{sessionId}/substitute` | POST | AttendanceGrid.tsx | LOW |

### 1.2 Type Dependencies

| Type | Source File | Used In | Action |
|------|-------------|---------|--------|
| `DailyScheduleItem` | `api/academics/types/sessions/models.ts` | DashboardPage | MOVE |
| `Session` | `api/academics/types/sessions/models.ts` | DashboardPage, GroupSessionCard, AttendanceGrid | MOVE |
| `EnrichedGroupPublic` | `api/academics/types/groups/models.ts` | DashboardPage | MOVE |
| `GroupRosterRowDTO` | `api/analytics/types/academic.ts` | AttendanceGrid | MOVE |
| `SessionAttendanceRowDTO` | `api/attendance/types.ts` | AttendanceGrid | MOVE |
| `AttendanceStatus` | `api/attendance/types.ts` | AttendanceGrid | MOVE |
| `MarkAttendanceRequest` | `api/attendance/types.ts` | AttendanceGrid | MOVE |
| `UpdateSessionDTO` | `api/academics/types/sessions/inputs.ts` | AttendanceGrid | MOVE |

---

## Part 2: New Consolidated Dashboard API Structure

### 2.1 Directory Structure

```
src/api/dashboard/
├── index.ts                 # Barrel exports
├── client.ts                # Dashboard-specific axios instance (optional)
├── queries.ts               # React Query query definitions
├── mutations.ts             # React Query mutation definitions
├── hooks.ts                 # Custom hooks for dashboard
├── types/
│   ├── index.ts             # Barrel exports
│   ├── models.ts            # All DTOs moved from other modules
│   ├── inputs.ts            # All input DTOs
│   └── responses.ts         # Response wrappers
└── __tests__/               # Unit tests
    ├── dashboard.test.ts
    └── hooks.test.ts
```

### 2.2 Files to Create/Move

| New Path | Source Path (if moving) | Purpose |
|----------|------------------------|---------|
| `src/api/dashboard/index.ts` | NEW | Barrel exports for dashboard API |
| `src/api/dashboard/types/models.ts` | Consolidated from 4 files | All dashboard DTOs |
| `src/api/dashboard/types/inputs.ts` | Consolidated from 3 files | All input DTOs |
| `src/api/dashboard/types/index.ts` | NEW | Type barrel exports |
| `src/api/dashboard/queries.ts` | NEW | React Query query configurations |
| `src/api/dashboard/mutations.ts` | NEW | React Query mutation configurations |
| `src/api/dashboard/hooks.ts` | NEW | `useDashboardData`, `useInstructorFilter`, etc. |
| `src/hooks/dashboard/useDashboard.ts` | NEW | High-level dashboard state hook |
| `src/hooks/dashboard/useAttendance.ts` | NEW | Attendance-specific hook |
| `src/hooks/dashboard/index.ts` | NEW | Barrel exports |

### 2.3 Existing Files to Modify

| File | Modification |
|------|--------------|
| `src/pages/DashboardPage.tsx` | Replace useEffect data loading with React Query |
| `src/components/dashboard/GroupSessionCard.tsx` | Remove navigation bug, memoize callbacks |
| `src/components/dashboard/DaySelectorBar.tsx` | No changes (working correctly) |
| `src/components/attendance/AttendanceGrid.tsx` | Split into smaller components, use React Query |
| `src/api/academics/index.ts` | Keep for backward compatibility, re-export from dashboard |
| `src/api/analytics/index.ts` | Keep for backward compatibility |
| `src/api/attendance/index.ts` | Keep for backward compatibility |

---

## Part 3: Performance Optimization Specifications

### 3.1 Optimization 1: Bulk Sessions Endpoint (Priority: CRITICAL)

**Problem:** N+1 query - 1 request per group to get sessions
**Solution:** Single endpoint returning sessions for multiple groups

#### New Backend Endpoint Required

```
GET /dashboard/daily-data?date={YYYY-MM-DD}&include_sessions=true
```

**Request Schema:**
```typescript
interface GetDashboardDailyDataRequest {
  date: string;                    // Required, format: YYYY-MM-DD
  include_sessions?: boolean;      // Optional, default: true
  include_attendance_preview?: boolean; // Optional, default: false
}
```

**Response Schema:**
```typescript
interface DashboardDailyDataResponse {
  date: string;
  schedule_items: DashboardScheduleItem[];
  groups: DashboardGroup[];
  sessions_by_group: Record<number, DashboardSession[]>;
  metadata: {
    total_groups: number;
    total_sessions: number;
    instructors: string[];  // Unique instructor names for filter
  };
}

interface DashboardScheduleItem {
  session_id: number;
  date: string;
  time_start: string;
  time_end: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
  group_id: number;
  group_name: string;
  level_number: number;
  course_id: number;
  course_name: string;
  enrolled_count: number;
  instructor_name: string;  // Added for filtering
}

interface DashboardGroup {
  id: number;
  group_name: string;
  course_name: string;
  instructor_name: string;
  level_number: number;
  current_student_count: number;
  status: 'active' | 'inactive' | 'archived';
}

interface DashboardSession {
  id: number;
  group_id: number;
  level_number: number;
  session_number: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  is_extra_session: boolean;
  instructor_name?: string;
  is_substitute?: boolean;
  notes: string;
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_DATE_FORMAT` | 400 | Date not in YYYY-MM-DD format |
| `DATE_OUT_OF_RANGE` | 400 | Date > 1 year from now or < 1 year ago |
| `AUTHENTICATION_REQUIRED` | 401 | User not authenticated |
| `DASHBOARD_ACCESS_DENIED` | 403 | User lacks dashboard view permission |

**Rate Limiting:** 100 requests/minute per user

**Authentication:** JWT Bearer token required

**Example Response:**
```json
{
  "date": "2026-04-13",
  "schedule_items": [
    {
      "session_id": 1234,
      "date": "2026-04-13",
      "time_start": "15:00",
      "time_end": "16:30",
      "status": "scheduled",
      "notes": "",
      "group_id": 101,
      "group_name": "Robotics Alpha",
      "level_number": 3,
      "course_id": 5,
      "course_name": "Robotics 101",
      "enrolled_count": 12,
      "instructor_name": "Ahmed Hassan"
    }
  ],
  "groups": [
    {
      "id": 101,
      "group_name": "Robotics Alpha",
      "course_name": "Robotics 101",
      "instructor_name": "Ahmed Hassan",
      "level_number": 3,
      "current_student_count": 12,
      "status": "active"
    }
  ],
  "sessions_by_group": {
    "101": [
      {
        "id": 1230,
        "group_id": 101,
        "level_number": 3,
        "session_number": 10,
        "session_date": "2026-04-10",
        "start_time": "15:00",
        "end_time": "16:30",
        "status": "completed",
        "is_extra_session": false,
        "instructor_name": "Ahmed Hassan",
        "notes": ""
      }
    ]
  },
  "metadata": {
    "total_groups": 1,
    "total_sessions": 5,
    "instructors": ["Ahmed Hassan", "Sara Ali", "Mohamed Khaled"]
  }
}
```

### 3.2 Optimization 2: Consolidated Attendance Data Endpoint (Priority: HIGH)

**Problem:** Multiple calls for roster + attendance per session
**Solution:** Single endpoint returning roster with embedded attendance

#### New Backend Endpoint Required

```
GET /dashboard/groups/{group_id}/attendance-grid?level_number={level}&session_ids={ids}
```

**Request Schema:**
```typescript
interface GetAttendanceGridRequest {
  level_number: number;           // Required
  session_ids?: number[];         // Optional, up to 5 sessions
  include_history?: boolean;     // Optional, include past 5 sessions
}
```

**Response Schema:**
```typescript
interface AttendanceGridResponse {
  group: {
    id: number;
    name: string;
    course_name: string;
    instructor_name: string;
    level_number: number;
    current_student_count: number;
  };
  sessions: AttendanceSession[];
  students: AttendanceStudent[];
}

interface AttendanceSession {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  session_number: number;
  is_extra_session: boolean;
  notes: string;
}

interface AttendanceStudent {
  student_id: string;
  full_name: string;
  gender: 'male' | 'female';  // FIX: Actually populated
  enrollment_id: number;
  enrollment_status: string;
  balance: number;
  billing_status: 'paid' | 'due' | 'credit';  // Computed by backend
  attendance: Record<number, AttendanceStatus>;  // session_id -> status
  stats: {
    sessions_attended: number;
    sessions_missed: number;
    total_sessions: number;
    attendance_pct: number;
  };
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `GROUP_NOT_FOUND` | 404 | Group ID doesn't exist |
| `INVALID_LEVEL` | 400 | Level number doesn't exist for group |
| `TOO_MANY_SESSIONS` | 400 | Requested >5 sessions |
| `ATTENDANCE_ACCESS_DENIED` | 403 | User can't view this group's attendance |

**Example Response:**
```json
{
  "group": {
    "id": 101,
    "name": "Robotics Alpha",
    "course_name": "Robotics 101",
    "instructor_name": "Ahmed Hassan",
    "level_number": 3,
    "current_student_count": 12
  },
  "sessions": [
    {
      "id": 1234,
      "session_date": "2026-04-13",
      "start_time": "15:00",
      "end_time": "16:30",
      "status": "scheduled",
      "session_number": 12,
      "is_extra_session": false,
      "notes": ""
    }
  ],
  "students": [
    {
      "student_id": "456",
      "full_name": "Omar Hassan",
      "gender": "male",
      "enrollment_id": 789,
      "enrollment_status": "active",
      "balance": 0,
      "billing_status": "paid",
      "attendance": {
        "1234": "present"
      },
      "stats": {
        "sessions_attended": 11,
        "sessions_missed": 1,
        "total_sessions": 12,
        "attendance_pct": 91.7
      }
    }
  ]
}
```

### 3.3 Optimization 3: React Query Implementation (Priority: HIGH)

**Files to Create:**
- `src/api/dashboard/queries.ts`
- `src/api/dashboard/mutations.ts`

**Query Configuration:**
```typescript
// queries.ts
export const dashboardQueries = {
  dailyData: (date: string) => ({
    queryKey: ['dashboard', 'daily', date],
    queryFn: () => getDashboardDailyData(date),
    staleTime: 1000 * 60 * 5,     // 5 minutes
    cacheTime: 1000 * 60 * 30,    // 30 minutes
    refetchOnWindowFocus: false,
  }),
  attendanceGrid: (groupId: number, level: number, sessionIds?: number[]) => ({
    queryKey: ['dashboard', 'attendance', groupId, level, sessionIds],
    queryFn: () => getAttendanceGrid(groupId, level, sessionIds),
    staleTime: 1000 * 60,          // 1 minute (attendance changes frequently)
    cacheTime: 1000 * 60 * 10,     // 10 minutes
    refetchOnWindowFocus: true,
  }),
};

export const dashboardMutations = {
  markAttendance: {
    mutationFn: ({ sessionId, entries }: MarkAttendanceParams) => 
      markAttendance(sessionId, entries),
    onSuccess: (_, variables) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'attendance']
      });
    },
  },
  // ... other mutations
};
```

---

## Part 4: Instructor Filtering Feature

### 4.1 UX Specification

**Component:** `InstructorSelectorBar` (similar to DaySelectorBar)

**Design:**
- Horizontal bar below DaySelectorBar
- Shows unique instructors from dashboard metadata
- "All Instructors" option at start
- Selected state styling matches DaySelectorBar
- Responsive: horizontal scroll on mobile

### 4.2 Implementation

**New File:** `src/components/dashboard/InstructorSelectorBar.tsx`

```typescript
interface InstructorSelectorBarProps {
  instructors: string[];  // From dashboard metadata
  selectedInstructor: string | null;  // null = all
  onSelectInstructor: (instructor: string | null) => void;
}
```

**Filtering Logic:** Frontend-only (as requested)
```typescript
// In DashboardPage
const filteredScheduleItems = useMemo(() => {
  if (!selectedInstructor) return scheduleItems;
  return scheduleItems.filter(item => 
    item.instructor_name === selectedInstructor
  );
}, [scheduleItems, selectedInstructor]);

const filteredGroups = useMemo(() => {
  if (!selectedInstructor) return groups;
  return groups.filter(group => 
    group.instructor_name === selectedInstructor
  );
}, [groups, selectedInstructor]);
```

### 4.3 State Management

```typescript
// DashboardPage state additions
const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);

// Reset instructor filter when date changes
useEffect(() => {
  setSelectedInstructor(null);
}, [selectedDate]);
```

---

## Part 5: Frontend Implementation Sequence

### Phase 1: Foundation (Week 1)

**Priority:** CRITICAL
**Goal:** Set up consolidated API structure without breaking existing code

| Step | Task | Files | Effort |
|------|------|-------|--------|
| 1.1 | Create `src/api/dashboard/` directory structure | New folder | 30 min |
| 1.2 | Copy type definitions to `types/models.ts` | `types/models.ts` | 1 hour |
| 1.3 | Create barrel exports (`index.ts`) | `index.ts` | 30 min |
| 1.4 | Create legacy compatibility layer | `compat.ts` | 1 hour |
| 1.5 | Add temporary feature flags | `config.ts` | 30 min |

**New Files:**
- `src/api/dashboard/index.ts`
- `src/api/dashboard/types/index.ts`
- `src/api/dashboard/types/models.ts`
- `src/api/dashboard/types/inputs.ts`
- `src/api/dashboard/compat.ts`
- `src/api/dashboard/config.ts`

### Phase 2: React Query Integration (Week 1-2)

**Priority:** HIGH
**Goal:** Implement data fetching with caching

| Step | Task | Files | Effort |
|------|------|-------|--------|
| 2.1 | Install React Query | `package.json` | 15 min |
| 2.2 | Create QueryClient provider | `App.tsx` | 30 min |
| 2.3 | Write query definitions | `queries.ts` | 2 hours |
| 2.4 | Write mutation definitions | `mutations.ts` | 2 hours |
| 2.5 | Create `useDashboardData` hook | `hooks.ts` | 2 hours |
| 2.6 | Add optimistic updates | `mutations.ts` | 2 hours |

**New Files:**
- `src/api/dashboard/queries.ts`
- `src/api/dashboard/mutations.ts`
- `src/api/dashboard/hooks.ts`
- `src/hooks/dashboard/useDashboard.ts`
- `src/hooks/dashboard/index.ts`

### Phase 3: DashboardPage Refactor (Week 2)

**Priority:** CRITICAL
**Goal:** Replace useEffect with React Query, add instructor selector

| Step | Task | Files | Effort |
|------|------|-------|--------|
| 3.1 | Create `InstructorSelectorBar` component | `InstructorSelectorBar.tsx` | 2 hours |
| 3.2 | Refactor DashboardPage to use React Query | `DashboardPage.tsx` | 4 hours |
| 3.3 | Add instructor filtering logic | `DashboardPage.tsx` | 1 hour |
| 3.4 | Add loading skeletons | `DashboardSkeleton.tsx` | 2 hours |
| 3.5 | Update QuickActionsGrid with stats | `QuickActionsGrid.tsx` | 1 hour |

**New Files:**
- `src/components/dashboard/InstructorSelectorBar.tsx`
- `src/components/dashboard/DashboardSkeleton.tsx`

**Modified Files:**
- `src/pages/DashboardPage.tsx` (major refactor)
- `src/components/dashboard/QuickActionsGrid.tsx`

### Phase 4: AttendanceGrid Refactor (Week 3)

**Priority:** HIGH
**Goal:** Split monolithic component, fix bugs

| Step | Task | Files | Effort |
|------|------|-------|--------|
| 4.1 | Fix hardcoded gender bug | `AttendanceGrid.tsx` | 15 min |
| 4.2 | Fix billing status logic | `AttendanceGrid.tsx` | 15 min |
| 4.3 | Create `useAttendance` hook | `useAttendance.ts` | 3 hours |
| 4.4 | Extract `AttendanceHeader` | Already exists | - |
| 4.5 | Extract `AttendanceTableBody` | Already exists | - |
| 4.6 | Extract `SessionNotesManager` | `SessionNotesManager.tsx` | 2 hours |
| 4.7 | Extract `AttendanceToggle` | `AttendanceToggle.tsx` | 2 hours |
| 4.8 | Simplify AttendanceGrid container | `AttendanceGrid.tsx` | 3 hours |

**New Files:**
- `src/hooks/dashboard/useAttendance.ts`
- `src/components/attendance/SessionNotesManager.tsx`
- `src/components/attendance/AttendanceToggle.tsx`

**Modified Files:**
- `src/components/attendance/AttendanceGrid.tsx` (major refactor)

### Phase 5: Backend API Specification (Week 3-4)

**Priority:** HIGH
**Goal:** Complete backend specification document

| Step | Task | Deliverable | Effort |
|------|------|-------------|--------|
| 5.1 | Write endpoint specifications | `backend-api-spec.md` | 4 hours |
| 5.2 | Define request/response schemas | JSON Schema | 2 hours |
| 5.3 | Document error codes | Error catalog | 1 hour |
| 5.4 | Write authentication requirements | Auth spec | 1 hour |
| 5.5 | Create rate limiting spec | Rate limit config | 30 min |
| 5.6 | Write example payloads | Examples doc | 1 hour |

**Deliverable:** `docs/api/dashboard/backend-api-spec.md`

---

## Part 6: Backend API Specification Document

### 6.1 New Endpoints Summary

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/dashboard/daily-data` | GET | Consolidated daily schedule + groups + sessions | CRITICAL |
| `/dashboard/groups/{id}/attendance-grid` | GET | Roster + attendance in one call | HIGH |
| `/dashboard/batch-attendance` | POST | Mark attendance for multiple sessions | MEDIUM |
| `/dashboard/instructors` | GET | List all active instructors | LOW |

### 6.2 Complete Request/Response Specifications

[See Part 3 for detailed schemas above]

### 6.3 Authentication & Authorization

**Authentication:** JWT Bearer Token
```
Authorization: Bearer <token>
```

**Required Permissions:**
| Endpoint | Permission | Description |
|----------|------------|-------------|
| `/dashboard/daily-data` | `dashboard:read` | View dashboard |
| `/dashboard/groups/*/attendance-grid` | `attendance:read` | View attendance |
| `/dashboard/batch-attendance` | `attendance:write` | Mark attendance |

### 6.4 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/dashboard/daily-data` | 100 | 1 minute |
| `/dashboard/groups/*/attendance-grid` | 200 | 1 minute |
| `/dashboard/batch-attendance` | 50 | 1 minute |
| `/dashboard/instructors` | 50 | 1 minute |

### 6.5 Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "timestamp": "2026-04-13T10:30:00Z",
    "request_id": "uuid-for-debugging"
  }
}
```

### 6.6 Backend Directory Structure Recommendation

```
backend/app/api/dashboard/
├── __init__.py
├── router.py              # FastAPI router
├── models.py              # Pydantic models
├── service.py             # Business logic
├── repository.py          # Database queries
├── dependencies.py        # Auth, validation
└── tests/
    ├── __init__.py
    ├── test_router.py
    └── test_service.py
```

---

## Part 7: Migration Strategy

### 7.1 Backward Compatibility

**Phase 1-2:** Keep existing API calls working
```typescript
// compat.ts - Re-export existing functions with deprecation warnings
/** @deprecated Use useDashboardData hook instead */
export const getDailySchedule = originalGetDailySchedule;
```

**Phase 3:** Add feature flag for new implementation
```typescript
const USE_NEW_DASHBOARD = process.env.REACT_APP_V2_DASHBOARD === 'true';

const DashboardPage = USE_NEW_DASHBOARD ? DashboardPageV2 : DashboardPageV1;
```

**Phase 4:** Gradual rollout
- Week 1: Internal testing (feature flag on for devs)
- Week 2: Beta users (10% of traffic)
- Week 3: 50% rollout
- Week 4: 100% rollout

### 7.2 Testing Strategy

| Test Type | Coverage | Tools |
|-----------|----------|-------|
| Unit Tests | Hooks, utilities | Jest |
| Integration Tests | API calls | MSW (Mock Service Worker) |
| E2E Tests | Full user flows | Playwright |
| Performance Tests | Load times | Lighthouse CI |

---

## Part 8: Success Metrics

### 8.1 Performance KPIs

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| API Calls (10 groups) | 12 | 2 | Chrome DevTools |
| Time to First Contentful Paint | 3.5s | 1.2s | Lighthouse |
| Time to Interactive | 5.2s | 1.8s | Lighthouse |
| Bundle Size | 245KB | 240KB (with RQ) | Webpack Bundle Analyzer |
| Cache Hit Rate | 0% | >85% | React Query DevTools |

### 8.2 Quality KPIs

| Metric | Target |
|--------|--------|
| Unit Test Coverage | >80% |
| TypeScript Strict Mode | Enabled |
| E2E Test Pass Rate | 100% |
| Accessibility Score | >95 |

---

## Part 9: Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend endpoints delayed | Medium | High | Implement frontend caching first |
| React Query learning curve | Low | Medium | Team training session |
| Breaking changes in production | Low | Critical | Feature flags + gradual rollout |
| Performance regression | Low | High | Lighthouse CI in pipeline |
| Mobile performance issues | Medium | Medium | Test on real devices |

---

## Part 10: Timeline Summary

| Week | Deliverables | Owner |
|------|--------------|-------|
| Week 1 | Directory structure, types, React Query setup | Frontend Team |
| Week 2 | DashboardPage refactor, Instructor selector | Frontend Team |
| Week 3 | AttendanceGrid refactor, Backend API spec | Frontend + Backend |
| Week 4 | Backend implementation, Integration testing | Backend Team |
| Week 5 | E2E testing, Performance optimization | QA + Frontend |
| Week 6 | Gradual rollout, Monitoring | DevOps |

---

**Total Estimated Effort:** 6 weeks (3 frontend, 2 backend, 1 testing/rollout)

**Dependencies:**
- Backend team available for API development (Week 3-4)
- QA team available for testing (Week 5)
- DevOps for deployment pipeline updates (Week 6)
