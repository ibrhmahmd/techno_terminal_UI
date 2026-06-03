# Research: Groups Page Audit & Fix

## 1. Multi-Filter API Support (`instructor_ids[]` / `level_numbers[]`)

### Context
`GroupFilterOptions` at `src/api/academics/groups/core.ts:122` defines:
- `course_ids?: number[]` ✅ already supports array
- `instructor_id?: number` ❌ singular only
- `level_number?: number` ❌ singular only

`useGroups.ts:52-53` sends only the first selected value:
```ts
instructor_id: selectedInstructors.length > 0 ? selectedInstructors[0] : undefined,
level_number: selectedLevels.length > 0 ? selectedLevels[0] : undefined,
```

### Decision
- Add `instructor_ids?: number[]` and `level_numbers?: number[]` to `GroupFilterOptions`
- Update `useGroups.ts` to send the full arrays instead of slicing to `[0]`
- The existing `paramsSerializer` at `core.ts:142-153` already serializes arrays via repeated query params: `?instructor_ids=1&instructor_ids=2`
- Backend assumed to accept array params (same pattern as `course_ids`)

### Alternatives Considered
- Keep current behavior (only first selection) — rejected because the UI explicitly allows multi-select, making this a silent data loss bug
- Send comma-separated string — rejected; the paramsSerializer already handles proper array serialization

---

## 2. `Record<string, any>` → `Record<string, unknown>`

### Context
`getEnrichedGroups` at `core.ts:137` uses `Record<string, any>` for query params:
```ts
const params: Record<string, any> = { limit: 200, ...options };
```

### Decision
- Change to `Record<string, unknown>`
- Add a type guard utility in the `paramsSerializer` to handle `unknown` values:
  ```ts
  const value = params[key];
  if (Array.isArray(value)) { /* existing */ }
  else if (value != null && value !== '') { /* existing */ }
  ```
  The `Array.isArray()` type guard narrows `unknown[]`, and `!= null` narrows `unknown` for the else branch. No explicit casting needed.

### Alternatives Considered
- Keep `any` — rejected because it bypasses strict TS enforcement
- Cast at every call site — rejected; central fix in paramsSerializer is cleaner

---

## 3. Query Key Consolidation Strategy

### Current State

**`useGroupQueries.ts`** (local `groupKeys`):
```ts
export const groupKeys = {
  all:     ['groups'] as const,
  flat:    (filters?: GroupFilterOptions) => ['groups', 'flat', filters] as const,
  grouped: (by: GroupByField) => ['groups', 'grouped', by] as const,
  byCourse: (courseId: number) => ['groups', 'by-course', courseId] as const,
}
```

**`useStudentsGrouped.ts`** (local `studentsGroupedKeys`):
```ts
const studentsGroupedKeys = {
  all: ['students', 'grouped'] as const,
  byParams: (...) => ['students', 'grouped', groupBy, skip, limit, tab, ageBucketsKey] as const,
}
```

**`useProgressLevelForm.ts`**: inline key `['employees', 'all']`

**Centralized `queryKeys.ts`** already has:
```ts
groups: ['groups'] as const,
```

### Decision
1. Add to `queryKeys.ts`:
   ```ts
   groups: {
     all: ['groups'] as const,
     flat: (filters?: GroupFilterOptions) => ['groups', 'flat', filters] as const,
     grouped: (by: GroupByField) => ['groups', 'grouped', by] as const,
     byCourse: (courseId: number) => ['groups', 'by-course', courseId] as const,
   }
   ```
2. In `useGroupQueries.ts`, re-export from centralized keys instead of local factory:
   ```ts
   import { queryKeys } from '../queryKeys'
   export const groupKeys = queryKeys.groups  // re-export for backward compat
   ```
3. Add to `queryKeys.ts`:
   ```ts
   students: {
     grouped: {
       all: ['students', 'grouped'] as const,
       byParams: (...) => ['students', 'grouped', groupBy, skip, limit, tab, ageBucketsKey] as const,
     }
   }
   ```
4. In `useStudentsGrouped.ts`, import from `queryKeys.ts`:
   ```ts
   import { queryKeys } from '../../hooks/queryKeys'
   ```
5. Add `employees: { all: ['employees', 'all'] as const }` to `queryKeys.ts` and import in `useProgressLevelForm.ts`

### Alternatives Considered
- Keep local factories — rejected; violates the "always use centralized keys" principle
- Remove local factories entirely without backward compat — rejected; mutation invalidators use `groupKeys.all` and would break

---

## 4. `GroupByField` Cast Safety

### Context
`useGroups.ts:39` casts before validation:
```ts
if (valid.includes(stored as GroupByField)) {
    return stored as GroupByField
}
```

This passes because `stored` is `string | null`, and `valid` is `Array<GroupByField>` which includes `string`. The `as` cast doesn't narrow — it reassures TS. The actual issue is that `valid.includes(stored)` would fail TS because `stored` (string) can't be compared to `GroupByField` (string literal union) without a cast.

### Decision
- Keep the cast but simplify: the pattern is correct for localStorage parsing (runtime validation + cast). Change to:
  ```ts
  const parsed: GroupByField | undefined = valid.find(v => v === (stored === 'null' ? null : stored)) as GroupByField | undefined
  return parsed !== undefined ? parsed : undefined
  ```
  Or simpler: keep the current pattern but assert after the gate:
  ```ts
  if (valid.includes(stored as GroupByField)) {
    return stored === 'null' ? null : stored as GroupByField
  }
  ```

---

## 5. Accessibility Patterns

### Material Symbols aria-hidden
All decorative Material Symbol icons should have `aria-hidden="true"`. This is the standard pattern used elsewhere in the codebase.

### Toggle pill buttons
The GroupFilters toggle pills (course, instructor, level, day, status) should use `aria-pressed` to communicate selection state to screen readers. Pattern:
```tsx
<button type="button" onClick={...} aria-pressed={isSelected} className={`... ${isSelected ? 'bg-secondary text-white' : '...'}`}>
```

### Tab panels
When a `role="tablist"` is used, the corresponding content panels must have `role="tabpanel"` and `aria-labelledby` pointing back to the tab's `id`.

### Error banners
Error messages that appear dynamically should use `role="alert"` so screen readers announce them.

### Loading states
Skeleton loaders should use `role="status"` with descriptive `aria-label`.

---

## 6. Redundant `refresh()` After Mutations

### Context
`useUpdateGroup` and `useDeleteGroup` in `useGroupQueries.ts` already call `invalidateQueries` on success (line 85-89, 93-94). However:
- `GroupsPage.tsx:144` calls `refresh()` after `deleteGroupMutation.mutateAsync` — redundant
- `GroupDetailPage.tsx:96` calls `refetch()` after `updateGroup` from `useGroupMutations.ts` — check if `useGroupMutations.ts` also auto-invalidates

### Decision
- Remove `refresh()` call from `GroupsPage.tsx:144` — `useDeleteGroup` already invalidates
- Check `useGroupMutations.ts` for auto-invalidation; if present, remove `refetch()` from `GroupDetailPage.tsx:96`
