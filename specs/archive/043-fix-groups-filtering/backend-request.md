# Backend API Requirements — Groups Filtering & Pagination

**Feature**: 043-fix-groups-filtering  
**Date**: 2026-06-07  
**Status**: Request for Development  
**Intended Audience**: Backend developers (FastAPI)

---

## 1. Summary

The groups list page supports two views: **flat** (paginated table/card grid) and **grouped** (results organized by course, instructor, day, or status). Currently, the grouped endpoint (`GET /academics/groups/grouped`) does **not** accept filter parameters — it returns all groups up to a hardcoded limit of 200. Users cannot filter in grouped view, and groups beyond 200 are invisible.

**Goal**: Make the grouped endpoint accept the same filter parameters as the flat endpoint, so filtering works identically in both views. No new endpoints — extend the existing `/academics/groups/grouped`.

---

## 2. Current State

### Flat Endpoint (already working)

```
GET /academics/groups/filter
```

**Query params**:

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `skip` | int | `0` | Pagination offset |
| `limit` | int | `50` | Page size (max 200) |
| `q` | string | `"math"` | Text search on group name |
| `course_ids` | int[] (repeated) | `course_ids=1&course_ids=2` | Filter by course IDs |
| `instructor_ids` | int[] (repeated) | `instructor_ids=5` | Filter by instructor IDs |
| `level_numbers` | int[] (repeated) | `level_numbers=1&level_numbers=2` | Filter by level |
| `day` | string[] (repeated) | `day=Monday&day=Wednesday` | Filter by schedule day |
| `status` | string[] (repeated) | `status=active&status=archived` | Filter by group status |

**Response**:
```json
{
  "data": {
    "groups": [ /* EnrichedGroupPublic[] */ ],
    "total": 173
  }
}
```

### Grouped Endpoint (needs changes)

```
GET /academics/groups/grouped
```

**Current query params**: `group_by` (required), `skip`, `limit`.  
**No filter params accepted.**

**Current response**:
```json
{
  "data": {
    "groups": [
      {
        "key": "course-1",
        "label": "Mathematics 101",
        "count": 12,
        "groups": [ /* EnrichedGroupPublic[] */ ]
      },
      {
        "key": "course-2",
        "label": "Physics 201",
        "count": 8,
        "groups": [ /* EnrichedGroupPublic[] */ ]
      }
    ],
    "total": 2,
    "groupBy": "course"
  }
}
```

---

## 3. Required Changes

### 3.1 Add Filter Params to `GET /academics/groups/grouped`

Accept all filter params from the existing `GroupFilterOptions` interface:

- `q` (string, optional)
- `course_ids` (int[], optional)
- `instructor_ids` (int[], optional)
- `level_numbers` (int[], optional)
- `day` (string[], optional)
- `status` (string[], optional)

**Behavior**: Filters MUST be applied **before** grouping. For example, if a user groups by `instructor` with `status=active`, the backend should:
1. Filter all groups to only those with `status=active`
2. Group the remaining results by `instructor`
3. Return only groups that match the filter in each group category

If a filter param matches the grouping field (e.g., grouping by instructor while also passing `instructor_ids`), the intersection is expected — both conditions apply.

### 3.2 Keep Existing Params

- `group_by` — required, one of `day`, `course`, `instructor`, `status`
- `skip` — pagination offset (default 0)
- `limit` — page size (default 50, max 200)

### 3.3 Response Format — No Changes

The response structure stays exactly the same as the current grouped response. The only difference: the `groups` array inside each category will contain only groups matching the active filters.

---

## 4. Usage Example

```
GET /academics/groups/grouped?group_by=course&status=active&skip=0&limit=50
```

Expected behavior:
1. Fetch all groups with `status=active`
2. Group them by `course`
3. Return the first 50 groups across all course categories (paginated)
4. Response `total` reflects the total number of unique course categories (or total filtered groups — [clarify with backend team](#5-open-questions))

---

## 5. Open Questions for Backend Team

- **Pagination semantics**: Does `skip`/`limit` apply to the total number of groups returned (across all categories), or to the number of categories? Current grouped view renders all categories at once with pagination inside each — clarify intended behavior.
- **Performance**: The grouped endpoint currently has no limit cap. With filters + pagination, should we enforce the same `max(limit, 200)` constraint as the flat endpoint? **Suggested**: Yes, apply the same cap.
- `has_instructor` and `include_inactive` — these exist in `GroupFilterOptions` but are not exposed in the UI. Should they be supported on the grouped endpoint? **Suggested**: Accept them for API consistency but they are not currently used by the frontend.

---

## 6. Affected Frontend Files (for context only)

| File | Change |
|------|--------|
| `src/api/academics/groups/core.ts` — `getGroupsGrouped()` | Pass filter params in request |
| `src/hooks/useGroupQueries.ts` — `useGroupsGrouped()` | Accept and forward filter options |
| `src/hooks/useGroups.ts` — `useGroups()` | Pass filter options to grouped query |
| `src/pages/GroupsPage.tsx` | Unhide filter panel in grouped view |

No new endpoints — frontend changes are minimal.

---

## 7. Acceptance Criteria

1. `GET /academics/groups/grouped?group_by=course&status=active` returns only groups with `status=active`, grouped by course.
2. `GET /academics/groups/grouped?group_by=instructor&course_ids=1` returns only groups belonging to course 1, grouped by instructor.
3. `GET /academics/groups/grouped?group_by=day&q=Math` returns only groups whose name matches "Math", grouped by day.
4. `GET /academics/groups/grouped?group_by=status&skip=0&limit=10` returns the first 10 filtered results.
5. All existing grouped requests without filter params continue to work unchanged (backward compatible).
