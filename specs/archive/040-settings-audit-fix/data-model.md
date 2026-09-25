# Data Model: Settings Page Audit & Fix

## Entities

No new entities are introduced. This feature fixes existing UI components and does not modify data models, API types, or database schemas.

## Existing Entities Referenced

| Entity | Location | Relevance to this feature |
|--------|----------|--------------------------|
| AdminUser | `src/hooks/useAuthQueries.ts` / `src/api/auth/types.ts` | Profile editing, password change fix (cache invalidation) |
| User | `src/api/auth/types.ts` | User management modals (accessibility fixes) |
| AgeBucket | `src/config/studentGrouping.ts` types + `src/store/groupingSettingsStore.ts` | Component being removed; store/config must stay |
| AuditLog | `src/api/auth/types.ts` | Table rendering fix (scope=col, role=status) |
| ActiveSession | `src/api/auth/types.ts` | Session display (formatDate fix) |
| ActivityLog | `src/api/auth/types.ts` | Activity display (formatDate fix) |

## No State Transitions

This feature makes no changes to state management, data flow, or API contracts.

## Validation Rules

- Age bucket min/max: Must be numbers. The falsy-0 bug fix treats 0 as a valid value.
- Search input: Debounced by 350ms before triggering API call.
