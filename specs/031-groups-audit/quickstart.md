# Quickstart: Groups Page Audit & Fix

## Prerequisites

```bash
npm install     # ensure deps are up to date
```

## Verification Steps

### US1: Runtime Bug Fixes

1. **GroupStatusBadge crash**: Navigate to any groups page. Verify all groups render without JS console errors. To test edge case, a status value of `'unknown'` or `undefined` should render "Unknown" badge instead of crashing.

2. **Multi-filter truncation**: In GroupsPage, open Group Search → select multiple courses + multiple instructors. Verify the URL or network tab shows repeated query params (e.g., `?instructor_ids=1&instructor_ids=2`).

3. **EditGroupDialog instructor_id:0**: Open edit dialog for a group with no instructor assigned. Submit without changing instructor. Verify the PATCH payload does NOT contain `instructor_id: 0`.

4. **EditGroupDialog day validation**: Open edit dialog, modify schedule fields, leave day unselected, submit. Verify no schedule data is sent in the PATCH payload.

5. **Grouped view limit**: Inspect the grouped query network call. Verify `limit=200` instead of `limit=50`.

### US2: Dead Code Removal

- **No functional impact**. Verify `npm run build` passes.
- Verify `processedGroups` is no longer returned from `useGroups()`.

### US3: TypeScript

- `npm run build` must pass with zero errors.
- `rg ': any' src/components/groups/ src/hooks/useGroups.ts` should return no matches (the `Record<string, any>` in core.ts is explicitly fixed).

### US4: Data Fetching

1. **GroupForm**: Navigate to Create Group modal. Verify courses load correctly (same behavior as before — uses `useCourses()` hook now).

2. **Redundant refresh**: Open DevTools Network tab. Delete a group. Verify only one DELETE request fires (no duplicate GET refetch from the manual `refresh()` call).

3. **Query keys**: Run `rg 'queryKey: \[\'' src/hooks/useGroupQueries.ts src/hooks/useStudentsGrouped.ts src/hooks/useProgressLevelForm.ts` — should return no inline keys (all use `queryKeys` factory).

### US5: Accessibility

- **NO visual changes expected**. All changes are invisible ARIA attributes.

1. **GroupFilters close button**: Inspect the X button with browser DevTools. Verify `aria-label="Close filters"` is present.

2. **Filter toggle pills**: Inspect any filter pill (Course, Instructor, etc.). Verify `aria-pressed="true"` or `aria-pressed="false"` based on selection state.

3. **GroupCard**: Inspect any card with role="button". Verify `aria-label` contains the group name.

4. **Error banners**: Trigger a group delete failure. Verify the error div has `role="alert"`.

### Build Verification

```bash
npm run build       # tsc -b && vite build — zero errors
npm run lint        # zero errors

# Post-fix verification (no remaining issues)
rg ': any' src/components/groups/ src/hooks/useGroup*.ts
rg 'console\.(log|error|warn)' src/components/groups/ src/hooks/useGroup*.ts
rg 'export default' src/components/groups/
rg 'useEffect.*get' src/hooks/useGroup*.ts src/hooks/useStudentsGrouped.ts
```
