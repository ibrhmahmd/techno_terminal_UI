# Contracts: Groups Audit Fix

This is a frontend-only SPA. The following documents the internal component contracts (props interfaces and hook signatures) that change during this audit fix.

## Changed Interfaces

### Group.status (models.ts)

```typescript
// Before:
status: 'active' | 'inactive' | 'completed'

// After:
status: 'active' | 'inactive' | 'archived' | 'completed'
```

### EnrichedGroupPublic.status (models.ts)

```typescript
// Before:
status: 'active' | 'inactive' | 'completed'

// After:
status: 'active' | 'inactive' | 'archived' | 'completed'
```

### useUpdateGroup (useGroupQueries.ts) — DELETE

```typescript
// Before:
export function useUpdateGroup() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScheduleGroupInput }) => updateGroup(id, data),
    onSuccess: invalidate,  // only root key
  })
}

// After: DELETED — GroupsPage.tsx will import useGroupMutations instead
```

### useGroupMutations (useGroupMutations.ts) — changed signature

```typescript
// Before:
export function useGroupMutations(groupId: number): UseGroupMutationsReturn

// After: (option to skip groupId binding for list-page use)
export function useGroupMutations(groupId?: number): UseGroupMutationsReturn
// When groupId is undefined, updateGroup/deleteGroup accept id as param
```

### useGroupDetail error return — expanded

```typescript
// Before:
error: groupError instanceof Error ? groupError.message : null

// After:
error: [groupError, levelsError, sessionsError].find(e => e instanceof Error)?.message ?? null
```

### useGroupHistory — new return type

```typescript
// Before: implicit return type
// After: explicit UseGroupHistoryReturn interface
```

### useRecentGroups — new return type

```typescript
// Before: implicit return type
// After: explicit { recentGroupIds: number[]; addRecentGroup: (groupId: number) => void }
```

### useGroupAttendance — new return type

```typescript
// Before: implicit return type
// After: explicit UseGroupAttendanceReturn interface
```

## Deleted Interfaces

| File | Reason |
|------|--------|
| `LevelStudentsPanel.tsx` | Dead — no consumers |
| `TransferDialog.tsx` | Dead — only consumed by deleted LevelStudentsPanel |
| `TabNavigation.tsx` | Dead — no consumers |
| `useGroupEnrollments.ts` | Dead — only consumed by deleted LevelStudentsPanel |
| `useGroupMutations.ts:invalidateGroupsExtended` | Dead — never called |

## Deleted Export (useGroupQueries.ts)

```typescript
// Remove these exports:
useCreateGroup     → GroupsPage delegates to useGroupMutations
useUpdateGroup     → GroupsPage delegates to useGroupMutations
useDeleteGroup     → GroupsPage delegates to useGroupMutations
useGroupInvalidator → internal helper, not publicly consumed
```
