# Research: Dashboard Cache & Attendance Grid Audit Fix

## Cache Key Audit

### Key Spaces in Use

| Key Factory | Defined In | Used By |
|-------------|-----------|---------|
| `dashboardKeys.overview(date)` | `hooks/dashboard/useDashboard.ts` | `useDashboard`, `AttendanceGrid`, `useCreateGroup` |
| `dashboardKeys.schedule(date)` | `hooks/dashboard/useDashboard.ts` | Expected dashboard use |
| `dashboardKeys.sessions(groupId)` | `hooks/dashboard/useDashboard.ts` | Expected dashboard use |
| `groupKeys.all` | `hooks/useGroupQueries.ts` | Groups hooks |
| `groupKeys.flat` | `hooks/useGroupQueries.ts` | Groups hooks |
| `groupKeys.grouped(by)` | `hooks/useGroupQueries.ts` | Groups hooks |
| `groupKeys.archived` | `hooks/useGroupQueries.ts` | `useArchivedGroups` |
| `groupKeys.byCourse(courseId)` | `hooks/useGroupQueries.ts` | `useGroupsByCourse` |
| `groupKeys.search(query)` | `hooks/useGroupQueries.ts` | `useSearchGroups` |
| `queryKeys.groupAttendance(id, level)` | `hooks/queryKeys.ts` | `useGroupAttendance` |
| `queryKeys.groups` | `hooks/queryKeys.ts` | Multiple group hooks |
| `queryKeys.group(id)` | `hooks/queryKeys.ts` | `useGroupDetail` |
| `queryKeys.groupLevels(id)` | `hooks/queryKeys.ts` | `useProgressLevelForm` |
| `queryKeys.groupSessions(id)` | `hooks/queryKeys.ts` | `useGroupMutations` |
| `queryKeys.groupPayments(id)` | `hooks/queryKeys.ts` | `useGroupPayments` |
| `queryKeys.groupEnrollments(id)` | `hooks/queryKeys.ts` | `useGroupEnrollments` |

### Dead Keys to Remove (23 total)

From `hooks/queryKeys.ts`:

| Key | Reason |
|-----|--------|
| `groupHistory` | Never imported/used outside queryKeys.ts |
| `groupStudents` | Never imported/used; `groupKeys` from `useGroupQueries.ts` serves same purpose |
| `groupsArchived` | Superseded by `groupKeys.archived` from `useGroupQueries.ts` |
| `groupsByCourse` | Superseded by `groupKeys.byCourse` from `useGroupQueries.ts` |
| `groupsByType` | Never used |
| `groupSearch` | Superseded by `groupKeys.search` from `useGroupQueries.ts` |
| `students` | Never used as standalone key |
| `student(id)` | Never used; `studentDetails(id)` is used instead |
| `studentBalance(id)` | Never used |
| `studentSiblings(id)` | Never used |
| `course(id)` | Never used; `courses` (plural) is used instead |
| `teamPayments(id)` | Never used |
| `receipts` | Never used |
| `refunds` | Never used |
| `dashboard` | Superseded by `dashboardKeys` from `useDashboard.ts` |
| `stats` | Never used |
| `attendance` | Never used |
| `dashboardOverview(date)` | Superseded by `dashboardKeys.overview(date)` |
| `reports.all` | Never used |
| `reports.enrollmentTrends` | Never used |
| `reports.instructorPerformance` | Never used |
| `reports.dailyReport.pdf` | Never used; `dailyReport.data` IS used |
| `auth.user(id)` | Never used; `auth.users` (plural) IS used |

## Cache Invalidation Strategy

### Current Gaps

| Mutation Location | Missing Invalidation | Impact |
|------------------|---------------------|--------|
| `AttendanceGrid` mark/save attendance | `queryKeys.groupAttendance(groupId, level)` | Group detail page shows stale attendance until 1-min staleTime expires |
| `AttendanceGrid` cancelSession | `dashboardKeys.overview(selectedDate)` | Dashboard widget shows stale session count |
| `AttendanceGrid` updateSession | `dashboardKeys.overview(selectedDate)` | Dashboard shows old session metadata |
| `useAttendance.ts` markAttendance mutation | `queryKeys.groupAttendance(groupId, level)` | Group detail page stale |

### Required Invalidation Pattern

After any attendance mutation in `AttendanceGrid.tsx`:
```typescript
qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, level) })
if (selectedDate) {
  qc.invalidateQueries({ queryKey: dashboardKeys.overview(selectedDate) })
}
```

## TypeScript Violations to Fix

| Location | Issue | Fix |
|----------|-------|-----|
| `EditSessionPopup.tsx:47` | `(session as any).date` | Prefer `session.date` then `session.session_date` — both exist on the typed interface |
| `EditSessionPopup.tsx:48` | `(session as any).time_start` | Prefer `session.time_start` then `session.start_time` |
| `EditSessionPopup.tsx:49` | `(session as any).time_end` | Prefer `session.time_end` then `session.end_time` |
| `EditSessionPopup.tsx:71` | `(session as SessionWithAttendanceDTO)` | Redundant — `session` is already that type |
| `EditSessionPopup.tsx:5` | `import { type UpdateSessionDTO }` | Should be `import type { UpdateSessionDTO }` |
| `attendance.ts:18` | `as 'present' | 'absent' | 'cancelled'` | Replace with type guard predicate on filter |

## Accessibility Decisions

- **Pattern**: All Material Symbols icons need `aria-hidden="true"`. Icon-only buttons need `aria-label`.
- **Dialog**: Use `role="alertdialog"` with `aria-modal`, `aria-labelledby`, `aria-describedby`.
- **Tab lists**: DaySelectorBar and InstructorSelectorBar should use `role="tablist"`/`role="tab"`/`aria-selected`.
- **Loading states**: Use `role="status"` with `aria-live="polite"`.
- **Error announcements**: Use `role="alert"`.
- **Heading hierarchy**: DashboardPage sections should use h2 between the page h1 and card h3s.
- **Landmarks**: DashboardPage content wrapper should be `<main>`.
- **Focus management**: ConfirmDialog should trap focus and restore on close (defer to existing component enhancements).

## Dead Code — Cross-Feature Impact Check

| Item | Cross-Feature Consumers | Verdict |
|------|------------------------|---------|
| `DashboardHeader` component | None — zero imports across entire `src/` | Safe to remove |
| `useMarkAttendance` | None — zero imports | Safe to remove |
| `useCancelSession` | None — zero imports | Safe to remove |
| `useAddExtraSession` | None — zero imports | Safe to remove |
| `getSessionAttendance` API fn | None — zero imports | Safe to remove |
| `SessionAttendanceRowDTO` | Only used by dead `getSessionAttendance` | Safe to remove |
| `AttendanceUpdate` | Never imported; `AttendanceEntry` used instead | Safe to remove |
| `MarkAttendanceRequest` | Only used internally by `attendance.ts` | Safe to un-export |
| `attendanceStatusColors` | None — zero imports | Safe to un-export |
| `departmentColors` | None — zero imports | Safe to un-export |
