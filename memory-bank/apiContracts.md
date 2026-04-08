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
- 🔄 **Students**: Pending verification
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

- `app/src/api/competitions/types.ts` - Competition interfaces
- `app/src/api/academics/groups/lifecycle.ts` - Group levels API
- `app/src/api/client.ts` - Axios instance with interceptors
- `app/src/hooks/competitions/*.ts` - Competition hooks
- `app/src/hooks/useGroups.ts` - Groups hook
