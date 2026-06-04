# Implementation Plan: Groups Feature Audit & Fix

**Branch**: `main` | **Date**: 2026-06-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/034-groups-audit/spec.md`

## Summary

Fix 22 findings across 5 categories in the Groups feature: 9 runtime bugs (status mapping, toast loops, missing fallbacks), 3 dead files + 8 dead barrel exports, 6 TypeScript violations (`any`, `as any`, unsafe casts), 2 data fetching anti-patterns (inline query key, redundant invalidations), and 11 accessibility gaps (missing `aria-hidden`, labels, keyboard nav). All changes are frontend-only.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`
**Project Type**: Frontend SPA (React single-page application)
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). Build gate: `tsc -b && vite build` must pass.
**Scale/Scope**: Groups feature spans 24 components, 10 hooks, 15 API files, 14 type files, 2 pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Principle | Status | Notes |
|------|-----------|--------|-------|
| Frontend-Only Scope | I | ✅ PASS | All changes are in `src/` — no backend code |
| Server State Discipline | II | ✅ PASS | Fixes one inline query key violation; no new fetch patterns |
| Global State Minimalism | III | ✅ PASS | Only local state/refs affected; no Zustand changes |
| TypeScript Strict Mode | IV | ✅ PASS | Removing `any` and `as any` usages — strictly improving type safety |
| Component Naming | V | ✅ PASS | Deleting 2 dead components; editing existing ones; no new components violating naming |
| API Layer | Cache & API | ✅ PASS | Using existing Axios client; fixing barrel exports |
| Cache Keys | Cache & API | ✅ PASS | Fixing inline query key to use factory; removing redundant invalidations |
| Build Gates | Workflow | ✅ PASS | Will verify `npm run build` after changes |

All gates pass with no violations. No Complexity Tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/034-groups-audit/
├── spec.md              # Feature specification (audit findings)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (empty — no API contract changes)
```

### Source Code Changes

```text
Deleted (3):
  src/components/groups/TabNavigation.tsx
  src/components/groups/detail/LevelStudentsPanel.tsx
  (barrel entries removed from index.ts files)

Edited (16 files):
  src/components/groups/GroupFilters.tsx
  src/components/groups/GroupColumns.tsx
  src/components/groups/LevelsTab.tsx
  src/components/groups/HistoryTab.tsx
  src/components/groups/GroupBySelector.tsx
  src/components/groups/detail/EditGroupDialog.tsx
  src/components/groups/detail/GroupInfoCard.tsx
  src/components/groups/detail/LevelSelector.tsx
  src/components/groups/detail/AddSessionDialog.tsx
  src/components/groups/shared/GroupStatusBadge.tsx
  src/pages/GroupsPage.tsx
  src/pages/GroupDetailPage.tsx
  src/hooks/useGroups.ts
  src/hooks/useGroupMutations.ts
  src/hooks/useGroupDetail.ts

Barrel cleanup (4 files):
  src/api/academics/groups/index.ts
  src/api/academics/sessions/index.ts
  src/api/academics/courses/index.ts
  src/api/academics/types/common.ts
```

## Verification Plan

```bash
npm run build              # Must pass with zero errors
npm run lint               # Must pass with zero errors
rg ': any' src/components/groups/ src/hooks/useGroup*.ts   # Zero remaining
rg 'console\.' src/components/groups/ src/hooks/useGroup*.ts # Zero remaining (intentional debug = pass)
rg "queryKey: \['" src/components/groups/                  # Zero inline keys
rg 'material-symbols-outlined' src/components/groups/ | rg -v 'aria-hidden'  # Zero unlabeled icons
rg 'role="switch"' src/components/groups/                  # At least 1 (AddSessionDialog toggle)
npm run test -- src/tests/GroupsHeader.test.tsx            # Existing test passes
```
