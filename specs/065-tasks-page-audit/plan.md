# Implementation Plan: Tasks Page Audit & Fix

**Branch**: `main` | **Date**: 2026-07-11 | **Spec**: [specs/065-tasks-page-audit/spec.md](./spec.md)
**Input**: Feature specification from `/specs/065-tasks-page-audit/spec.md`

## Summary

Audit and fix of the Tasks page feature across 14 user stories. The existing feature (13 files, ~1700 LOC) has zero critical bugs but 16 high-severity accessibility violations, 28 medium findings across bugs/TS/perf/UI, and 14 low findings. All changes are frontend-only: ARIA attributes, focus management, dead code removal, NaN guards, React.memo wrappers, and z-index fixes. No new APIs, no new dependencies, no backend changes.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: 13 files across `src/components/tasks/`, `src/pages/TasksPage.tsx`, `src/hooks/useTasks.ts`, `src/api/tasks/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes are in `src/` — no backend code |
| II. Server State Discipline | ✅ PASS | All hooks use React Query; mutations invalidate cache keys |
| III. Global State Minimalism | ✅ PASS | Only `useAuthStore` for auth — no new Zustand stores |
| IV. TypeScript Strict Mode | ✅ PASS | Removing `any`, fixing type assertions, no enums/namespaces |
| V. Component Naming Convention | ✅ PASS | All files follow `{Domain}{Suffix}` pattern |
| Cache Keys | ✅ PASS | Using centralized `queryKeys.tasks.*` factory |
| Build Gates | ✅ PASS | `npm run lint` and `npm run build` must pass after changes |

**No violations found.** All audit fixes align with constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/065-tasks-page-audit/
├── plan.md              # This file
├── spec.md              # Feature specification (14 user stories)
├── findings-report.md   # Audit findings with severity heatmap
├── research.md          # Phase 0 output (N/A — audit-based, no unknowns)
├── data-model.md        # Phase 1 output (N/A — existing types unchanged)
├── quickstart.md        # Phase 1 output (N/A — no new features)
├── contracts/           # Phase 1 output (N/A — no new APIs)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (files affected)

```text
src/
├── api/tasks/
│   ├── index.ts              # Barrel re-export (unchanged)
│   ├── tasks.ts              # Remove deleteTask function
│   └── types.ts              # Remove recurrence_day_of_month fields
├── components/tasks/
│   ├── CommentsFeed.tsx      # ARIA labels, focus-visible, contrast fixes
│   ├── CreateTaskModal.tsx   # Focus trap, dialog role, z-index, NaN guards, labels
│   ├── SubtaskChecklist.tsx  # Checkbox ARIA, progress bar ARIA, delete confirmation
│   ├── TaskDetailDrawer.tsx  # Tab ARIA, focus trap, Escape handler, font-headline
│   ├── TaskListTable.tsx     # Keyboard support, contrast, Date.now() optimization
│   ├── TaskPriorityBadge.tsx # React.memo wrapper
│   ├── TaskStatusBadge.tsx   # React.memo wrapper
│   └── TimeLogPanel.tsx      # Input labels, aria-hidden icons, contrast
├── hooks/
│   └── useTasks.ts           # Remove useDeleteTask, fix void suppressions, remove redundant invalidation
└── pages/
    └── TasksPage.tsx         # Input labels, skeleton loading, font-headline, useCallback
```

**Structure Decision**: All files already exist in correct locations. No new files created. No directory restructuring needed.

## Complexity Tracking

> No violations to justify — all changes are additive ARIA attributes, minor code removals, and CSS class adjustments.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |

## Implementation Order

### Phase 1: Dead Code Removal (US-12)
Lowest risk, unblocks TS quality. Remove `useDeleteTask`, `deleteTask`, `recurrence_day_of_month`, fix `void taskId` suppressions, remove redundant invalidation.

### Phase 2: Runtime Bug Fixes (US-11)
Fix overdue logic, NaN guards, parseInt radix, add confirmation dialogs, fix non-null assertion.

### Phase 3: Accessibility — ARIA & Focus (US-1–US-8)
Tab ARIA roles, modal/drawer focus traps, Escape handlers, checkbox ARIA, progress bar ARIA, icon button labels, input labels.

### Phase 4: UI Polish (US-9, US-10, US-14)
Loading skeleton, font-headline consistency, motion-safe guards, contrast fixes, z-index layering.

### Phase 5: React Performance (US-13)
React.memo wrappers, module-level constants, useCallback, Date.now() optimization, stable empty array.

### Phase 6: Verification
- `npm run lint` — zero errors
- `npm run build` — `tsc -b && vite build` succeeds
- Manual smoke test: open tasks page, create task, open detail drawer, toggle subtasks, add comment, add time log
