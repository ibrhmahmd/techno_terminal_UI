# Research: Competitions Feature Audit & Quality Fix

## Decision: Reuse Existing ErrorBoundary Component

**Rationale**: A fully functional class-based `ErrorBoundary` component already exists at `src/components/common/ErrorBoundary.tsx`. It implements `getDerivedStateFromError` and `componentDidCatch`, has a `fallback` prop, and a default styled error UI with a "Try again" button. Already consumed in 4 pages: `GroupsPage.tsx`, `GroupDetailPage.tsx`, `CoursesPage.tsx`, `CourseDetailPage.tsx`.

**Alternatives considered**:
- Adding a functional-component hook-based boundary (e.g., `react-error-boundary`) — rejected because the existing component covers all needs and is already adopted across multiple pages
- Creating a new lightweight functional ErrorBoundary — rejected because the existing class component is stable and tested in production

**Impact**: Tab panels in `CompetitionDetailPage.tsx` will wrap each panel in `<ErrorBoundary>` with a custom fallback message.

---

## Decision: Add Minimal A11y to Modal Component

**Rationale**: `src/components/common/Modal.tsx` is missing all four accessibility features: Escape key handler, focus trap, focus restoration, and `role="dialog"`/`aria-modal`. These are standard requirements for accessible dialogs.

**Minimal non-breaking additions**:
1. Add `role="dialog" aria-modal="true" aria-labelledby="modal-title"` to the modal container div
2. Add `id="modal-title"` to the `<h3>` element
3. Add a `useEffect` for Escape key handler (guard on `isOpen`)
4. Add a `useRef` for focus restoration on unmount/close
5. Focus trap: implement a minimal `useEffect` that focuses the first focusable element and prevents Tab from escaping

**Alternatives considered**:
- Using `@radix-ui/react-focus-guards` or `@radix-ui/react-dialog` — rejected because it would be a breaking change for all Modal consumers and adds a new dependency
- Full focus trap library — rejected because a minimal implementation covers the 80% case without new dependencies

**Impact**: All Modal consumers across the app benefit from improved accessibility. No breaking changes to the Modal API.

---

## Decision: Migrate useCompetitionFees to React Query

**Rationale**: `src/hooks/finance/useCompetitionFees.ts` is a manual `useState`/`useCallback` hook that calls `getUnpaidCompetitionFees(studentId)` (GET `/api/v1/finance/competition-fees?student_id={id}`). The hook is **not currently consumed** anywhere (only exported via barrel file). This is a straightforward migration.

**Migration path**:
1. Add `competitionFees: (studentId: number) => ['finance', 'competition-fees', studentId]` to `queryKeys.ts`
2. Replace the hook body with a single `useQuery` call
3. Remove `clearError`/`clearUnpaidFees` (React Query handles these via `refetch`/`removeQueries`)

**Alternatives considered**:
- Keeping the manual pattern — rejected because it violates Constitution Principle II (Server State Discipline)
- Adding the hook to React Query but keeping the manual API wrapper — rejected because React Query's `queryFn` can call the API function directly

**Impact**: No consumer impact (hook is unused). Barrel export will be removed as part of dead code cleanup.

---

## Decision: Keep activityKeys Co-located with useStudentActivity

**Rationale**: `src/hooks/useStudentActivity.ts` already exports its own `activityKeys` factory with 5 methods (`all`, `history`, `summary`, `enrollments`, `competitions`). `src/hooks/queryKeys.ts` has no activity-related keys. The `activityKeys` are scoped to student-specific CRM activity data (pattern: `['student-activity', ...]`), while `queryKeys.ts` uses resource-level patterns (`['groups', ...]`, `['students', ...]`).

Moving would be a breaking change for any consumer of `useActivityHistory`, `useActivitySummary`, etc. The cleanest approach is to leave `activityKeys` co-located with its hooks.

**Alternatives considered**:
- Moving all activityKeys to queryKeys.ts — rejected because it would be a breaking change for existing consumers
- Re-exporting activityKeys from queryKeys.ts — rejected because it adds indirection without benefit

**Impact**: No changes to activityKeys. The audit finding about "duplicate key management" is resolved by documenting that activityKeys is intentionally co-located (different namespace from queryKeys).

---

## Decision: Add formatDate Utility to src/utils/date.ts

**Rationale**: `src/utils/date.ts` contains only `getUpcomingDates(count)` and `getTodayISO()` — no date formatting function exists. The project uses raw `.toLocaleDateString()` inline across components, producing inconsistent date formats.

**Implementation**: Add a lightweight `formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions)` utility using `Intl.DateTimeFormat`. This avoids adding `date-fns` as a new dependency.

**Alternatives considered**:
- Adding `date-fns` dependency — rejected because it adds ~10KB to the bundle for a single use case
- Using `toLocaleDateString()` with consistent options inline — rejected because it duplicates logic across components

**Impact**: `CompetitionColumns.tsx` and `CompetitionsTab.tsx` will use the new utility for consistent date formatting.

---

## Decision: Add aria-hidden to TableActions Icon Spans

**Rationale**: `src/components/common/datatable/TableActions.tsx` has 4 Material Symbols icon spans (`visibility`, `edit`, `restore`, `delete`), none with `aria-hidden="true"`. Each span is inside a `<button>` with a `title` attribute, making the icons purely decorative.

**Fix**: Add `aria-hidden="true"` to each `<span className="material-symbols-outlined">`.

**Impact**: All table views across the app benefit from improved screen reader experience. No breaking changes.
