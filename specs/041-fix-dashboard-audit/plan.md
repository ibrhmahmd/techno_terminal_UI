# Implementation Plan: Dashboard Audit Fix

**Branch**: `041-fix-dashboard-audit` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)
**Input**: Audit findings from `/audit-feature dashboard` — 22 issues across 5 phases

## Summary

Fix 22 audit findings in the dashboard feature: 3 runtime bugs (time format, null current_level, redundant getGroupInfo calls), 2 dead placeholder files plus barrel cleanup, 1 unsafe type assertion, decentralized query keys, and ~11 accessibility gaps (keyboard focus, ARIA attributes, tablist navigation). All changes are frontend-only within `src/components/dashboard/`, `src/hooks/dashboard/`, `src/api/dashboard/`, and `src/pages/DashboardPage.tsx`.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config)  
**Testing**: Vitest 4.1 + happy-dom  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.

### Unknowns / Needs Clarification

*None — the audit produced exact findings with line numbers, before/after patterns, and all necessary context.*

### Key Dependencies

1. `src/utils/formatting.ts` — the `formatTime` utility must handle null/undefined input; if not, null guards will be added
2. `src/hooks/queryKeys.ts` — centralized key factory to receive dashboard section
3. `dashboardKeys` exports from `useDashboard.ts` — consumed by `AttendanceGrid`, `AttendanceMobileSheet`, `useGroupQueries`; must update all consumers atomically

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design (Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes inside `src/`. No backend, no database. |
| II. Server State Discipline | ✅ PASS | No changes to data fetching patterns — query keys are being *centralized*, not bypassed. All mutations still use React Query. |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores. All changes are local refactors. |
| IV. TypeScript Strict Mode | ✅ PASS | Changes remove unsafe casts and dead code that already pass build. No new violations. |
| V. Component Naming Convention | ✅ PASS | No new components created. Dead file deletions follow naming. |

**Result**: ALL GATES PASS. Proceeding to research.

### Post-Design Re-Evaluation (Phase 1)

| Principle | Re-Check | Notes |
|-----------|----------|-------|
| I. Frontend-Only Scope | ✅ PASS | Research confirms no backend code. Dead placeholders removed from `src/`. |
| II. Server State Discipline | ✅ PASS | Query keys migrated from local `dashboardKeys` to centralized `queryKeys.dashboard.*`. Cache values unchanged. |
| III. Global State Minimalism | ✅ PASS | Zero new Zustand stores. FAB open/close is local `useState`. |
| IV. TypeScript Strict Mode | ✅ PASS | Design replaces `as number` cast with optional chaining. Dead code removal reduces surface area. All changes tighten type safety. |
| V. Component Naming Convention | ✅ PASS | No new components. Removed `DashboardHeader.tsx` (a component file with no actual component). |

**Result**: ALL GATES PASS — post-design. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/041-fix-dashboard-audit/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (affected files)

```text
src/
├── api/dashboard/
│   ├── dashboard.ts     # Unused GetDashboardOverviewParams export
│   ├── index.ts         # Barrel re-exports cleanup
│   └── types/index.ts   # Unused type re-exports
├── components/dashboard/
│   ├── index.ts         # Dead barrel (entire file — remove)
│   ├── DashboardHeader.tsx  # Dead placeholder — delete
│   ├── DaySelectorBar.tsx   # Tablist arrow key navigation
│   ├── InstructorSelectorBar.tsx  # aria-hidden + arrow key nav
│   ├── MobileDashboardFAB.tsx     # Keyboard focus + Escape + aria-hidden
│   ├── MobileGroupCard.tsx        # formatTime fix + aria-hidden
│   └── GroupSessionCard.tsx       # (consumer of formatTime)
├── hooks/dashboard/
│   ├── useDashboard.ts       # console.log removal + query key migration
│   └── useAttendance.ts      # Dead placeholder — delete
├── hooks/queryKeys.ts        # Add dashboard section
├── pages/DashboardPage.tsx   # Bugs + TS + a11y fixes
└── utils/formatting.ts       # (verify null handling)
```

## Complexity Tracking

> No constitution violations — Complexity Tracking is empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
