# Pagination Implementation Plan

## Overview
This document outlines the plan to refactor pagination logic across the codebase to use shared types and follow SOLID principles.

## API Schema Reference

Based on `docs/api/academics.md` and `docs/api/crm.md`, the API uses this pagination envelope:

```json
{
  "success": true,
  "data": [],
  "total": 0,
  "skip": 0,
  "limit": 50
}
```

### Endpoints Using Pagination


| Endpoint | Response Type | File |
|----------|---------------|------|
| `GET /academics/groups` | `PaginatedResponse<GroupListItem>` | academics.ts |
| `GET /academics/courses` | `PaginatedResponse<CoursePublic>` | academics.ts |
| `GET /crm/parents` | `PaginatedResponse<ParentListItem>` | crm.ts |
| `GET /crm/students` | `PaginatedResponse<StudentListItem>` | crm.ts |
| `GET /hr/employees` | `PaginatedResponse<EmployeeListItem>` | hr.ts |

## Files to Modify

### 1. Shared Types
**File:** `app/src/types/pagination.ts`

**Current Content:**
```typescript
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  skip: number
  limit: number
}
```

**Additions Needed:**
```typescript
export interface PaginationResult<T> {
  items: T[]
  total: number
  hasMore: boolean
}

export interface PaginationParams {
  skip?: number
  limit?: number
  q?: string  // for search queries
}

export interface PaginationState {
  skip: number
  limit: number
  total: number
  hasMore: boolean
  isLoading: boolean
}
```

### 2. API Layer - Academics
**File:** `app/src/api/academics.ts`

**Current Issues:**
- `PaginatedGroupsResponse` defined locally with wrong structure (was expecting `{ items: [] }`)
- No `getCourses` function
- Functions return raw arrays instead of `PaginationResult`

**Changes Required:**

1. Import shared types:
```typescript
import type { PaginatedResponse, PaginationParams, PaginationResult } from '../types/pagination'
```

2. Replace `PaginatedGroupsResponse`:
```typescript
// Remove old interface (lines 136-142)
// Replace with:
export type PaginatedGroupsResponse = PaginatedResponse<Group>
export type PaginatedCoursesResponse = PaginatedResponse<Course>
```

3. Update `getGroups` function (lines 144-150):
```typescript
export async function getGroups(
  params: PaginationParams = {}
): Promise<PaginationResult<Group>> {
  const { skip = 0, limit = 100 } = params
  const response = await client.get<{ data: PaginatedGroupsResponse }>(
    '/academics/groups',
    { params: { skip, limit } }
  )
  const data = response.data.data || []
  return {
    items: data,
    total: response.data.total || 0,
    hasMore: (response.data.total || 0) > (skip + data.length)
  }
}
```

4. Add `getCourses` function:
```typescript
export async function getCourses(
  params: PaginationParams = {}
): Promise<PaginationResult<Course>> {
  const { skip = 0, limit = 100 } = params
  const response = await client.get<{ data: PaginatedCoursesResponse }>(
    '/academics/courses',
    { params: { skip, limit } }
  )
  const data = response.data.data || []
  return {
    items: data,
    total: response.data.total || 0,
    hasMore: (response.data.total || 0) > (skip + data.length)
  }
}
```

### 3. API Layer - CRM
**File:** `app/src/api/crm.ts`

**Changes Required:**

1. Import shared types:
```typescript
import type { PaginatedResponse, PaginationParams, PaginationResult } from '../types/pagination'
```

2. Add paginated response types (after line 20):
```typescript
export type PaginatedStudentsResponse = PaginatedResponse<Student>
export type PaginatedParentsResponse = PaginatedResponse<Parent>
```

3. Update `getStudents` function (lines 44-49):
```typescript
export async function getStudents(
  params: PaginationParams = {}
): Promise<PaginationResult<Student>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<{ data: PaginatedStudentsResponse }>(
    '/crm/students',
    { params: { skip, limit } }
  )
  const data = response.data.data || []
  return {
    items: data,
    total: response.data.total || 0,
    hasMore: (response.data.total || 0) > (skip + data.length)
  }
}
```

4. Update `getParents` function (lines 78-83):
```typescript
export async function getParents(
  params: PaginationParams = {}
): Promise<PaginationResult<Parent>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<{ data: PaginatedParentsResponse }>(
    '/crm/parents',
    { params: { skip, limit } }
  )
  const data = response.data.data || []
  return {
    items: data,
    total: response.data.total || 0,
    hasMore: (response.data.total || 0) > (skip + data.length)
  }
}
```

5. Update `searchStudents` function:
```typescript
export async function searchStudents(
  name: string,
  params: Omit<PaginationParams, 'q'> = {}
): Promise<PaginationResult<Student>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<{ data: PaginatedStudentsResponse }>(
    '/crm/students',
    { params: { name, skip, limit } }
  )
  const data = response.data.data || []
  return {
    items: data,
    total: response.data.total || 0,
    hasMore: (response.data.total || 0) > (skip + data.length)
  }
}
```

6. Update `searchParents` function:
```typescript
export async function searchParents(
  name: string,
  params: Omit<PaginationParams, 'q'> = {}
): Promise<PaginationResult<Parent>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<{ data: PaginatedParentsResponse }>(
    '/crm/parents',
    { params: { name, skip, limit } }
  )
  const data = response.data.data || []
  return {
    items: data,
    total: response.data.total || 0,
    hasMore: (response.data.total || 0) > (skip + data.length)
  }
}
```

### 4. API Layer - HR
**File:** `app/src/api/hr.ts`

**Changes Required:**

1. Import shared types:
```typescript
import type { PaginatedResponse, PaginationParams, PaginationResult } from '../types/pagination'
```

2. Add paginated response type:
```typescript
export type PaginatedEmployeesResponse = PaginatedResponse<Employee>
```

3. Update `getEmployees` function:
```typescript
export async function getEmployees(
  params: PaginationParams = {}
): Promise<PaginationResult<Employee>> {
  const { skip = 0, limit = 50 } = params
  const response = await client.get<{ data: PaginatedEmployeesResponse }>(
    '/hr/employees',
    { params: { skip, limit } }
  )
  const data = response.data.data || []
  return {
    items: data,
    total: response.data.total || 0,
    hasMore: (response.data.total || 0) > (skip + data.length)
  }
}
```

### 5. Reusable Hook
**File:** `app/src/hooks/usePagination.ts` (NEW)

**Purpose:** Abstract pagination logic following Single Responsibility Principle

```typescript
import { useState, useCallback, useRef } from 'react'
import type { PaginationParams, PaginationResult } from '../types/pagination'

type FetchFunction<T> = (params: PaginationParams) => Promise<PaginationResult<T>>

interface UsePaginationOptions {
  initialLimit?: number
  initialSkip?: number
}

interface UsePaginationReturn<T> {
  items: T[]
  total: number
  isLoading: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
}

export function usePagination<T>(
  fetchFn: FetchFunction<T>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialLimit = 20, initialSkip = 0 } = options
  
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const skipRef = useRef(initialSkip)

  const loadMore = useCallback(async (reset = false) => {
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const skip = reset ? initialSkip : skipRef.current
      const result = await fetchFn({ skip, limit: initialLimit })
      
      setItems(prev => reset ? result.items : [...prev, ...result.items])
      setTotal(result.total)
      setHasMore(result.hasMore)
      skipRef.current = skip + result.items.length
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, initialLimit, initialSkip, isLoading])

  const refresh = useCallback(async () => {
    skipRef.current = initialSkip
    await loadMore(true)
  }, [loadMore, initialSkip])

  const reset = useCallback(() => {
    setItems([])
    setTotal(0)
    setHasMore(true)
    setError(null)
    skipRef.current = initialSkip
  }, [initialSkip])

  return {
    items,
    total,
    isLoading,
    hasMore,
    error,
    loadMore: () => loadMore(false),
    refresh,
    reset
  }
}
```

### 6. Page Components

#### 6.1 GroupsPage.tsx
**File:** `app/src/pages/GroupsPage.tsx`

**Current State:** Uses `getGroups()` returning `Group[]`

**Changes Required:**

1. Update imports:
```typescript
import { getGroups, type Group, type PaginationResult } from '../api/academics'
```

2. Update state:
```typescript
// From:
const [groups, setGroups] = useState<Group[]>([])

// To:
const [groupsData, setGroupsData] = useState<PaginationResult<Group>>({
  items: [],
  total: 0,
  hasMore: false
})
```

3. Update load function:
```typescript
// From:
async function loadGroups() {
  const data = await getGroups()
  setGroups(data)
}

// To:
async function loadGroups() {
  const data = await getGroups({ skip: 0, limit: 100 })
  setGroupsData(data)
}
```

4. Update references:
- `groups.map(...)` → `groupsData.items.map(...)`
- `groups.length` → `groupsData.items.length`
- `groups.find(...)` → `groupsData.items.find(...)`

#### 6.2 DirectoryPage.tsx
**File:** `app/src/pages/DirectoryPage.tsx`

**Current State:** Has 8 matches for pagination-related code

**Changes Required:**
- Update `getStudents` usage to handle `PaginationResult<Student>`
- Update `getParents` usage to handle `PaginationResult<Parent>`
- Update `searchStudents` usage
- Update `searchParents` usage

#### 6.3 StaffPage.tsx
**File:** `app/src/pages/StaffPage.tsx`

**Current State:** Uses `getEmployees()` returning `Employee[]`

**Changes Required:**
- Update to use `PaginationResult<Employee>`
- Update state and references

#### 6.4 DashboardPage.tsx
**File:** `app/src/pages/DashboardPage.tsx`

**Current State:** Uses `getGroups()` for daily schedule

**Changes Required:**
- Update to use `PaginationResult<Group>`
- May need to extract `items` for backward compatibility

#### 6.5 GroupDetailPage.tsx
**File:** `app/src/pages/GroupDetailPage.tsx`

**Current State:** Uses `getGroupDetails`, `getGroupSessions`

**Note:** This page doesn't use paginated endpoints directly, but imports from academics.ts.

## Implementation Order

### Phase 1: Foundation
1. ✅ Create `app/src/types/pagination.ts` (already done)
2. Update `app/src/types/pagination.ts` with additional interfaces

### Phase 2: API Layer
3. Update `app/src/api/academics.ts`
4. Update `app/src/api/crm.ts`
5. Update `app/src/api/hr.ts`

### Phase 3: Hooks
6. Create `app/src/hooks/usePagination.ts`

### Phase 4: Pages
7. Update `app/src/pages/GroupsPage.tsx`
8. Update `app/src/pages/DirectoryPage.tsx`
9. Update `app/src/pages/StaffPage.tsx`
10. Update `app/src/pages/DashboardPage.tsx`

## SOLID Principles Applied

| Principle | Application |
|-----------|-------------|
| **Single Responsibility** | `usePagination` hook only handles pagination logic |
| **Open/Closed** | New entities can use pagination without modifying existing code |
| **Liskov Substitution** | `PaginationResult<T>` works for any entity type |
| **Interface Segregation** | `PaginationParams` is minimal and focused |
| **Dependency Inversion** | Pages depend on `PaginationResult` abstraction, not concrete API |

## Testing Checklist

After each phase:
- [ ] TypeScript compilation passes
- [ ] No runtime errors in console
- [ ] Data loads correctly
- [ ] Pagination controls work (if applicable)
- [ ] Search functionality preserved

## Rollback Strategy

If issues arise:
1. Revert to commit before pagination changes
2. Or, temporarily use `.items` extraction in components while fixing API layer

## Migration Timeline

| Phase | Estimated Time | Risk Level |
|-------|---------------|------------|
| Phase 1 (Types) | 15 min | Low |
| Phase 2 (API) | 45 min | Medium |
| Phase 3 (Hook) | 30 min | Low |
| Phase 4 (Pages) | 60 min | High |
| Testing | 30 min | - |
| **Total** | **~3 hours** | - |

---

## Backward Compatibility & UI Logic

### Strategy Overview

To prevent breaking existing components, we use a **dual-export pattern** and **phased UI migration**.

### API Layer Compatibility

Each API exports two versions:

```typescript
// NEW: Returns full pagination result
export async function getGroupsPaginated(
  params: PaginationParams = {}
): Promise<PaginationResult<Group>> { ... }

// LEGACY (deprecated): Returns raw array
/** @deprecated Use getGroupsPaginated instead */
export async function getGroups(skip = 0, limit = 100): Promise<Group[]> {
  const result = await getGroupsPaginated({ skip, limit })
  return result.items
}
```

### UI Migration Phases

#### Phase A: State Adaptation (No Breaking Changes)
Components wrap new API to maintain existing state:

```typescript
// GroupsPage.tsx - Phase A
import { getGroupsPaginated } from '../api/academics'

const [groups, setGroups] = useState<Group[]>([])
const [totalGroups, setTotalGroups] = useState(0)

async function loadGroups() {
  const result = await getGroupsPaginated({ skip: 0, limit: 100 })
  setGroups(result.items)  // Existing code works
  setTotalGroups(result.total)  // New: can show count
}
```

#### Phase B: Enhanced UI (Add Pagination Controls)
Add UI without breaking existing functionality:

```typescript
const [currentPage, setCurrentPage] = useState(0)
const pageSize = 20

async function loadGroups(page: number = 0) {
  const skip = page * pageSize
  const result = await getGroupsPaginated({ skip, limit: pageSize })
  setGroups(result.items)
  setTotalGroups(result.total)
  setHasMore(result.hasMore)
  setCurrentPage(page)
}

// In render:
{totalGroups > pageSize && (
  <PaginationControls
    currentPage={currentPage}
    total={totalGroups}
    pageSize={pageSize}
    onPageChange={loadGroups}
  />
)}
```

#### Phase C: Full Migration (usePagination Hook)

```typescript
import { usePagination } from '../hooks/usePagination'

function GroupsPage() {
  const { items: groups, total, isLoading, hasMore, loadMore } = 
    usePagination(getGroupsPaginated, { initialLimit: 20 })
  
  return (
    <div>
      <p>Showing {groups.length} of {total} groups</p>
      {groups.map(g => <GroupCard key={g.id} group={g} />)}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  )
}
```

### UI Components to Update

| Component | Current | Phase | Changes |
|-----------|---------|-------|---------|
| `GroupsPage.tsx` | `getGroups()` → `Group[]` | A → B | Add count display, pagination |
| `DirectoryPage.tsx` | `getStudents/Parents()` | A → B | Per-tab pagination |
| `StaffPage.tsx` | `getEmployees()` → `Employee[]` | A → B | Table pagination controls |
| `DashboardPage.tsx` | `getGroups()` for schedule | A only | No changes needed |

### Shared Pagination Controls

**File:** `app/src/components/common/PaginationControls.tsx`

```typescript
interface PaginationControlsProps {
  currentPage: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export function PaginationControls({ 
  currentPage, total, pageSize, onChange 
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        Previous
      </button>
      <span>Page {currentPage + 1} of {totalPages}</span>
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next
      </button>
    </div>
  )
}
```

### Page-Specific Code Changes

#### GroupsPage.tsx

**Phase A Addition:**
```typescript
// Add to state
const [totalGroups, setTotalGroups] = useState(0)

// Update load function
async function loadGroups() {
  const result = await getGroupsPaginated({ skip: 0, limit: 100 })
  setGroups(result.items)
  setTotalGroups(result.total)
}

// Add header display
<div className="flex justify-between">
  <h2>Groups</h2>
  <span>{totalGroups} total</span>
</div>
```

#### DirectoryPage.tsx

**Phase A Addition:**
```typescript
const [studentsData, setStudentsData] = useState({ 
  items: [] as Student[], 
  total: 0 
})

async function loadStudents() {
  const result = await getStudentsPaginated({ skip: 0, limit: 50 })
  setStudentsData(result)
}

// Use studentsData.items instead of students
// Use studentsData.total for count display
```

#### StaffPage.tsx

**Phase A Addition:**
```typescript
const [employees, setEmployees] = useState<Employee[]>([])
const [totalEmployees, setTotalEmployees] = useState(0)

async function loadEmployees() {
  const result = await getEmployeesPaginated({ skip: 0, limit: 100 })
  setEmployees(result.items)
  setTotalEmployees(result.total)
}

// Add footer after table
<div className="flex justify-between">
  <span>Showing {employees.length} of {totalEmployees}</span>
</div>
```

### Testing Checklist per Page

- [ ] Existing component props unchanged
- [ ] Existing state variables still work
- [ ] Render output identical before pagination added
- [ ] No TypeScript errors
- [ ] Loading states preserved
- [ ] Error handling preserved

### Updated Migration Timeline

| Phase | Files | Time | Risk |
|-------|-------|------|------|
| API Layer (dual export) | 3 files | 45 min | Low |
| Phase A (counts only) | 4 pages | 30 min | Very Low |
| Phase B (pagination UI) | 3 pages + component | 60 min | Medium |
| Phase C (usePagination) | 4 pages | 60 min | Medium |
| Testing | All | 45 min | - |
| **Total** | - | **~4 hours** | - |

---

## Cleanup Strategy - Remove Redundancy

### Redundant Code to Remove

After migration is complete and verified, remove the following:

#### 1. API Files - Remove Old Interfaces
**After all pages migrate to Phase C:**

| File | Code to Remove | Lines |
|------|---------------|-------|
| `api/academics.ts` | `PaginatedGroupsResponse` (old definition) | ~5 lines |
| `api/academics.ts` | `PaginatedCoursesResponse` (if duplicated) | ~1 line |
| `api/crm.ts` | Local pagination interfaces | ~4 lines |
| `api/hr.ts` | Local pagination interfaces | ~2 lines |

#### 2. Remove Deprecated Legacy Functions
**After all pages use `usePagination` hook:**

Remove these deprecated functions:
- `getGroups()` → use `getGroupsPaginated()`
- `getCourses()` → use `getCoursesPaginated()`
- `getStudents()` → use `getStudentsPaginated()`
- `getParents()` → use `getParentsPaginated()`
- `getEmployees()` → use `getEmployeesPaginated()`

#### 3. Remove Duplicate Type Definitions
**Consolidate into `types/pagination.ts`:**

- Remove any `PaginatedResponse` definitions in API files
- Remove any `PaginationParams` duplicates
- Remove any `PaginationResult` duplicates

### Cleanup Checklist

- [ ] All pages migrated to Phase C (using `usePagination`)
- [ ] No imports of legacy functions remaining
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run lint` - no warnings about deprecated functions
- [ ] Remove legacy function exports
- [ ] Remove duplicate type definitions
- [ ] Update `types/pagination.ts` exports if needed
- [ ] Final test - all functionality works

---

## Complete File Checklist

### NEW Files to Create

| # | File Path | Purpose | Lines (est) |
|---|-----------|---------|-------------|
| 1 | `app/src/types/pagination.ts` | Shared pagination types | ~30 |
| 2 | `app/src/hooks/usePagination.ts` | Reusable pagination hook | ~80 |
| 3 | `app/src/components/common/PaginationControls.tsx` | Pagination UI component | ~40 |

### MODIFIED Files - Detailed Changes

#### API Layer (3 files)

| # | File | Changes | Lines Added | Lines Removed |
|---|------|---------|-------------|---------------|
| 4 | `app/src/api/academics.ts` | Add `getGroupsPaginated`, `getCoursesPaginated`, update `getGroups` as deprecated wrapper, import shared types | +45 | -5 |
| 5 | `app/src/api/crm.ts` | Add `getStudentsPaginated`, `getParentsPaginated`, update search functions, import shared types | +40 | -4 |
| 6 | `app/src/api/hr.ts` | Add `getEmployeesPaginated`, import shared types | +25 | -2 |

**Specific changes per file:**

**academics.ts:**
- [ ] Import `PaginationParams`, `PaginationResult` from `../types/pagination`
- [ ] Change `PaginatedGroupsResponse` to use `PaginatedResponse<Group>`
- [ ] Create `PaginatedCoursesResponse` type alias
- [ ] Add `getGroupsPaginated()` function (new)
- [ ] Modify `getGroups()` to call `getGroupsPaginated()` and return `.items`
- [ ] Add `@deprecated` JSDoc to `getGroups()`
- [ ] Add `getCoursesPaginated()` function (new)

**crm.ts:**
- [ ] Import `PaginationParams`, `PaginationResult` from `../types/pagination`
- [ ] Create `PaginatedStudentsResponse` type alias
- [ ] Create `PaginatedParentsResponse` type alias
- [ ] Add `getStudentsPaginated()` function (new)
- [ ] Modify `getStudents()` to call `getStudentsPaginated()` and return `.items`
- [ ] Add `@deprecated` JSDoc to `getStudents()`
- [ ] Add `getParentsPaginated()` function (new)
- [ ] Modify `getParents()` to call `getParentsPaginated()` and return `.items`
- [ ] Add `@deprecated` JSDoc to `getParents()`
- [ ] Update `searchStudents()` to return `PaginationResult`
- [ ] Update `searchParents()` to return `PaginationResult`

**hr.ts:**
- [ ] Import `PaginationParams`, `PaginationResult` from `../types/pagination`
- [ ] Create `PaginatedEmployeesResponse` type alias
- [ ] Add `getEmployeesPaginated()` function (new)
- [ ] Modify `getEmployees()` to call `getEmployeesPaginated()` and return `.items`
- [ ] Add `@deprecated` JSDoc to `getEmployees()`

#### Page Components (5 files)

| # | File | Changes | Lines Added | Lines Removed |
|---|------|---------|-------------|---------------|
| 7 | `app/src/pages/GroupsPage.tsx` | Add `totalGroups` state, update load function, add count display | +15 | -2 |
| 8 | `app/src/pages/DirectoryPage.tsx` | Add total counts for students/parents, update state structure | +20 | -5 |
| 9 | `app/src/pages/StaffPage.tsx` | Add `totalEmployees` state, update load function, add count display | +15 | -2 |
| 10 | `app/src/pages/DashboardPage.tsx` | Minimal changes - just verify imports | +2 | -0 |
| 11 | `app/src/pages/GroupDetailPage.tsx` | Verify no breaking changes from academics.ts updates | +0 | -0 |

**Specific changes per file:**

**GroupsPage.tsx:**
- [ ] Change import to use `getGroupsPaginated` alongside `getGroups`
- [ ] Add `totalGroups` state variable
- [ ] Update `loadGroups()` to use `getGroupsPaginated` and set both `groups` and `totalGroups`
- [ ] Add header display showing total count
- [ ] (Phase B) Add pagination controls

**DirectoryPage.tsx:**
- [ ] Change imports to use paginated versions
- [ ] Change `students` state to `studentsData` with `{ items, total }` structure
- [ ] Change `parents` state to `parentsData` with `{ items, total }` structure
- [ ] Update `loadStudents()` to use `getStudentsPaginated`
- [ ] Update `loadParents()` to use `getParentsPaginated`
- [ ] Update all `students.map()` to `studentsData.items.map()`
- [ ] Update all `parents.map()` to `parentsData.items.map()`
- [ ] Add count displays for both tabs
- [ ] (Phase B) Add pagination controls per tab

**StaffPage.tsx:**
- [ ] Change import to use `getEmployeesPaginated`
- [ ] Add `totalEmployees` state variable
- [ ] Update `loadEmployees()` to use `getEmployeesPaginated`
- [ ] Add footer showing count display
- [ ] (Phase B) Add pagination controls

**DashboardPage.tsx:**
- [ ] Verify `getGroups()` import still works (backward compatible)
- [ ] No state changes needed (uses legacy function during Phase A)

**GroupDetailPage.tsx:**
- [ ] Verify imports from `academics.ts` still work
- [ ] No changes expected (doesn't use paginated endpoints directly)

### Summary Statistics

| Category | Count | Lines Added | Lines Removed | Net Change |
|----------|-------|-------------|---------------|------------|
| **NEW Files** | 3 | 150 | 0 | +150 |
| **API Layer** | 3 | 110 | 11 | +99 |
| **Page Components** | 5 | 52 | 9 | +43 |
| **TOTAL** | **11** | **312** | **20** | **+292** |

### Post-Migration Cleanup (Future Phase)

After all pages are on Phase C:

| # | File | Cleanup Action | Lines Removed |
|---|------|---------------|---------------|
| 12 | `app/src/api/academics.ts` | Remove deprecated `getGroups()` | -10 |
| 13 | `app/src/api/crm.ts` | Remove deprecated `getStudents()`, `getParents()` | -20 |
| 14 | `app/src/api/hr.ts` | Remove deprecated `getEmployees()` | -10 |
| 15 | `app/src/types/pagination.ts` | Remove any unused type exports | -5 |
| **TOTAL** | 4 files | Remove legacy code | **-45** |

### Final Net Change (After Cleanup)

| Category | Lines |
|----------|-------|
| Initial Implementation | +292 |
| Cleanup Phase | -45 |
| **Final Net** | **+247** |

---

## Implementation Progress

### ✅ COMPLETED Phases 1-6

| Phase | Status | Notes |
|-------|--------|-------|
| **Phase 1** | ✅ | Shared pagination types created in `types/pagination.ts` |
| **Phase 2** | ✅ | API layer updated with dual export pattern - backward compatible |
| **Phase 3** | ✅ | `usePagination` hook and `PaginationControls` component created |
| **Phase 4** | ✅ | Pages updated (GroupsPage, DirectoryPage, StaffPage) to use paginated APIs and display counts |
| **Phase 5** | ✅ | Pagination controls added to all pages with server-side pagination |
| **Phase 6** | ✅ | StaffPage refactored to use `usePagination` hook with refresh capability |

**All pages now have working pagination:**
- GroupsPage: Server pagination with sorting and search
- DirectoryPage: Tab-based pagination for students/parents
- StaffPage: Uses `usePagination` hook with auto-refresh on mutations

**Build Status:** ✅ Pagination-related code compiles successfully

---

## Next Phase: Phase 7 - Cleanup Deprecated Code

### Goal
Add interactive pagination controls to pages for navigating between pages of data.

### Changes Required

#### GroupsPage.tsx
- Add `currentPage` state
- Add `PaginationControls` component at bottom of list
- Update `loadGroups()` to use pagination params
- Add `onPageChange` handler

#### DirectoryPage.tsx  
- Add `currentPage` state per tab (students/parents)
- Add `PaginationControls` per tab
- Update tab switch to reset page

#### StaffPage.tsx
- Add `currentPage` state
- Add `PaginationControls` at bottom of table
- Update `loadData()` to use pagination

### Files to Modify
| # | File | Changes |
|---|------|---------|
| 1 | `GroupsPage.tsx` | Add pagination state + controls |
| 2 | `DirectoryPage.tsx` | Add per-tab pagination controls |
| 3 | `StaffPage.tsx` | Add pagination controls |

---

## Implementation Order

### Phase 1: Foundation (NO RISK)
```
1. Create app/src/types/pagination.ts
2. Verify TypeScript compilation
```

### Phase 2: API Layer (LOW RISK - Dual Export)
```
3. Update app/src/api/academics.ts
4. Update app/src/api/crm.ts
5. Update app/src/api/hr.ts
6. Run build, verify no errors
7. Test that existing pages still work
```

### Phase 3: Hook & Component (LOW RISK)
```
8. Create app/src/hooks/usePagination.ts
9. Create app/src/components/common/PaginationControls.tsx
10. Test hook in isolation
```

### Phase 4: Pages Phase A (VERY LOW RISK)
```
11. Update GroupsPage.tsx - Add total count only
12. Update DirectoryPage.tsx - Add total counts
13. Update StaffPage.tsx - Add total count
14. Test all pages load correctly
15. Verify counts display properly
```

### Phase 5: Pages Phase B (MEDIUM RISK)
```
16. Add PaginationControls to GroupsPage.tsx
17. Add per-tab PaginationControls to DirectoryPage.tsx
18. Add PaginationControls to StaffPage.tsx
19. Test pagination functionality
```

### Phase 6: Pages Phase C (MEDIUM RISK)
```
20. Refactor GroupsPage.tsx to use usePagination hook
21. Refactor DirectoryPage.tsx to use usePagination hook
22. Refactor StaffPage.tsx to use usePagination hook
23. Full integration testing
```

### Phase 7: Cleanup (AFTER VERIFICATION)
```
24. Remove deprecated legacy functions from APIs
25. Remove unused type definitions
26. Final build and test
```

---

## Risk Mitigation per File

| File | Risk Level | Mitigation Strategy |
|------|------------|---------------------|
| `types/pagination.ts` | None | New file, no existing dependencies |
| `hooks/usePagination.ts` | Low | New file, opt-in usage |
| `PaginationControls.tsx` | Low | New file, opt-in usage |
| `api/academics.ts` | Low | Dual export maintains compatibility |
| `api/crm.ts` | Low | Dual export maintains compatibility |
| `api/hr.ts` | Low | Dual export maintains compatibility |
| `GroupsPage.tsx` | Very Low | Phase A: only adds count display |
| `DirectoryPage.tsx` | Very Low | Phase A: state structure change |
| `StaffPage.tsx` | Very Low | Phase A: only adds count display |
| `DashboardPage.tsx` | None | No changes, backward compatible import |
| `GroupDetailPage.tsx` | None | No changes, verify imports work |

---

## Testing Strategy

### Per Phase Testing

**Phase 1-2 (Types & API):**
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] All existing pages load without errors
- [ ] Console shows no TypeScript warnings

**Phase 3 (Hook & Component):**
- [ ] Hook unit test (if test framework available)
- [ ] Component renders without errors
- [ ] Props accepted correctly

**Phase 4 (Pages Phase A):**
- [ ] Each page loads data correctly
- [ ] Total counts display accurately
- [ ] No console errors
- [ ] UI looks correct (no layout breaks)

**Phase 5 (Pages Phase B):**
- [ ] Pagination controls render correctly
- [ ] Previous/Next buttons work
- [ ] Page numbers update correctly
- [ ] Data updates when page changes
- [ ] Edge cases (first page, last page)

**Phase 6 (Pages Phase C):**
- [ ] Hook integrates correctly
- [ ] Load more functionality works
- [ ] Refresh functionality works
- [ ] Reset functionality works
- [ ] Loading states display correctly

**Phase 7 (Cleanup):**
- [ ] Build passes after removing legacy code
- [ ] No runtime errors
- [ ] All functionality preserved
