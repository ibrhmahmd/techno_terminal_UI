# Quickstart: Dashboard Cache & Attendance Grid Audit Fix

## Scope

23 files across `src/api/`, `src/components/`, `src/hooks/`, `src/pages/`, `src/utils/`, and `src/components/common/`.

## Recommended Implementation Order

### Batch 1: Dead Code Removal (safe, no behavior change)
1. `src/hooks/queryKeys.ts` — Remove 23 unused keys
2. `src/api/attendance/types.ts` — Remove dead types (`SessionAttendanceRowDTO`, `AttendanceUpdate`, un-export `MarkAttendanceRequest`)
3. `src/api/attendance/attendance.ts` — Remove `getSessionAttendance`
4. `src/api/attendance/index.ts` — Update barrel exports
5. `src/utils/colors.ts` — Remove unused exports (`attendanceStatusColors`, `departmentColors`)
6. `src/hooks/dashboard/useAttendance.ts` — Remove `useMarkAttendance`, `useCancelSession`, `useAddExtraSession` (3 hooks + their barrel export)
7. `src/components/dashboard/DashboardHeader.tsx` — Remove component + barrel export
8. `src/components/dashboard/index.ts` — Remove DashboardHeader re-export

### Batch 2: TypeScript Fixes
9. `src/components/attendance/EditSessionPopup.tsx` — Fix 3 `as any` assertions + redundant cast + `import type` 
10. `src/api/attendance/attendance.ts` — Fix unsafe `as` cast on status filter

### Batch 3: Cache & Data Fetching Fixes
11. `src/components/attendance/EditSessionPopup.tsx` — Replace `useEffect`+`fetch` with `useQuery` for employees
12. `src/components/attendance/AttendanceGrid.tsx` — Fix cache invalidation after save/cancel/edit; refactor derived state to `useMemo`
13. `src/hooks/useGroupAttendance.ts` — Fix level-0 guard; fix `enabled` guard

### Batch 4: Runtime Bug Fixes
14. `src/utils/formatting.ts` — Fix `getTodayISO` to use local timezone
15. `src/components/dashboard/DashboardHeader.tsx` — Remove hardcoded GMT+2 (if kept after dead code analysis — but it's dead, so skip)
16. `src/components/attendance/AttendanceGrid.tsx` — Replace `confirm()` with ConfirmDialog; prevent dirty notes discard on refetch
17. `src/hooks/dashboard/useDashboard.ts` — Gate `console.log` behind `import.meta.env.DEV`

### Batch 5: Accessibility
18. `src/components/common/Modal.tsx` — Add `aria-label` to close button
19. `src/components/common/ConfirmDialog.tsx` — Add `role="alertdialog"`, `aria-modal`, focus trap
20. `src/components/common/LoadingSpinner.tsx` — Add `role="status"`
21. `src/components/dashboard/DaySelectorBar.tsx` — Add `role="tablist"`/`role="tab"`/`aria-selected"`
22. `src/components/dashboard/InstructorSelectorBar.tsx` — Add `role="tablist"`/`role="tab"`/`aria-selected"`
23. `src/components/dashboard/QuickActionsGrid.tsx` — Add `aria-label` to section
24. `src/components/dashboard/StatWidget.tsx` — Add `aria-hidden` to icons + sr-only trend text
25. `src/components/dashboard/QuickActionWidget.tsx` — Add `aria-hidden` to icons
26. `src/components/attendance/AttendanceCell.tsx` — Add `aria-hidden` to status icons
27. `src/components/attendance/AttendanceFooter.tsx` — Add `aria-hidden` to icons
28. `src/components/attendance/SessionActionsRow.tsx` — Add `aria-hidden` to icons + `aria-label` to buttons
29. `src/components/attendance/SessionNotesRow.tsx` — Add `aria-label` to textarea
30. `src/components/attendance/AttendanceGrid.tsx` — Add `role="alert"` to error banner, `aria-label` to info button
31. `src/pages/DashboardPage.tsx` — Use `<main>` landmark, fix heading hierarchy, add `role="status"` to spinner wrapper

### Verify
```bash
npm run build    # tsc -b && vite build — must pass
npm run lint     # must pass
```

## Verification

```bash
npm run build
npm run lint
rg ': any' src/components/attendance/ src/components/dashboard/ src/hooks/dashboard/ src/hooks/useGroupAttendance.ts
rg 'console\.(log|error|warn)' src/components/attendance/ src/components/dashboard/ src/hooks/dashboard/ src/hooks/useGroupAttendance.ts
rg 'useEffect.*get' src/hooks/dashboard/ src/hooks/useGroupAttendance.ts
```
