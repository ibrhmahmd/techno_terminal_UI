# Implementation Plan: Attendance Grid Audit Fix

**Branch**: `058-attendance-grid-audit-fix` | **Date**: 2026-07-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/058-attendance-grid-audit-fix/spec.md`

---

## Summary

Fix 103 audit findings across 8 phases (bug, dead-code, ts-quality, data-fetch, a11y-ux, react-perf, arch-compliance, ui-polish) in the attendance grid feature. The grid renders a students × sessions matrix for marking attendance, supporting both a desktop table and a mobile bottom-sheet flow with batch save, session management, and cross-view cache synchronization.

The implementation groups fixes into 5 phases ordered by dependency: (1) critical bug fixes — stale closures and missing cache invalidation, (2) accessibility compliance — ARIA semantics, keyboard navigation, reduced motion, (3) React performance — memoization, stable callbacks, extracted components, (4) architecture and TypeScript quality — domain relocation, dead code removal, type safety, (5) UI polish — contrast, color tokens, border weights.

---

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

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ Pass | All changes are in `src/` — no backend code touched |
| II. Server State Discipline | ✅ Pass | All fixes reinforce React Query patterns — cache invalidation, query key centralization, no raw fetch |
| III. Global State Minimalism | ✅ Pass | No new Zustand stores — all state is local `useState` or React Query |
| IV. TypeScript Strict Mode | ✅ Pass | All fixes improve type safety — removing `as` casts, adding `import type`, fixing dependency arrays |
| V. Component Naming Convention | ✅ Pass | New `TimeGridSelector` component follows `*Selector` pattern under `components/attendance/` |

**No violations detected. No complexity tracking required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/058-attendance-grid-audit-fix/
├── spec.md              # Requirement specification (12 FRs)
├── plan.md              # This file
├── research.md          # React perf & a11y research findings
├── data-model.md        # Key entities and type changes
├── quickstart.md        # Run & verify instructions
├── checklists/
│   └── requirements.md  # Spec quality checklist (all pass)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code

```text
src/
├── components/attendance/
│   ├── AttendanceGrid.tsx          # Main orchestrator — stale closures, memoization
│   ├── AttendanceMobileSheet.tsx   # Mobile sheet — a11y, cache invalidation
│   ├── AttendanceCell.tsx          # Single cell — React.memo, focus-visible
│   ├── AttendanceTableBody.tsx     # Grid body — inline function removal
│   ├── AttendanceHeader.tsx        # Session headers — a11y labels
│   ├── AttendanceFooter.tsx        # Save bar — dead code, stale closure
│   ├── EditSessionPopup.tsx        # Edit modal — cross-feature imports, toggle a11y
│   ├── StudentInfo.tsx             # Student row — React.memo
│   ├── PaymentSummaryStrip.tsx     # Payment badges — contrast fixes
│   ├── SessionActionsRow.tsx       # Session action buttons — a11y labels
│   └── SessionNotesRow.tsx         # Notes textarea — a11y labels
├── hooks/
│   ├── useGroupAttendance.ts       # React Query hook — cache key
│   └── queryKeys.ts                # Centralized cache keys
├── api/
│   ├── attendance/
│   │   ├── attendance.ts           # markAttendance API
│   │   └── types.ts                # AttendanceStatus type
│   └── academics/                  # getAttendanceForLevel (to be moved)
├── utils/
│   └── attendanceTransforms.ts     # DTO transforms — dead code, type fixes
└── pages/
    └── GroupDetailPage.tsx         # Page container (no changes expected)
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. New `TimeGridSelector` component added to `src/components/attendance/`. `getAttendanceForLevel` moved from `api/academics/` to `api/attendance/`.

---

## Implementation Phases

### Phase 1: Critical Bug Fixes (FR-1, FR-2)

**Goal**: Fix the 4 critical/high bugs — stale closures and missing cache invalidation.

| Task | FR | File | Fix |
|------|----|------|-----|
| 1.1 | FR-1 | `AttendanceGrid.tsx:400` | Compute `hasChanges` from results array after `handleSaveAll` completes, not from stale closure over `dirtyNotes.size` |
| 1.2 | FR-1 | `AttendanceGrid.tsx:453` | Use functional updater for `setPendingChanges` in `handleRetrySession`, then compute `hasChanges` from new state via `queueMicrotask` |
| 1.3 | FR-2 | `AttendanceGrid.tsx:430` | Add `await qc.invalidateQueries()` for both `dashboard.overview` and `groupAttendance` after successful retry |
| 1.4 | FR-2 | `AttendanceMobileSheet.tsx:100` | Add `groupAttendance` cache invalidation alongside existing `dashboard.overview` invalidation, parallelized with `Promise.all` |

**Verification**: Save all attendance changes → footer hides. Retry failed session → caches update on both dashboard and group detail views.

---

### Phase 2: Accessibility Compliance (FR-3, FR-4, FR-5)

**Goal**: Pass automated a11y audit with zero critical violations.

| Task | FR | Files | Fix |
|------|----|-------|-----|
| 2.1 | FR-3 | All attendance components | Add `aria-hidden="true"` to all decorative Material Symbols icons (~20+ instances) |
| 2.2 | FR-3 | `AttendanceMobileSheet.tsx:136,154` | Add `aria-label="Back to sessions"` and `aria-label="Close attendance sheet"` to icon-only buttons |
| 2.3 | FR-3 | `EditSessionPopup.tsx:310` | Add `role="switch"`, `aria-checked={isSubstitute}`, `aria-label="Substitute Instructor"` to toggle |
| 2.4 | FR-3 | `AttendanceMobileSheet.tsx` | Add Escape key handler and focus trap to bottom sheet |
| 2.5 | FR-3 | All form inputs | Add `htmlFor`/`id` pairs for programmatic label association |
| 2.6 | FR-3 | `AttendanceGrid.tsx` | Add `aria-label` or `<caption>` to data table; add `scope="col"` to header cells |
| 2.7 | FR-3 | Loading states | Add `aria-live="polite"` to loading/empty state containers |
| 2.8 | FR-4 | All attendance components | Add `motion-reduce:animate-none` to all `animate-*` utilities; add `motion-reduce:transition-none` to all `transition-*` utilities; add `motion-reduce:blur-none` to cancelled session blur |
| 2.9 | FR-5 | `AttendanceCell.tsx:36` + all form inputs | Replace `focus:ring-*` with `focus-visible:ring-2 focus-visible:ring-secondary/50`; increase ring opacity to 50% |

**Verification**: Run axe-core audit — zero critical violations. Tab through all controls — focus visible only on keyboard. Toggle `prefers-reduced-motion` — animations disabled.

---

### Phase 3: React Performance (FR-6, FR-12)

**Goal**: Stabilize callback identities and prevent unnecessary re-renders across 300+ cells.

| Task | FR | Files | Fix |
|------|----|-------|-----|
| 3.1 | FR-6 | `AttendanceCell.tsx:28` | Wrap in `React.memo` — prevents re-render when sibling cells change |
| 3.2 | FR-6 | `StudentInfo.tsx:29` | Wrap in `React.memo` — prevents re-render on grid state changes |
| 3.3 | FR-6 | `AttendanceGrid.tsx:264` | Refactor `handleToggle` to use functional state updates (`prev => prev.map(...)`) — removes `[students]` dependency, stabilizes callback identity |
| 3.4 | FR-6 | `AttendanceTableBody.tsx:54` | Pass `disabled` prop to `AttendanceCell` instead of wrapping in inline `onToggle` closure — eliminates 300+ arrow functions per render |
| 3.5 | FR-6 | `EditSessionPopup.tsx:123` | Extract `renderTimeGrid` as standalone `TimeGridSelector` component — eliminates component-inside-component pattern |
| 3.6 | FR-6 | Cache invalidation calls | Replace sequential `await` with `Promise.all` for independent query invalidations |
| 3.7 | FR-12 | `AttendanceGrid.tsx` | Replace `useEffect` + `setSessionNotes` with `useMemo` for `sessionNotes` initialization |
| 3.8 | FR-12 | `AttendanceMobileSheet.tsx` | Initialize `localAttendance` in session selection handler instead of separate `useEffect` |
| 3.9 | FR-12 | `AttendanceGrid.tsx` | Replace `refetchData` with `useMemo` that transforms props into `StudentRowData[]` |

**Verification**: React DevTools Profiler — toggling one cell does not re-render sibling cells. `handleToggle` callback identity stable across renders (no re-creation on toggle).

---

### Phase 4: Architecture & TypeScript Quality (FR-7, FR-8, FR-9, FR-11)

**Goal**: Clean module boundaries, remove dead code, fix type safety issues.

| Task | FR | Files | Fix |
|------|----|-------|-----|
| 4.1 | FR-9 | `api/academics/` → `api/attendance/` | Move `getAttendanceForLevel` to `api/attendance/`; update import in `useGroupAttendance.ts` |
| 4.2 | FR-9 | `EditSessionPopup.tsx:6` | Create `useEmployees` hook in `src/hooks/` using React Query; replace inline `getEmployees` call |
| 4.3 | FR-9 | `EditSessionPopup.tsx:30` | Replace inline `['employees', 'list']` with `queryKeys.employees.list()` |
| 4.4 | FR-7 | `AttendanceGrid.tsx` | Remove unused `isLoading` prop from `AttendanceGridProps`; remove `attendanceTimeoutRef` and cleanup useEffect; remove `fetchCycleRef` and `console.debug` calls |
| 4.5 | FR-7 | `AttendanceFooter.tsx` | Remove unused `hasError` prop; remove trivial `handleSaveClick`/`handleCancelClick` wrappers |
| 4.6 | FR-7 | `AttendanceCell.tsx` | Remove trivial `handleClick` wrapper |
| 4.7 | FR-7 | `attendanceTransforms.ts` | Remove `mapStatus` export (internal only); remove `AttendanceMobileSheetProps` export |
| 4.8 | FR-8 | `AttendanceGrid.tsx` | Replace `as` type assertion on PillSelector onChange with runtime validation; add `dirtyNotes.size` to useEffect deps; replace `\|\| 0` with `?? 0` for instructor ID |
| 4.9 | FR-8 | `attendanceTransforms.ts` | Remove redundant `as` cast on `Object.entries()` |
| 4.10 | FR-8 | `AttendanceGrid.tsx:22` | Replace `NEXT_STATE` string-keyed Record with typed Map |
| 4.11 | FR-11 | `AttendanceGrid.tsx` | Remove `hasChanges(true)` from `handleEditSession` — only set on actual save |

**Verification**: `npm run build` passes. `npm run lint` zero warnings. No `as` casts, no inline query keys, no cross-feature API imports in attendance files.

---

### Phase 5: UI Polish (FR-10)

**Goal**: Fix contrast ratios, color token consistency, and border weight inconsistencies.

| Task | FR | Files | Fix |
|------|----|-------|-----|
| 5.1 | FR-10 | Loading/empty states | Replace `text-outline-variant` with `text-on-surface-variant` for text contrast |
| 5.2 | FR-10 | Chevron icon | Replace `text-slate-300` with `text-slate-400` for WCAG AA contrast |
| 5.3 | FR-10 | Various | Replace raw Tailwind colors (`bg-blue-100`, `bg-teal-100`) with design system tokens where available |
| 5.4 | FR-10 | Bottom sheet backdrop | Replace `bg-slate-900/60` with `bg-black/60` per AGENTS.md convention |
| 5.5 | FR-10 | Table borders | Replace `border-2 border-slate-400` with lighter `border-outline-variant/20` |

**Verification**: Visual inspection — all text meets WCAG AA contrast (4.5:1). Backdrop uses consistent `bg-black/60`. Table borders visually lighter.

---

## Execution Order

```
Phase 1 (Critical Bugs)     ← Must be first — other phases depend on correct save/retry behavior
  └→ Phase 2 (Accessibility) ← Independent of Phase 3-5 but blocks nothing
  └→ Phase 3 (React Perf)    ← Depends on Phase 1 (stable callbacks need correct save logic)
  └→ Phase 4 (Arch/TS)       ← Depends on Phase 1 (dead code removal needs save logic finalized)
  └→ Phase 5 (UI Polish)     ← Independent — can run in parallel with Phase 2-4
```

**Total estimated tasks**: 30 discrete changes across 14 files. No new files except `TimeGridSelector.tsx` (extracted from `EditSessionPopup.tsx`).

---

## Complexity Tracking

No constitution violations detected. All changes reinforce existing architecture patterns (React Query discipline, TS strict mode, component naming conventions). No exceptions required.
