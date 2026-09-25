# Implementation Plan: Directory Page Audit & Fix

**Branch**: `main` | **Date**: 2026-06-11 | **Spec**: `specs/047-directory-page-audit/spec.md`
**Input**: Feature specification from `/specs/047-directory-page-audit/spec.md`

## Summary

Fix 85 audit findings across the directory page: 1 critical runtime bug (null crash), 3 dead hooks + 12 dead barrel exports, 6 unsafe TS casts, 4 staleTime/dedup data-fetch issues, 10 a11y gaps (focus-visible, aria, font-headline, ErrorBoundary), 16 React perf improvements (Promise.all, direct imports, useMemo, Map lookups, lazy loading), 7 arch violations (misplaced hook, barrel gaps), and 19 UI polish fixes (contrast, spacing, motion-safe, hover states, semantic HTML). All changes are frontend-only.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`  
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

| Gate | Rule | Status | Notes |
|------|------|--------|-------|
| I | Frontend-Only Scope | ✅ PASS | All changes in `src/`, no backend |
| II | Server State Discipline | ✅ PASS | Fixes staleTime/cache patterns, removes duplicate fetches. No raw fetch introduced |
| III | Global State Minimalism | ✅ PASS | No new Zustand stores. Uses React Query + local state |
| IV | TypeScript Strict Mode | ✅ PASS | Eliminates unsafe casts, adds type guards, removes unused imports |
| V | Component Naming Convention | ✅ PASS | US7 addresses naming violations (Panel→Form, Slider→Nav) |

**Post-Phase 1 Re-check (2026-06-11)**: ✅ All gates still pass. No new data models, contracts, or schema introduced. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/047-directory-page-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── findings-report.md   # Full audit heatmap & per-file scoring
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code

```text
src/
├── api/crm/students/
│   ├── index.ts              # Prune 12 unused barrel type exports (US2)
│   ├── utils.ts              # Add isStudentListItem/toStudentListItem to barrel (US7)
│   └── waiting-list.ts       # No changes needed
├── api/crm/parents.ts        # No changes needed
├── components/common/
│   ├── MetricsStripCards.tsx  # Add aria-controls, aria-orientation (US5)
│   └── SearchBar.tsx          # Add aria-hidden, focus-visible (US5)
├── components/directory/
│   ├── hooks/useStudentActions.ts → MOVED to src/hooks/directory/ (US7)
│   ├── AdvancedSearchPanel.tsx  # motion-safe guard, spacing, barrel→direct (US6, US8)
│   ├── AlphabetSlider.tsx       # focus-visible, spacing (h-7→h-8) (US5, US8)
│   ├── StudentCard.tsx          # focus-visible, barrel→direct (US5, US6)
│   ├── ParentCard.tsx           # focus-visible, barrel→direct (US5, US6)
│   ├── StudentGroupBySelector.tsx # focus-visible, spacing, contrast, barrel→direct (US5, US6, US8)
│   └── shared/CardSkeleton.tsx  # motion-safe:animate-pulse (US8)
├── components/crm/
│   ├── StudentMobileCard.tsx     # aria-hidden, font-headline, hover, contrast, <a> (US5, US8)
│   ├── ParentMobileCard.tsx      # font-headline, hover, contrast, <a> (US5, US8)
│   ├── WaitingListPanel.tsx      # motion-safe, useMemo, spacing (US6, US8)
│   └── WaitingStudentCard.tsx    # font-headline, focus-visible (US5, US8)
├── hooks/
│   ├── queryKeys.ts              # No changes needed (already has directory keys)
│   ├── useWaitingList.ts         # Remove 3 dead hooks, fix staleTime (US2, US4)
│   ├── useStudentsGrouped.ts     # No changes needed
│   ├── useDirectory.ts           # Fix staleTime in 2 hooks (US4)
│   └── directory/
│       ├── useDirectoryData.ts   # Remove redundant cast, fix waiting count (US3, US4)
│       ├── useAdvancedSearch.ts  # useMemo for hasActiveFilters (US6)
│       └── useStudentActions.ts  # MOVED from components/directory/hooks/ (US7)
├── pages/
│   └── DirectoryPage.tsx         # null guard, barrel→direct, ErrorBoundary, Map lookups, PANEL_ORDER, useState lazy, lazy imports, spacing (US1, US5, US6, US8)
```

## Complexity Tracking

> Not needed — all constitution gates pass with no violations.
