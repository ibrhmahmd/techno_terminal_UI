# Analytics API Alignment Implementation Plan

Complete audit and remediation plan to achieve 100% alignment between analytics API implementation and official documentation.

---

## Executive Summary

**Current State:** The analytics API implementation has significant type mismatches, missing fields, and undocumented features that cause build failures and runtime errors.

**Goal:** Zero-tolerance alignment with official API documentation - all schemas must match exactly, all undocumented code removed.

---

## Phase 1: Type System Alignment (Critical - Blocks Build)

### 1.1 Academic Types - `src/api/analytics/types/academic.ts`

**Discrepancy:** DashboardSummaryPublic missing `sessions` array; StudentProgressDTO has wrong fields.

**Current → Required:**
```typescript
// REMOVE: SessionSummaryPublic interface (undocumented)
// ADD to DashboardSummaryPublic:
export interface DashboardSummaryPublic {
  active_enrollments: number
  today_sessions_count: number
  sessions: SessionInfo[]  // MISSING
}

export interface SessionInfo {  // NEW - per docs/academic.md
  session_id: number
  session_date: string
  start_time: string
  end_time: string
  session_number: number
  level_number: number
  group_id: number
  course_name: string
  group_name: string
  instructor_name: string
  present: number
  absent: number
  unmarked: number
  total_enrolled: number
}

// REPLACE StudentProgressDTO:
export interface StudentProgressDTO {
  student_id: number
  student_name: string
  course_name: string
  group_name: string
  current_level: number
  total_sessions: number  // was: total_levels (WRONG)
  sessions_attended: number
  sessions_missed: number  // MISSING
  attendance_pct: number
  progress_status: 'on_track' | 'at_risk' | 'behind'  // MISSING
  estimated_completion_date: string  // MISSING
  enrollment_date: string  // MISSING
  last_attendance_date: string  // MISSING
}

// REPLACE CourseCompletionDTO:
export interface CourseCompletionDTO {
  course_id: number
  course_name: string
  started_count: number  // was: total_enrolled (WRONG)
  completed_count: number
  dropped_count: number
  in_progress_count: number
  completion_pct: number  // was: completion_rate (WRONG)
  avg_days_to_complete: number  // MISSING
}
```

### 1.2 BI Types - `src/api/analytics/types/bi.ts`

**Discrepancy:** RetentionAnalysisDTO has completely wrong structure per documentation.

**Current → Required:**
```typescript
// REPLACE RetentionAnalysisDTO:
export interface RetentionAnalysisDTO {
  cohort_month: string
  initial_enrollments: number
  retention_by_month: Record<string, string>  // e.g., {"Month 0": "100%", "Current": "88.5%"}
  retention_rates: {
    overall_retention_pct: number
  }
}
// REMOVE: retained_1m, retained_3m, retained_6m, retention_1m_pct, retention_3m_pct, retention_6m_pct
```

### 1.3 Financial Types - `src/api/analytics/types/financial.ts`

**Discrepancy:** RevenueMetricsDTO missing fields, RevenueForecastDTO has wrong field names.

**Current → Required:**
```typescript
// REPLACE RevenueMetricsDTO:
export interface RevenueMetricsDTO {
  period_start: string  // MISSING
  period_end: string  // MISSING
  total_revenue: number
  total_receipts: number  // MISSING
  avg_revenue_per_receipt: number  // MISSING
  previous_period_revenue: number  // MISSING
  revenue_change_pct: number  // MISSING
  trend_direction: 'up' | 'down' | 'flat'  // MISSING
  monthly_breakdown: RevenueByDateDTO[]  // MISSING
  // REMOVE: total_collected, total_outstanding, collection_rate, avg_revenue_per_student
}

// REPLACE RevenueForecastDTO:
export interface RevenueForecastDTO {
  month: string  // was: period (WRONG)
  predicted_revenue: number
  confidence_lower: number
  confidence_upper: number
}
```

### 1.4 OutstandingByGroupDTO - `src/api/analytics/types/financial.ts`

**Discrepancy:** Field name mismatch.

**Current → Required:**
```typescript
// REPLACE OutstandingByGroupDTO:
export interface OutstandingByGroupDTO {
  group_id: number
  group_name: string
  course_name: string  // MISSING
  students_with_balance: number  // was: student_count (WRONG)
  total_outstanding: number
}
```

---

## Phase 2: API Function Updates

### 2.1 Academic Module - `src/api/analytics/academic.ts`

**Add missing query parameters per documentation:**

```typescript
// REPLACE getStudentProgress:
export async function getStudentProgress(
  studentId?: number,  // ADD parameter
  groupId?: number  // ADD parameter
): Promise<StudentProgressDTO[]> {
  const params: Record<string, number> = {}
  if (studentId) params.student_id = studentId
  if (groupId) params.group_id = groupId
  
  const response = await client.get<ApiResponse<StudentProgressDTO[]>>(
    '/analytics/academics/student-progress',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data || []
}
```

### 2.2 BI Module - `src/api/analytics/bi.ts`

**Add missing query parameters:**

```typescript
// REPLACE getEnrollmentTrends:
export async function getEnrollmentTrends(cutoff?: string): Promise<EnrollmentTrendDTO[]> {
  const params: Record<string, string> = {}
  if (cutoff) params.cutoff = cutoff
  
  const response = await client.get<ApiResponse<EnrollmentTrendDTO[]>>(
    '/analytics/bi/enrollment-trend',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data || []
}

// REPLACE getRetentionAnalysis - ADD months parameter:
export async function getRetentionAnalysis(months?: number): Promise<RetentionAnalysisDTO[]> {
  const params: Record<string, number> = {}
  if (months) params.months = months
  
  const response = await client.get<ApiResponse<RetentionAnalysisDTO[]>>(
    '/analytics/bi/retention-analysis',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data || []
}

// REMOVE: getUserEngagement (undocumented endpoint)
```

### 2.3 Financial Module - `src/api/analytics/financial.ts`

**Add missing query parameters:**

```typescript
// REPLACE getRevenueMetrics:
export async function getRevenueMetrics(months?: number): Promise<RevenueMetricsDTO> {
  const params: Record<string, number> = {}
  if (months) params.months = months
  
  const response = await client.get<ApiResponse<RevenueMetricsDTO>>(
    '/analytics/finance/revenue-metrics',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data
}

// REPLACE getRevenueForecast - FIX parameter name:
export async function getRevenueForecast(monthsAhead?: number): Promise<RevenueForecastDTO[]> {
  const params: Record<string, number> = {}
  if (monthsAhead) params.months_ahead = monthsAhead  // FIX: was 'periods'
  
  const response = await client.get<ApiResponse<RevenueForecastDTO[]>>(
    '/analytics/finance/revenue-forecast',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data || []
}
```

---

## Phase 3: Barrel Export Cleanup

### 3.1 `src/api/analytics/index.ts`

**Remove undocumented exports:**

```typescript
// REMOVE from BI exports:
// getUserEngagement (undocumented endpoint)

// UPDATE export list:
export {
  getEnrollmentTrends,
  getInstructorPerformance,
  getRetentionMetrics,
  getRetentionFunnel,
  getInstructorValueMatrix,
  getScheduleUtilization,
  getFlightRiskStudents,
  // REMOVE: getUserEngagement
  getRetentionAnalysis,
} from './bi'
```

### 3.2 `src/api/analytics/types/index.ts`

**Remove undocumented type exports:**

```typescript
// REMOVE from academic types:
// SessionSummaryPublic (undocumented)

// REMOVE from bi types:
// UserEngagementDTO (undocumented)

// UPDATE export lists accordingly
```

---

## Phase 4: Reports Hooks Alignment

### 4.1 Hook Return Type Fix - All Hooks

**Add `isUsingMockData` property per ReportsPage.tsx expectations:**

**Files to modify:**
- `src/components/reports/hooks/useDashboardData.ts`
- `src/components/reports/hooks/useRevenueData.ts`
- `src/components/reports/hooks/useInstructorPerformance.ts`
- `src/components/reports/hooks/useStudentProgress.ts`
- `src/components/reports/hooks/useEnrollmentTrends.ts`

**Pattern for each hook:**
```typescript
// Add to interface:
interface UseXResult {
  // ... existing fields
  isUsingMockData: boolean  // ADD
}

// Add to return:
return {
  // ... existing fields
  isUsingMockData: false  // ADD - set true when using mock fallback
}
```

### 4.2 Remove Mock Data Fallback

**Decision:** Per zero-tolerance policy, remove all mock data fallbacks. Hooks should throw errors on API failure.

**Implementation:**
```typescript
// REMOVE mock data fallback logic from all hooks
// Hooks should only return real API data or error state
```

---

## Phase 5: Deprecation Cleanup

### 5.1 Remove Deprecated Reports API - `src/api/reports/`

**Files to delete:**
- `src/api/reports/reports.ts`
- `src/api/reports/types.ts`
- `src/api/reports/index.ts`

**Rationale:** Module marked deprecated, all functionality migrated to analytics API.

---

## File Checklist

### Modified Files (15)

| File | Change Type | Description |
|------|-------------|-------------|
| `src/api/analytics/types/academic.ts` | Major | Fix DashboardSummaryPublic, StudentProgressDTO, CourseCompletionDTO |
| `src/api/analytics/types/bi.ts` | Major | Fix RetentionAnalysisDTO, remove UserEngagementDTO |
| `src/api/analytics/types/financial.ts` | Major | Fix RevenueMetricsDTO, RevenueForecastDTO, OutstandingByGroupDTO |
| `src/api/analytics/types/index.ts` | Minor | Update exports |
| `src/api/analytics/academic.ts` | Minor | Add query params to getStudentProgress |
| `src/api/analytics/bi.ts` | Minor | Add query params, remove getUserEngagement |
| `src/api/analytics/financial.ts` | Minor | Add query params, fix parameter names |
| `src/api/analytics/index.ts` | Minor | Remove getUserEngagement export |
| `src/components/reports/hooks/useDashboardData.ts` | Minor | Add isUsingMockData (or remove mock fallback) |
| `src/components/reports/hooks/useRevenueData.ts` | Minor | Add isUsingMockData (or remove mock fallback) |
| `src/components/reports/hooks/useInstructorPerformance.ts` | Minor | Add isUsingMockData (or remove mock fallback) |
| `src/components/reports/hooks/useStudentProgress.ts` | Minor | Add isUsingMockData (or remove mock fallback) |
| `src/components/reports/hooks/useEnrollmentTrends.ts` | Minor | Add isUsingMockData (or remove mock fallback) |

### Deleted Files (3)

| File | Reason |
|------|--------|
| `src/api/reports/reports.ts` | Deprecated, functionality migrated |
| `src/api/reports/types.ts` | Deprecated |
| `src/api/reports/index.ts` | Deprecated |

---

## Implementation Order (Dependency-Based)

1. **Phase 1.1-1.4** - Type fixes (foundational, no dependencies)
2. **Phase 3** - Barrel exports (depends on types)
3. **Phase 2** - API functions (depends on types)
4. **Phase 4** - Hooks alignment (depends on API functions)
5. **Phase 5** - Deprecation cleanup (can be done anytime after Phase 4)

---

## Verification Steps

After each phase:
```bash
npx tsc --noEmit
```

Full verification:
```bash
npm run build
```

---

## Documentation Compliance Summary

| Module | Endpoints | Status |
|--------|-----------|--------|
| Academic | 6/6 | Aligned after Phase 1+2 |
| BI | 8/9 | Aligned after Phase 1+2 (getUserEngagement removed) |
| Competition | 1/1 | Already aligned |
| Financial | 6/6 | Aligned after Phase 1+2 |

**Total: 21 documented endpoints, 0 undocumented endpoints after completion.**
