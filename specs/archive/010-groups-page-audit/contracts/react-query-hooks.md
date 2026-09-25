# Contract: React Query Hooks for Group Detail Data

Applies to: `useGroupDetail.ts`, `useGroupPayments.ts`, `useGroupEnrollments.ts`, `useGroupCompetitions.ts`, `useGroupAttendance.ts`

## Migration Pattern

Each hook MUST follow this structure:

```typescript
export function useGroupXxx(groupId: number) {
  return useQuery({
    queryKey: queryKeys.group(groupId, 'xxx'),
    queryFn: () => apiFunction(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000, // default for group detail data
  })
}
```

## Hook Specifications

### `useGroupDetail(groupId: number)`

| Property | Value |
|----------|-------|
| Query Key | `queryKeys.group(groupId)` |
| API Call | `getGroup(groupId)` |
| staleTime | 5 min |
| enabled | `groupId > 0` |
| Returns | `{ group: EnrichedGroupPublic \| undefined, isLoading, error, refetch }` |

### `useGroupPayments(groupId: number)`

| Property | Value |
|----------|-------|
| Query Key | `queryKeys.group(groupId, 'payments')` |
| API Call | `getGroupPayments(groupId)` |
| staleTime | 5 min |
| enabled | `groupId > 0` |
| Returns | `{ payments: PaymentData[] \| undefined, isLoading, error }` |

### `useGroupEnrollments(groupId: number)`

| Property | Value |
|----------|-------|
| Query Key | `queryKeys.group(groupId, 'enrollments')` |
| API Call | `getGroupEnrollments(groupId)` |
| staleTime | 3 min |
| enabled | `groupId > 0` |
| Returns | `{ enrollments: EnrollmentData[] \| undefined, isLoading, error }` |

### `useGroupCompetitions(groupId: number)`

| Property | Value |
|----------|-------|
| Query Key | `queryKeys.group(groupId, 'competitions')` |
| API Call | `getGroupCompetitions(groupId)` |
| staleTime | 5 min |
| enabled | `groupId > 0` |
| Returns | `{ competitions: CompetitionData[] \| undefined, isLoading, error }` |

### `useGroupAttendance(groupId: number, levelNumber: number)`

| Property | Value |
|----------|-------|
| Query Key | `queryKeys.group(groupId, 'attendance', levelNumber)` |
| API Call | `getGroupAttendance(groupId, levelNumber)` |
| staleTime | 1 min |
| enabled | `groupId > 0 && levelNumber > 0` |
| Returns | `{ attendance: AttendanceData[] \| undefined, isLoading, error }` |

## Cache Invalidation

Group mutations MUST invalidate all related query keys:

```typescript
// After create/update/delete group
qc.invalidateQueries({ queryKey: queryKeys.groups })
qc.invalidateQueries({ queryKey: queryKeys.group(groupId) })
qc.invalidateQueries({ queryKey: queryKeys.group(groupId, 'payments') })
qc.invalidateQueries({ queryKey: queryKeys.group(groupId, 'enrollments') })
qc.invalidateQueries({ queryKey: queryKeys.group(groupId, 'competitions') })
```
