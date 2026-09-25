# Implementation Plan: Student Multi-Selector for Team Registration

**Branch**: `013-student-multi-selector` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-student-multi-selector/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the manual student ID text inputs in `TeamRegistrationModal` with a searchable multi-student selector component (`StudentMultiSelector`) that uses the existing `searchStudents` API and `SpyCombobox` infrastructure. The new component supports search-by-name, multi-selection, removable chips with per-student fee inputs, and is designed for reuse across the app.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Existing Components**: `SpyCombobox` (generic combobox), `StudentCombobox` (single-select student search), `searchStudents` API function  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Performance Goals**: Search results in <500ms, smooth keyboard navigation, no layout shift during search  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single new reusable component + update to `TeamRegistrationModal`. No other pages affected.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | PASS | All changes in `src/` — new component, updated modal |
| II. Server State Discipline | PASS | Uses existing `searchStudents` API function through `src/api/crm/students/search.ts` |
| III. Global State Minimalism | PASS | Local `useState` for selection state, no Zustand needed |
| IV. TypeScript Strict Mode | PASS | All types from existing `StudentListItem` interface, `import type` used |
| V. Component Naming Convention | PASS | `StudentMultiSelector.tsx` → `src/components/common/` (shared component) |
| API Layer (client.ts) | PASS | Uses existing `searchStudents` via `src/api/crm/students/search.ts` |
| Cache Keys (queryKeys.ts) | PASS | No new cache keys needed — search is not cached via React Query (direct API call) |

**Gate Result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/013-student-multi-selector/
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
│   └── crm/students/search.ts    # ← REUSED: searchStudents() already exists
├── components/
│   ├── common/
│   │   ├── SpyCombobox.tsx        # ← REUSED: existing combobox infrastructure
│   │   ├── StudentCombobox.tsx    # ← REFERENCE: single-select pattern
│   │   └── StudentMultiSelector.tsx  # ← NEW: multi-select component
│   └── competitions/
│       └── TeamRegistrationModal.tsx  # ← UPDATED: replace ID inputs with StudentMultiSelector
├── hooks/                         # No changes needed
├── pages/                         # No changes needed
└── types/                         # No changes needed
```

**Structure Decision**: Frontend-only SPA. One new shared component in `src/components/common/`, one updated modal in `src/components/competitions/`. No new hooks, API functions, or pages needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
