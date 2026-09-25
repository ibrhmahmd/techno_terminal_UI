# Research: Groups Feature Audit & Fix

**Date**: 2026-05-19  
**Feature**: 015-groups-audit-fix

## Phase 0: Research Findings

### Decision 1: Status Mapping Fix (FR-001)
**Context**: `GroupColumns.tsx` status config missing `'archived'` key

**Decision**: Add `'archived'` to the status config object with amber color scheme

**Rationale**: The `GroupStatusBadge` component already handles all 4 statuses. The columns component is the only place missing the mapping. Amber colors match the badge's archived styling.

**Alternatives considered**: 
- Map `'archived'` to `'completed'` — rejected because backend distinguishes between them
- Use a shared status config — rejected as over-engineering for 4 statuses

---

### Decision 2: Cache Invalidation Strategy (FR-002, FR-013)
**Context**: `useGroupMutations` only invalidates `queryKeys.groups` and `queryKeys.group(groupId)`, missing related caches

**Decision**: Expand `invalidateGroups` to include `groupLevels`, `groupSessions`, `groupEnrollments`, `groupPayments`

**Rationale**: Mutations like `archiveGroup` and `progressGroupLevel` affect all related data. Invalidating all related caches ensures UI consistency.

**Alternatives considered**:
- Invalidate each cache individually in each mutation's `onSuccess` — rejected as duplicative
- Use `queryClient.invalidateQueries({ queryKey: ['groups'] })` to invalidate all group-related keys — rejected as too broad (would invalidate unrelated group queries)

---

### Decision 3: Lazy-Load Tab Queries (FR-012)
**Context**: `useGroupEnrollments` and `useGroupPayments` fire on mount regardless of active tab

**Decision**: Add `enabled` parameter to both hooks, default `true` for backward compatibility. Pass `activeTab === 'students'` / `activeTab === 'payments'` from `GroupDetailPage`.

**Rationale**: Reduces initial page load from 8+ requests to 4. Data is only fetched when the tab becomes visible.

**Alternatives considered**:
- Conditionally render tab components — rejected because it would lose component state on tab switch
- Use `refetchOnMount: false` — rejected because it doesn't prevent initial fetch

---

### Decision 4: Focus Trap Implementation (FR-015, FR-016)
**Context**: `EditGroupDialog` and `ProgressLevelDialog` have no focus trap

**Decision**: Implement focus trap via `useEffect` with Tab key cycling and initial focus on first focusable element. Return focus to trigger element on close via `useRef`.

**Rationale**: No external focus trap library is used in the project. Native implementation is lightweight and follows WAI-ARIA dialog pattern.

**Alternatives considered**:
- Add `@floating-ui/react` or `react-focus-lock` — rejected as unnecessary dependency for 2 dialogs
- Use HTML `<dialog>` element — rejected due to inconsistent browser support and styling constraints

---

### Decision 5: Keyboard Navigation for Tabs (FR-017)
**Context**: `TabNavigation`, `GroupCategoryTabs`, `GroupBySelector` lack arrow-key navigation

**Decision**: Add `handleKeyDown` function implementing WAI-ARIA Tabs Pattern (ArrowLeft/Right, Home, End)

**Rationale**: Standard WAI-ARIA pattern. Consistent across all tab components.

**Alternatives considered**:
- Create shared `useTabKeyboardNavigation` hook — rejected as over-engineering for 3 components with slightly different structures

---

### Decision 6: Dead Code Removal Scope (FR-009)
**Context**: 6 dead components, 8 dead API functions, 4 dead types, 1 dead test file

**Decision**: Remove all identified dead code. Keep barrel file exports clean.

**Rationale**: Zero consumers verified via grep across entire `src/` tree. No cross-feature imports detected.

**Alternatives considered**:
- Keep API functions for "future use" — rejected as violates clean code principles and confuses developers
- Deprecate with comments — rejected as adds noise without value

---

### Decision 7: `as any` Replacement Strategy (FR-010)
**Context**: 2 `as any` casts in `useGroupQueries.ts` and `GroupsPage.tsx`

**Decision**: 
- `useGroupQueries.ts`: Replace with explicit union type `'active' | 'inactive' | 'completed' | undefined`
- `GroupsPage.tsx`: Create proper type transformation from `EnrichedGroupPublic` to `GroupForm` initial data shape

**Rationale**: Maintains type safety without runtime overhead.

**Alternatives considered**:
- Use type guard functions — rejected as overkill for simple type narrowing
- Change `GroupForm` to accept `EnrichedGroupPublic` directly — rejected as would require significant interface changes

---

### Decision 8: `generateSessions` Migration (FR-014)
**Context**: Plain async function instead of `useMutation`

**Decision**: Wrap in `useMutation` with `onSuccess` invalidating `groupSessions` and `groupLevels`

**Rationale**: Aligns with Constitution Principle II (Server State Discipline). Provides loading/error state tracking.

**Alternatives considered**:
- Keep as async function with manual `refetch` — rejected as violates React Query best practices

---

### Decision 9: Per-Tab ErrorBoundaries (FR-022)
**Context**: Single `ErrorBoundary` wraps all tabs in `GroupDetailPage`

**Decision**: Wrap each tab's content in its own `ErrorBoundary`

**Rationale**: Isolates tab crashes. One tab failure doesn't block access to other tabs.

**Alternatives considered**:
- Keep single ErrorBoundary — rejected as violates UX best practices

---

### Decision 10: Schedule Field Handling (FR-006, FR-007, FR-008)
**Context**: `EditGroupDialog` sends empty strings for times, `GroupForm` doesn't sync when `initialData` changes

**Decision**:
- FR-006: Omit `schedule` from API request when times are empty
- FR-007: Add default "Select an instructor..." option
- FR-008: Add `useEffect` to sync schedule fields when `initialData` changes

**Rationale**: Prevents invalid API requests and stale form state.

**Alternatives considered**:
- Validate times and show error — rejected as UX degradation; better to omit optional field
- Reset form on `initialData` change — rejected as would lose user edits if switching between edit sessions
