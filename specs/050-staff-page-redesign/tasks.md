---

description: "Task list for Staff Page Redesign — Design System Alignment"

# Tasks: Staff Page Redesign

**Input**: Design documents from `/specs/050-staff-page-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: No tests requested in feature specification — skip test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Pages: `src/pages/`
  - Shared directory components: `src/components/directory/`
  - Shared common components: `src/components/common/`
- All changes are visual-only — no new API functions, hooks, types, or routes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — shared components already exist. This phase is empty.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — `CardGrid` (`src/components/directory/CardGrid.tsx`), `CardSkeleton` (`src/components/directory/shared/CardSkeleton.tsx`), and `RowActions` (`src/components/common/RowActions.tsx`) already exist and are consumed by GroupCard/StudentCard/ParentCard. All tasks modify existing components within individual user stories.

---

## Phase 3: User Story 1 — Cards Follow App-Wide Design Language (Priority: P1) 🎯 MVP

**Goal**: EmployeeCard uses the same container styling, typography, hover effects, action button layout, icon sizing, and design tokens as GroupCard/StudentCard. Card body is clickable for View with full keyboard accessibility.

**Independent Test**: Load the staff page and compare EmployeeCard to GroupCard — same `shadow-sm` container, `hover:shadow-md hover:border-secondary/30` hover, `font-headline` name, `text-[16px]` icons, `RowActions` in border-top footer, keyboard tab focus works, Enter/Space triggers View.

### Implementation for User Story 1

- [X] T001 [US1] Replace inline skeleton (`{loading && ...}` layout with avatar + 7 placeholder lines) with `CardSkeleton` import from `src/components/directory/shared/CardSkeleton.tsx` in `src/components/staff/EmployeeCard.tsx`
- [X] T002 [US1] Migrate EmployeeCard container classes to match StudentCard/GroupCard: `bg-white rounded-xl border border-slate-200 p-5 shadow-sm` with `hover:shadow-md hover:border-secondary/30 transition-all duration-300` in `src/components/staff/EmployeeCard.tsx`
- [X] T003 [US1] Migrate EmployeeCard name typography from `font-semibold text-slate-900` to `font-headline font-semibold text-on-surface` in `src/components/staff/EmployeeCard.tsx`
- [X] T004 [US1] Replace all secondary text utilities (`text-slate-700`, `text-slate-600`, `text-slate-500`) with `text-on-surface-variant` in `src/components/staff/EmployeeCard.tsx`
- [X] T005 [US1] Change icon sizes from `text-sm` / `text-base` to `text-[16px]` (matching Material Symbols convention) in `src/components/staff/EmployeeCard.tsx`
- [X] T006 [US1] Replace inline action buttons (View Now, Edit, Create Account) with `RowActions` import from `src/components/common/RowActions.tsx` in a `pt-3 border-t border-slate-100` footer — keep View as `variant="primary"`, Edit as `variant="default"`, Create Account as `variant="default"` with `stopPropagation()` in `src/components/staff/EmployeeCard.tsx`
- [X] T007 [US1] Add whole-card click handler for View: wrap card content in a div with `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space → calls `onView`), `className="cursor-pointer"`. Ensure RowActions does not trigger card-level click via `e.stopPropagation()` in `src/components/staff/EmployeeCard.tsx`

**Checkpoint**: EmployeeCard visually matches GroupCard/StudentCard per SC-001. Keyboard navigation works per SC-002. RowActions has all 3 functional buttons per SC-005. No hardcoded `text-slate-*` remain per SC-004.

---

## Phase 4: User Story 2 — Loading & Error States Use Shared Components (Priority: P2)

**Goal**: StaffPage card grid uses `CardGrid` + `CardSkeleton` for loading state, `<EmptyState>` for empty, and `<ErrorState>` banner for failures — matching directory/groups page patterns.

**Independent Test**: Load the staff page and verify (1) during loading, 8 `CardSkeleton` placeholders appear inside a `CardGrid`, (2) if the API fails, an `<ErrorState>` banner renders above the grid, (3) if no employees exist, `<EmptyState>` is shown.

### Implementation for User Story 2

- [X] T008 [P] [US2] Import `CardGrid` from `src/components/directory/CardGrid.tsx` and `CardSkeleton` from `src/components/directory/shared/CardSkeleton.tsx` in `src/pages/StaffPage.tsx`
- [X] T009 [US2] Replace inline skeleton grid (`<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">` wrapping 8 inline skeleton cards, around line 145-157) with `CardGrid` wrapping an array of 8 `<CardSkeleton />` components in `src/pages/StaffPage.tsx`
- [X] T010 [US2] Replace the employee cards grid wrapper (inline grid classes around the employee list) with the `<CardGrid>` component in `src/pages/StaffPage.tsx`
- [X] T011 [US2] Verify `<ErrorState>` banner renders above the `CardGrid` (not inside it) when `error` is truthy in `src/pages/StaffPage.tsx` — move it outside the grid wrapper if currently inside

**Checkpoint**: StaffPage uses shared `CardGrid` and `CardSkeleton`. Loading/empty/error states match directory/groups page patterns per SC-003.

---

## Phase 5: User Story 3 — Detail Dialog Aligns to Design Tokens (Priority: P2)

**Goal**: EmployeeDetailModal uses design system colors and fonts instead of hardcoded gray/blue utilities.

**Independent Test**: Open an employee detail modal and verify (1) labels use `text-on-surface-variant`, (2) values use `text-on-surface`, (3) the Employment Details section background is `bg-surface-container-low` (not `bg-blue-50`), (4) employee name uses `font-headline font-semibold`.

### Implementation for User Story 3

- [X] T012 [P] [US3] Migrate EmployeeDetailModal header/name from `text-slate-900` to `text-on-surface` and employee name from `font-semibold` to `font-headline font-semibold` in `src/components/staff/EmployeeDetailModal.tsx`
- [X] T013 [P] [US3] Replace all secondary text utilities (`text-slate-600`, `text-slate-500`) with `text-on-surface-variant` in `src/components/staff/EmployeeDetailModal.tsx`
- [X] T014 [US3] Replace `bg-blue-50` with `bg-surface-container-low` in the Employment Details section; replace any `text-blue-*` with appropriate `text-on-surface` / `text-on-surface-variant` tokens in `src/components/staff/EmployeeDetailModal.tsx`

**Checkpoint**: EmployeeDetailModal now uses design tokens throughout — no hardcoded `text-slate-*` or `bg-blue-50` classes remain per SC-004. Name uses `font-headline` per SC-005 acceptance scenario 3.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify all changes work together and pass build gates.

- [X] T015 Run `npm run lint` and fix any lint errors across all modified files
- [X] T016 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [X] T017 Final visual review: confirm all 6 SC-001 measurable checkpoints pass (container, hover, typography, icon sizing, secondary text color, RowActions footer)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — empty (shared components already exist)
- **Foundational (Phase 2)**: No dependencies — empty (no blocking prerequisites)
- **User Story 1 (Phase 3)**: No dependencies — EmployeeCard is a standalone component with no imports from other modified files
- **User Story 2 (Phase 4)**: No dependencies on US1 or US3 — StaffPage wraps EmployeeCard but the props interface (`employee`, `onView`, `onEdit`, `onCreateAccount`, `loading`) is unchanged; can run in parallel with US1 and US3
- **User Story 3 (Phase 5)**: No dependencies — EmployeeDetailModal is a separate file with no imports from EmployeeCard or StaffPage
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — standalone component refactoring
- **User Story 2 (P2)**: No dependencies — StaffPage changes are independent; uses same props for EmployeeCard (unchanged interface)
- **User Story 3 (P2)**: No dependencies — separate file

### Within Each User Story

- US1 tasks are sequential (all in EmployeeCard.tsx, same file):
  - T001–T006 can be applied in any order (different CSS/import concerns within the file)
  - T007 must be last (adds event handlers after structure is in place)
- US2 tasks are sequential (all in StaffPage.tsx, same file):
  - T008 first (imports), then T009–T011 in any order
- US3 tasks (all in EmployeeDetailModal.tsx):
  - T012 and T013 can be in any order (different CSS tokens)
  - T014 last (larger structural change)

### Parallel Opportunities

- US1 (T001–T007), US2 (T008–T011), and US3 (T012–T014) can ALL run in FULL PARALLEL since they touch different files with no cross-file dependencies
- Within US3: T012 and T013 can run in parallel (different CSS concerns in same file)

---

## Parallel Example: All Three User Stories (Concurrent)

```bash
# User Story 1 — EmployeeCard.tsx (all 7 tasks, sequential within file):
Task: "T001 Replace inline skeleton with CardSkeleton"
Task: "T002 Migrate container CSS"
Task: "T003 Migrate name typography"
Task: "T004 Replace text color tokens"
Task: "T005 Fix icon sizes"
Task: "T006 Replace inline buttons with RowActions"
Task: "T007 Add whole-card click handler"

# User Story 2 — StaffPage.tsx (all 4 tasks, sequential within file):
Task: "T008 Import CardGrid and CardSkeleton"
Task: "T009 Replace inline skeleton grid with CardGrid + CardSkeleton"
Task: "T010 Wrap employee card list with CardGrid"
Task: "T011 Verify ErrorState position"

# User Story 3 — EmployeeDetailModal.tsx (3 tasks, sequential within file):
Task: "T012 Migrate header/name text tokens"
Task: "T013 Replace secondary text tokens"
Task: "T014 Replace bg-blue-50 with bg-surface-container-low"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (T001–T007)
2. **STOP and VALIDATE**: Run lint + build, visually verify EmployeeCard matches GroupCard/StudentCard per SC-001
3. Deploy/demo if ready — EmployeeCard visual upgrade is self-contained and the most visible improvement

### Incremental Delivery

1. Add Phase 3 (US1: EmployeeCard tokens + RowActions + a11y) → Test independently → Deploy/Demo (MVP!)
2. Add Phase 4 (US2: StaffPage grid + loading) → Test independently → Deploy/Demo
3. Add Phase 5 (US3: EmployeeDetailModal tokens) → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Strategy

With three developers:
1. Developer A: User Story 1 (EmployeeCard — T001–T007)
2. Developer B: User Story 2 (StaffPage — T008–T011) — parallel with US1
3. Developer C: User Story 3 (EmployeeDetailModal — T012–T014) — parallel with US1 and US2
4. All three merge independently (different files → no merge conflicts)
5. Polish (T015–T017) after all stories merged

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable — no cross-story blocking dependencies
- Build gates (lint + build) must pass after each phase
- All modified files are in `src/components/staff/` and `src/pages/` — no new files created
- No `import type` changes needed (existing type imports unchanged)
- Design token reference: `text-on-surface` for primary text, `text-on-surface-variant` for secondary, `bg-surface-container-low` for subtle backgrounds, `font-headline` for names
