# Research: Dashboard Audit Fix

## Summary

22 audit findings across 5 categories. No unknowns — all issues have exact file/line references with before/after patterns from the audit. The `formatTime` utility accepts only `string` input; callers passing nullable values must add guards.

## Key Findings

### Category 1: Runtime Bugs (3 findings)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| B1 | `MobileGroupCard.tsx:14` | `time.slice(0,5)` — 24h inline format | Replace with `formatTime(time)` — 12h format per AGENTS.md |
| B2 | `DashboardPage.tsx:178` | `current_level.level_number` crashes when null | Add optional chaining: `current_level?.level_number` |
| B3 | `DashboardPage.tsx` | `getGroupInfo(openGroupId)` called 4× per render | Store in local variable, reuse |

**Decision**: `formatTime` accepts `string` (not null). Callers must null-guard before calling. `formatTimeDisplay` accepts `string | null | undefined` but returns `--:--` for null — not the right function for this use case.

### Category 2: Dead Code (6 findings)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| D1 | `DashboardHeader.tsx` | Placeholder-only file | Delete entire file |
| D2 | `useAttendance.ts` | Placeholder-only file | Delete entire file |
| D3 | `components/dashboard/index.ts` | Barrel with live exports — **keep** | Only remove dead re-exports if any exist |
| D4 | `useDashboard.ts` | `console.log` debug block | Remove the `import.meta.env.DEV` block |
| D5 | `api/dashboard/dashboard.ts` | `GetDashboardOverviewParams` exported but internal | Remove export (used only internally) |
| D6 | `api/dashboard/index.ts` | Unused type re-exports | Remove only if build fails with `noUnusedLocals` |

**Decision**: D3 — barrel is still in use (TopNavbar, etc. are imported elsewhere). Keep it. D6 — the type re-exports in `types/index.ts` are used by `api/dashboard/index.ts`'s `export * from './types'`. Check build — if no warnings, leave them.

### Category 3: TypeScript Quality (3 findings)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| T1 | `DashboardPage.tsx` | `as number` assertion on `instructor_id` | Use proper type narrowing or optional chaining |
| T2 | `DashboardPage.tsx` | `getGroupInfo` called 4× (duplicate of B3) | Same fix — local variable |
| T3 | `useDashboard.ts` | `console.log` (duplicate of D4) | Same fix |

**Decision**: `as number` is the only actual TS quality find. Replace with `Number(...)` guard or optional chaining with fallback.

### Category 4: Data Fetching (3 findings)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| F1 | `useDashboard.ts` | Local `dashboardKeys` — migrate to `queryKeys.ts` | Move to centralized factory |
| F2 | `AttendanceGrid.tsx` | Imports `dashboardKeys` from `useDashboard` | Import from `queryKeys.ts` |
| F3 | `AttendanceMobileSheet.tsx` | Same as F2 | Same fix |

**Decision**: Add `dashboard: { overview, schedule, sessions }` section to `queryKeys.ts`. Remove `dashboardKeys` from `useDashboard.ts` and update all consumers.

### Category 5: Accessibility (11 findings)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| A1 | `DaySelectorBar.tsx` | Tablist lacks arrow key nav | Add handleKeyDown with ArrowLeft/Right |
| A2 | `InstructorSelectorBar.tsx` | Tablist lacks arrow key nav | Same pattern |
| A3 | `MobileDashboardFAB.tsx` | Hidden buttons keyboard-tabbable | Add `invisible` class alongside opacity-0 |
| A4 | `MobileDashboardFAB.tsx` | No Escape key handler | Add onKeyDown for Escape |
| A5 | `MobileDashboardFAB.tsx` | Missing aria-hidden on open/close | Add `aria-hidden={!isOpen}` |
| A6 | `DashboardPage.tsx` | Error banner no role="alert" | Add `role="alert"` |
| A7 | `MobileGroupCard.tsx` | Icon span no aria-hidden | Add `aria-hidden="true"` |
| A8 | `InstructorSelectorBar.tsx` | Icon no aria-hidden | Add `aria-hidden="true"` |
| A9 | `GroupSessionCard.tsx` | Icon no aria-hidden | Add `aria-hidden="true"` |
| A10 | `DaySelectorBar.tsx` | Icon no aria-hidden | Add `aria-hidden="true"` |
| A11 | `DashboardPage.tsx` | Desktop path inconsistent with mobile path | Add null guard for missing group |

**Decision**: All a11y fixes follow standard WCAG patterns used elsewhere in the app. Roving tabindex for tablists, `invisible` class for hidden elements (Tailwind v3), `role="alert"` for live regions.

## Dependencies

| Dependency | Purpose | Notes |
|------------|---------|-------|
| `src/utils/formatting.ts` | `formatTime` — 12h time conversion | Already tested, handles empty string |
| `src/hooks/queryKeys.ts` | Centralized key factory | Must add `dashboard` section |
| `@testing-library/react` | Component tests | For a11y verification |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Adding null handling to `formatTime` signature | Changes a widely-used utility's type signature. Safer to guard at call sites. |
| Keeping `dashboardKeys` local in `useDashboard.ts` | Violates project convention (FR-010). All other domains use centralized keys. |
| Using `sr-only` for hidden FAB buttons | `invisible` + `opacity-0` + `pointer-events-none` is the established pattern in this codebase. |
