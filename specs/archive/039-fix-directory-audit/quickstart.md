# Quickstart: Fix Directory Audit

## Prerequisites

```bash
npm install    # Dependencies already installed
npm run build  # Verify current state passes
npm run lint   # Verify no existing lint errors
```

## Implementation Order

The fixes are grouped into 5 independent sets that can be implemented in any order, but labels are useful for parallelization:

### Set A — Dead Code Removal (safe, no behavior change)
```bash
# Remove dead functions from src/api/crm/students/
#   status.ts: getStudentStatusSummary, getStudentsByStatus
#   siblings.ts: linkSibling, unlinkSibling
#   utils.ts: formatStudentDisplay, hasOutstandingBalance, getBalanceDisplay, getStatusColorClass
#   activity.ts: getCompetitionHistory

# Remove dead re-exports from src/api/crm/students/index.ts (8 lines)

# Remove dead ParentCard actions interface + RowActions branches
```

### Set B — TypeScript Fixes
```bash
# Fix StudentCard.tsx statusConfig type: Record<string, …> → Record<StudentStatus, …>
# Replace inline axios cast with isAxiosError in useStudentActions.ts
# Remove redundant type assertions in useDirectoryData.ts
```

### Set C — Data Fetching Fixes
```bash
# Add tab guards to useStudentsSearch (only for 'students'/'waiting' tabs)
# Add tab guards to useParentsSearch (only for 'parents' tab)
# Migrate 5 inline query keys to centralized factory
# Narrow invalidation in useDirectory.ts: ['students'] → ['students', 'grouped']
```

### Set D — Bug Fixes
```bash
# Fix totalStudents pagination math in useDirectoryData.ts (line 159)
# Fix handleEditStudent catch block in useStudentActions.ts (line 145)
# Fix handleCreateParent error handling in DirectoryPage.tsx (line 167)
# Fix cache invalidation order in edit flow
# Remove redundant double-filter in useDirectoryData.ts or DirectoryPage.tsx
```

### Set E — Accessibility
```bash
# Add keyboard nav (role, tabIndex, onKeyDown) to StudentCard.tsx
# Add keyboard nav (role, tabIndex, onKeyDown) to ParentCard.tsx
# Add aria-label to 3 tablists in DirectoryPage.tsx
# Add role="alert" to error state in DirectoryPage.tsx
# Add aria-hidden to CardSkeleton.tsx
# Add aria-hidden to Material Symbols icon in StudentGroupBySelector.tsx
```

## Verification

```bash
# After each set:
npm run build   # Must pass with zero errors
npm run lint    # Must pass with zero new warnings

# Final full verification:
npm run build && npm run lint

# Verify no remaining issues:
rg ': any' src/components/directory/ src/hooks/useDirectory.ts
rg 'console\.' src/components/directory/ src/hooks/useDirectory.ts
rg "queryKey: \['" src/components/directory/ src/hooks/directory/
rg 'as any' src/components/directory/ src/hooks/directory/
```
