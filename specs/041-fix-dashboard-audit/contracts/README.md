# Contracts: Dashboard Audit Fix

This is a frontend-only SPA. The following documents the internal component contracts (props interfaces) that change during this audit fix.

## Changed Interfaces

### MobileDashboardFABProps

```typescript
// Before:
interface MobileDashboardFABProps {
  todaySessionCount: number    // ← unused, never consumed
  // ... other props
}

// After:
interface MobileDashboardFABProps {
  // todaySessionCount removed
  // ... other props (unchanged)
}
```

### queryKeys.dashboard (new in queryKeys.ts)

```typescript
// Added to src/hooks/queryKeys.ts
dashboard: {
  overview: (date: string) => readonly ['dashboard', 'overview', date],
  schedule: (date: string) => readonly ['dashboard', 'schedule', date],
  sessions: (groupId: number) => readonly ['dashboard', 'sessions', groupId],
}
```

These replace the locally-defined `dashboardKeys` in `useDashboard.ts`. Key values remain identical.

## Unchanged Interfaces (for reference)

### ScheduledGroupDTO (from API)

```typescript
interface ScheduledGroupDTO {
  group_id: number
  group_name: string
  default_time_start: string | null   // "HH:MM:SS" from API
  default_time_end: string | null     // "HH:MM:SS" from API
  current_level: CurrentLevelDTO | null  // CAN BE NULL — this is the bug
  instructor_id: number | null
  session_ids: number[]
  // ...
}
```

### CurrentLevelDTO

```typescript
interface CurrentLevelDTO {
  level_id: number
  level_number: number
  level_name: string
  sessions: SessionWithAttendanceDTO[]
}
```

### GroupInfoDTO (from dashboard data)

```typescript
interface GroupInfoDTO {
  group_id: number
  group_name: string
  default_time_start: string | null
  default_time_end: string | null
  current_level: CurrentLevelDTO | null
  instructor_id: number | null
  // ... derived from groups map
}
```

## Accessibility Contract (added patterns)

| Element | ARIA Pattern |
|---------|-------------|
| Tablist (DaySelectorBar, InstructorSelectorBar) | `role="tablist"`, `role="tab"`, roving tabindex, ArrowLeft/ArrowRight navigation |
| Hidden FAB buttons | `class="invisible opacity-0 pointer-events-none"` (prevents tab focus) |
| FAB menu | `aria-hidden={!isOpen}`, Escape key to close |
| Error banner | `role="alert"` for immediate screen reader announcement |
| Decorative icon spans | `aria-hidden="true"` on all `material-symbols-outlined` spans |
