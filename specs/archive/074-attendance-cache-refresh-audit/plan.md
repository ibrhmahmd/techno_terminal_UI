# Implementation Plan: Attendance Grid — Cache, Update & Refresh Audit Fix

**Branch**: `074-attendance-cache-refresh-audit` | **Date**: 2026-08-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/074-attendance-cache-refresh-audit/spec.md`

## Summary

Fix the attendance grid's stale-cache bug (session lifecycle mutations don't invalidate `groupAttendance`), align desktop/mobile missing-status semantics (`Not Taken`), consolidate duplicate attendance types, and restore `AttendanceCell.memo` effectiveness. All changes are frontend-only, in `src/`.

Research decisions are captured in [research.md](research.md). The user-facing requirements are in [spec.md](spec.md) (3 user stories: P1 grid refresh, P2 missing-status consistency, P3 single type source).

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
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). Build must pass `tsc -b && vite build`.
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Verdict | Notes |
|-----------|---------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/`; no backend, no schema changes |
| II. Server State Discipline (NON-NEGOTIABLE) | ✅ PASS (planned) | Centralizes mutation cache invalidation via `invalidateSessionCaches`; every attendance/session mutation invalidates `groupAttendance` + `groupLevels` + `dashboard.overview` through `queryClient.invalidateQueries`. This fixes an existing violation. |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores; `useReducer` is component-local UI state in the grid |
| IV. TypeScript Strict Mode | ✅ PASS | `import type` for type-only; no `any`; no enums (const objects / union types) |
| V. Component Naming | ✅ (1 cleanup) | Rename `EditSessionPopup` → `EditSessionModal` (aligns with `*Modal.tsx`); `getNextStatus` moved to `utils/` |
| Cache & API Discipline (factory keys) | ✅ PASS | Uses `queryKeys.groupAttendance/groupLevels/dashboard.overview` factories only |
| Build gates (lint + build) | ✅ PASS | `npm run lint` + `npm run build` must pass before commit |

**Gates**: No unjustified violations. No Complexity Tracking required — all changes move code toward the constitution's conventions.

## Project Structure

### Documentation (this feature)

```text
specs/074-attendance-cache-refresh-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output — decisions & rationale
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── findings-report.md   # Audit findings + severity heatmap
├── spec.md              # Feature spec
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (new/changed files)

```text
src/
├── api/
│   ├── attendance/
│   │   ├── attendance.ts      # CHANGED: re-export getAttendanceForLevel from academics; keep markAttendance
│   │   └── types.ts           # CHANGED: re-export attendance DTOs from academics; keep AttendanceStatus/AttendanceEntry
│   ├── academics/
│   │   └── groups/newEndpoints.ts  # UNCHANGED: remains single source of truth
│   └── types.ts               # NEW (or reuse academics/sessions types): SessionStatus union
├── utils/
│   ├── attendanceStatus.ts    # NEW: getNextStatus + ATTENDANCE_STATUSES
│   └── attendanceInvalidation.ts # NEW: invalidateSessionCaches(qc, {...})
├── hooks/
│   ├── useAttendanceCaches.ts # NEW: useAttendanceInvalidation(groupId) → invalidate({level, selectedDate})
│   └── useGroupAttendance.ts  # UNCHANGED (60s staleTime intentional)
├── components/
│   ├── attendance/
│   │   ├── AttendanceGrid.tsx       # CHANGED: useReducer, shared invalidator, shared getNextStatus, EditSessionModal
│   │   ├── AttendanceTableBody.tsx  # CHANGED: `?? 'not_taken'`
│   │   ├── AttendanceMobileSheet.tsx# CHANGED: `?? 'not_taken'` + Number() key + shared invalidator + shared getNextStatus
│   │   ├── EditSessionPopup.tsx     # RENAMED → EditSessionModal.tsx
│   │   └── types.ts                 # UNCHANGED (StudentRowData view model)
│   ├── groups/LevelsTab.tsx         # CHANGED: useMemo transforms
│   └── common/                      # (imports only)
└── tests/
    └── attendance/
        └── attendanceInvalidation.test.ts  # NEW: cache invalidation test
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

None — the constitution check passed. No complexity tracking entries.

---

*Phase 1 deliverables (data-model.md, contracts/, quickstart.md, agent-context update) are generated by `/speckit.plan` and documented alongside this file.*
