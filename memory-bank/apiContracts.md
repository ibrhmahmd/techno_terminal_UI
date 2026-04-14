# API Contracts - TechnoTerminal CRM

Document of discovered API contract patterns, field mappings, and type definitions discovered during backend integration.

**Created**: April 8, 2026  
**Purpose**: Record API response structures to prevent future type mismatches

---

## Response Patterns

### Pattern 1: Standard Success Response
Used by: Auth, CRM, most single-item endpoints

```json
{
  "success": true,
  "data": { ... },
  "message": null
}
```

**TypeScript:**
```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string | null
}
```

### Pattern 2: Paginated Response
Used by: Groups list, Competitions list

```json
{
  "data": [ ... ],
  "total": 100,
  "skip": 0,
  "limit": 50
}
```

**Note**: Does NOT include `success` field - just the data wrapper with pagination.

**TypeScript:**
```typescript
interface PaginatedResponse<T> {
  data: T[]
  total: number
  skip: number
  limit: number
}
```

### Pattern 3: Data Wrapper Response
Used by: Some endpoints return `{ data: T }` without `success` flag

```json
{
  "data": { ... }
}
```

---

## Field Name Mappings

### Competitions Module (Critical Mismatch - April 8, 2026)

**Frontend Originally Expected:**
| Field | Type | Purpose |
|-------|------|---------|
| `id` | `string` | UUID identifier |
| `name` | `string` | Competition name |
| `description` | `string` | Description text |
| `location` | `string` | Location |
| `start_date` | `string` | Start date (ISO) |
| `end_date` | `string` | End date (ISO) |
| `registration_deadline` | `string` | Registration deadline |
| `status` | `'upcoming' \| 'active' \| 'completed' \| 'cancelled'` | Competition status |
| `registered_teams` | `number` | Count of registered teams |
| `total_participants` | `number` | Total participants |
| `fee_per_participant` | `number` | Fee in EGP |
| `max_teams` | `number` | Maximum teams allowed |

**Backend Actually Returns:**
| Field | Type | Purpose |
|-------|------|---------|
| `id` | `number` | Integer identifier (NOT UUID) |
| `name` | `string` | Competition name |
| `edition` | `string \| null` | Edition (e.g., "2024", "Summer") |
| `competition_date` | `string \| null` | Single date (replaces start/end) |
| `location` | `string` | Location |
| `notes` | `string \| null` | Notes (replaces description) |
| `fee_per_student` | `number` | Fee in EGP (per student, not participant) |
| `created_at` | `string` | Creation timestamp |

**Missing from Backend:**
- `status` - Not provided by API
- `registered_teams` - Not provided by API
- `total_participants` - Not provided by API
- `start_date` - Use `competition_date` instead
- `end_date` - Not provided
- `registration_deadline` - Not provided
- `max_teams` - Not provided
- `fee_per_participant` - Use `fee_per_student`
- `description` - Use `notes`

### Groups Module (Resolved April 8, 2026)

**Issue**: Groups table status showing all as "Archived"

**Root Cause**: API migrated from `is_active: boolean` to `status: 'active' | 'archived'` enum, but frontend was still using `is_active`.

**Resolution**: Updated `GroupsPage.tsx` to use `group.status` instead of `group.is_active`.

### Group Levels (Resolved April 8, 2026)

**Issue**: "Add Level" button not working

**Root Cause**: `getGroupLevels` expected flat array response, but backend returns `PaginatedResponse<Level>`.

**Resolution**: Updated `app/src/api/academics/groups/lifecycle.ts`:
```typescript
// Before (wrong):
const response = await client.get<GroupLevel[]>(`/academics/groups/${groupId}/levels`)
return response.data

// After (correct):
const response = await client.get<{ data: GroupLevel[] }>(`/academics/groups/${groupId}/levels`)
return response.data.data || []
```

### Student API Modularization (Implemented April 12, 2026)

**Architecture Change**: Refactored monolithic `crm.ts` into modular `crm/students/` structure following groups pattern.

**Module Organization**:
```
api/crm/students/
├── core.ts          # CRUD: getStudentById, createStudent, updateStudent, deleteStudent
├── finance.ts       # Balance: getStudentBalance, getEnrollmentBalance, getUnpaidEnrollments
├── status.ts        # Status: updateStudentStatus, setWaitingPriority, getStatusSummary
├── history.ts       # History: getStatusHistory, getAttendanceHistory
├── siblings.ts      # Siblings: getStudentSiblings, linkSibling, unlinkSibling
├── search.ts        # Search: searchStudents, searchStudentsAdvanced
├── utils.ts         # Helpers: getStatusColorClass, getStatusLabel, calculateAge
└── types/           # Organized type definitions
    ├── models.ts    # Student, Parent, StudentWithDetails, EnrollmentInfo
    ├── finance.ts   # StudentBalance, EnrollmentBalance
    ├── history.ts   # StatusHistoryRecord, AttendanceHistoryRecord
    ├── inputs.ts    # CreateStudentDTO, UpdateStudentDTO
    └── index.ts     # Type exports
```

**Type Export Pattern** (Critical Fix):
```typescript
// CORRECT - prevents import resolution issues
export { type Student, type StudentBalance } from './types'

// INCORRECT - causes TypeScript errors
export type { Student, StudentBalance } from './types'
```

**New Hooks** (`src/hooks/students/`):
- `useStudentDetail.ts` - Granular loading states per data type (student, balance, siblings)
- `useStudentHistory.ts` - Status and attendance history with pagination

**Integration Points**:
- `StudentDetailPage.tsx` - Uses `useStudentDetail` hook
- `OverviewTab.tsx` - Receives separate props (student, balance, siblings, parents)
- `PaymentsTab.tsx` - Uses new `StudentBalance` type with enrollment breakdown

---

## ID Type Conventions

### Backend Uses Integer IDs
All entity IDs are **integers** (not UUIDs):
- `id: number` not `id: string`
- URL params come as strings from React Router
- Must convert: `const numericId = parseInt(id, 10)`

### Affected Modules
- ✅ **Competitions**: Fixed - now uses `number` IDs
- ✅ **Groups**: Uses number IDs
- ✅ **Students**: Uses `number` IDs (verified April 12, 2026)
- 🔄 **Parents**: Pending verification
- 🔄 **Enrollments**: Pending verification

---

## API Endpoints by Response Type

### Returns `{ success, data }`
- `POST /auth/login`
- `GET /crm/students/{id}`
- `GET /crm/parents/{id}`
- `POST /enrollments`
- Most single-item GET endpoints

### Returns `{ data, total, skip, limit }` (Paginated)
- `GET /academics/groups`
- `GET /competitions`
- `GET /academics/groups/{id}/levels`
- List endpoints

### Returns `{ data }` (Simple Wrapper)
- `GET /competitions/{id}` (sometimes)
- `POST /competitions` (create response)

---

## Lessons Learned

1. **Always Check Actual API Response**: Don't assume field names match TypeScript interfaces
2. **ID Types Matter**: Backend uses integers, not UUIDs - check early
3. **Response Wrappers Vary**: Backend has inconsistent patterns - standardize in client layer
4. **Null vs Undefined**: Backend returns `null` for missing fields, not `undefined`
5. **Field Naming Conventions**: Backend uses `snake_case` but sometimes differs from expectations (e.g., `competition_date` vs `start_date`)

---

## Recommended Process for New Modules

1. **Call API manually** with curl/Postman first
2. **Document actual response** structure in this file
3. **Create TypeScript interfaces** to match actual response
4. **Build API client** with proper type annotations
5. **Build hook/component** using typed client
6. **Test end-to-end** before assuming it works

---

## Related Files

### Competition API
- `src/api/competitions/types.ts` - Competition interfaces
- `src/hooks/competitions/*.ts` - Competition hooks

### Group API
- `src/api/academics/groups/lifecycle.ts` - Group levels API
- `src/hooks/useGroups.ts` - Groups hook

### Student API (Modular - April 12, 2026)
- `src/api/crm/students/core.ts` - Student CRUD operations
- `src/api/crm/students/finance.ts` - Balance queries
- `src/api/crm/students/types/models.ts` - Student interfaces
- `src/hooks/students/useStudentDetail.ts` - Student detail hook
- `src/hooks/students/useStudentHistory.ts` - Student history hook

### Shared
- `src/api/client.ts` - Axios instance with interceptors
- `src/types/api.ts` - ApiResponse, PaginatedApiResponse interfaces
- `src/types/pagination.ts` - Pagination types
