# Implementation Plan: Dashboard Cache & Attendance Grid Audit Fix

**Branch**: `023-dashboard-attendance-audit` | **Date**: 2026-05-23 | **Spec**: [spec.md](../spec.md)
**Input**: Feature specification from `specs/023-dashboard-attendance-audit/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Audit-driven remediation of the dashboard caching strategy and attendance grid feature across 8 user stories: fix 5 runtime bugs (level-0 rejection, confirm() duplication, UTC date off-by-one, GMT+2 assumption, dirty notes discard), fix 5 cache invalidation gaps (attendance marks, session cancels/edits, group attendance stale after dashboard edit), modernize 2 data fetching anti-patterns (manual useEffect -> React Query, derived state useState->useMemo), remove 10 dead components/hooks/types and 20 unused query keys, eliminate 5 TypeScript violations (3x `as any`, unsafe cast, verbatim import), add ARIA attributes to 30+ interactive controls, and fix semantic HTML structure. All changes are frontend-only.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate I — Frontend-Only Scope (PASS)
All changes are strictly in `src/`. No backend, no database, no server logic.

### Gate II — Server State Discipline (PASS after fix)
**Pre-existing violations found in audit:**
- `EditSessionPopup.tsx:29` uses `useEffect` + raw `fetch` for employee list — violates "All server data must go through React Query"
- `AttendanceGrid.tsx:174,189` calls `cancelSession`/`updateSession` directly without `queryClient.invalidateQueries()` on affected cache keys

**Remediation plan**: Convert to `useQuery` for employees; add `invalidateQueries` calls after session mutations.
**No new violations introduced.**

### Gate III — Global State Minimalism (PASS)
No Zustand stores are added or modified. All state changes use React Query or local state.

### Gate IV — TypeScript Strict Mode (PASS after fix)
**Pre-existing violations found in audit:**
- `EditSessionPopup.tsx:47-49`: 3x `as any` type assertions
- `attendance.ts:18`: Unsafe `as` cast on status filter
- `EditSessionPopup.tsx:71`: Redundant cast

**Remediation plan**: Replace with proper typed access, type guard, and remove redundant casts.
**No new violations introduced.**

### Gate V — Component Naming Convention (PASS)
Component naming is consistent with conventions. Dead components being removed (`DashboardHeader`) already follow convention but have no consumers.

## Project Structure

### Documentation (this feature)

```text
specs/023-dashboard-attendance-audit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code

```text
src/
├── api/
│   ├── attendance/      # attendance.ts, types.ts (remove dead exports)
│   ├── dashboard/        # dashboard.ts (no changes)
├── components/
│   ├── attendance/       # AttendanceGrid, AttendanceCell, EditSessionPopup, etc. (bug fixes, a11y, data fetching)
│   ├── dashboard/        # DashboardHeader (remove), DaySelectorBar, InstructorSelectorBar, etc. (a11y)
│   ├── common/           # Modal, ConfirmDialog, LoadingSpinner (a11y fixes)
├── hooks/
│   ├── queryKeys.ts      # Remove 20 unused keys
│   ├── dashboard/        # useDashboard.ts (remove console.log), useAttendance.ts (remove dead hooks)
│   └── useGroupAttendance.ts  # Fix level-0 bug, cache invalidation
├── pages/
│   └── DashboardPage.tsx # <main> landmark, heading hierarchy, a11y
├── utils/
│   ├── formatting.ts     # Fix UTC date bug
│   └── colors.ts         # Remove unused exports
```

## Complexity Tracking

> **No new complexity introduced. All changes are deletions or fixes of pre-existing violations. The constitution check passes after remediation — see Gate II and Gate IV for details on violations being corrected.**
