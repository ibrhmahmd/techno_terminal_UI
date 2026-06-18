# Tasks: Combobox Feature Audit & Fix

**Input**: Design documents from `/specs/049-combobox-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared hooks and utilities needed by all combobox components

- [x] T001 [P] Create `src/hooks/useClickOutside.ts` — shared click-outside detection hook
- [x] T002 [P] Create `src/hooks/useDropdownPosition.ts` — shared viewport flip hook
- [x] T003 [P] Create `src/utils/categorySelection.ts` — shared category selection utility

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Add `enabled` guard to `useEmployees` in `src/hooks/useStaff.ts` — prevent fetch on mount with empty string
- [x] T005 [P] Verify shared hooks compile: run `npm run build` to ensure no TypeScript errors in new hooks

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Eliminate runtime bugs in combobox components for application stability

**Independent Test**: Verify InstructorCombobox debounces search, SpyCombobox handles special characters, no console errors

### Implementation for User Story 1

- [x] T006 [US1] Add debounce to `src/components/common/combobox/InstructorCombobox.tsx` — add `debouncedSearch` state with 300ms delay
- [x] T007 [US1] Fix CSS.escape in `src/components/common/SpyCombobox.tsx:177` — escape category IDs in querySelector
- [x] T008 [US1] Fix stale-closure in `src/components/common/combobox/StudentCombobox.tsx:56` — inline position logic in useEffect
- [x] T009 [US1] Fix stale-closure in `src/components/common/combobox/GroupCombobox.tsx:78` — inline position logic in useEffect
- [x] T010 [US1] Fix stale-closure in `src/components/common/combobox/InstructorCombobox.tsx:48` — inline position logic in useEffect

**Checkpoint**: Runtime bugs fixed - application is stable

---

## Phase 4: User Story 2 - Remove Dead Code (Priority: P2)

**Goal**: Remove unused code and extract shared logic for maintainability

**Independent Test**: Verify no unused exports, shared hooks work correctly, barrel file is clean

### Implementation for User Story 2

- [x] T011 [P] [US2] Remove unused props from `GroupComboboxProps` in `src/components/common/combobox/GroupCombobox.tsx:6-16` — remove groups, isLoading, recentGroupIds
- [x] T012 [P] [US2] Delete `src/hooks/useRecentGroups.ts` — unused hook with zero consumers
- [ ] T013 [US2] Refactor `src/components/common/combobox/StudentCombobox.tsx` to use `useClickOutside` hook
- [ ] T014 [US2] Refactor `src/components/common/combobox/GroupCombobox.tsx` to use `useClickOutside` hook
- [ ] T015 [US2] Refactor `src/components/common/combobox/InstructorCombobox.tsx` to use `useClickOutside` hook
- [ ] T016 [US2] Refactor `src/components/common/combobox/StudentCombobox.tsx` to use `useDropdownPosition` hook
- [ ] T017 [US2] Refactor `src/components/common/combobox/GroupCombobox.tsx` to use `useDropdownPosition` hook
- [ ] T018 [US2] Refactor `src/components/common/combobox/InstructorCombobox.tsx` to use `useDropdownPosition` hook
- [ ] T019 [US2] Refactor all 3 comboboxes to use `computeActiveCategory` from `src/utils/categorySelection.ts`
- [ ] T020 [US2] Remove unused type exports from `src/components/common/combobox/index.ts` — remove StudentComboboxProps, GroupComboboxProps, InstructorComboboxProps if unused

**Checkpoint**: Dead code removed, shared logic extracted

---

## Phase 5: User Story 3 - Fix TypeScript Violations (Priority: P2)

**Goal**: Eliminate TypeScript type safety issues for strict type checking

**Independent Test**: Verify `npm run build` passes with zero TS errors, no `any` types, no unsafe assertions

### Implementation for User Story 3

- [x] T021 [P] [US3] Fix `import React` in `src/components/common/SpyCombobox.tsx:1` — split into `import type React` + value imports
- [x] T022 [P] [US3] Replace `as EnrichedGroupPublic` assertion in `src/components/common/combobox/GroupCombobox.tsx:107` — use `satisfies` with explicit instructor_name field
- [x] T023 [P] [US3] Replace `as EmployeeListItem` assertion in `src/components/common/combobox/InstructorCombobox.tsx:70` — use `satisfies` with explicit employment_type field
- [x] T024 [P] [US3] Remove redundant `as StudentListItem` assertion in `src/components/common/combobox/StudentCombobox.tsx:74` — inferred type is structurally assignable
- [x] T025 [P] [US3] Remove redundant type annotation `let list: EnrichedGroupPublic[]` in `src/components/common/combobox/GroupCombobox.tsx:100`

**Checkpoint**: TypeScript violations fixed, strict mode compliance achieved

---

## Phase 6: User Story 4 - Fix Data Fetching Anti-Patterns (Priority: P1)

**Goal**: Follow React Query best practices for efficient data fetching

**Independent Test**: Verify InstructorCombobox uses debounced search, no unnecessary API calls on mount

### Implementation for User Story 4

- [x] T026 [US4] Wire InstructorCombobox to use debounced search — pass `debouncedSearch` to `useEmployees` instead of raw `search`
- [x] T027 [US4] Verify `useEmployees` hook respects `enabled` guard — confirm no fetch when search < 2 chars

**Checkpoint**: Data fetching follows React Query best practices

---

## Phase 7: User Story 5 - Fix Accessibility Violations (Priority: P1)

**Goal**: Make comboboxes fully accessible for assistive technology users

**Independent Test**: Verify all inputs have aria-labels, tabs have proper roles, icons are hidden from screen readers

### Implementation for User Story 5

- [x] T028 [P] [US5] Add `aria-label="Search student"` to input in `src/components/common/combobox/StudentCombobox.tsx:186`
- [x] T029 [P] [US5] Add `aria-label="Search group"` to input in `src/components/common/combobox/GroupCombobox.tsx:224`
- [x] T030 [P] [US5] Add `aria-label="Search instructor"` to input in `src/components/common/combobox/InstructorCombobox.tsx:158`
- [x] T031 [P] [US5] Add `aria-label="Search"` to input in `src/components/common/SpyCombobox.tsx:264`
- [x] T032 [P] [US5] Add `aria-label="Clear search"` to clear buttons in StudentCombobox, GroupCombobox, InstructorCombobox
- [x] T033 [P] [US5] Add `role="tablist"` to category tab containers in all 3 comboboxes
- [x] T034 [P] [US5] Add `role="tab"` and `aria-selected` to category tab buttons in all 3 comboboxes
- [x] T035 [P] [US5] Add `aria-hidden="true"` to decorative search icons in SpyCombobox.tsx:263 and category header icons
- [ ] T036 [P] [US5] Add `role="button"`, `tabIndex={0}`, keyboard handlers to sidebar nav items in SpyCombobox.tsx:312
- [ ] T037 [P] [US5] Add `role="button"`, `tabIndex={-1}`, keyboard handlers to result items in SpyCombobox.tsx:367
- [x] T038 [P] [US5] Add `role="listbox"` and `aria-label` to dropdown panels in all 3 comboboxes
- [x] T039 [US5] Add `aria-label="Select student {name}"` to result card buttons in StudentCombobox.tsx:306
- [x] T040 [US5] Add `aria-label="Select group {name}"` to result card buttons in GroupCombobox.tsx:348
- [x] T041 [US5] Add `aria-label="Select instructor {name}"` to result card buttons in InstructorCombobox.tsx:251

**Checkpoint**: All accessibility violations resolved

---

## Phase 8: User Story 6 - Fix React Performance Issues (Priority: P3)

**Goal**: Optimize combobox rendering for large datasets

**Independent Test**: Verify no O(n×m) operations in render loops, components wrapped in React.memo

### Implementation for User Story 6

- [x] T042 [P] [US6] Create `recentIdSet` useMemo in `src/components/common/combobox/StudentCombobox.tsx` — replace `.some()` with `Set.has()`
- [x] T043 [P] [US6] Create `recentIdSet` useMemo in `src/components/common/combobox/GroupCombobox.tsx` — replace `.some()` with `Set.has()`
- [x] T044 [P] [US6] Create `recentIdSet` useMemo in `src/components/common/combobox/InstructorCombobox.tsx` — replace `.some()` with `Set.has()`
- [x] T045 [P] [US6] Create `excludeSet` useMemo in `src/components/common/combobox/GroupCombobox.tsx:91` — replace `.includes()` with `Set.has()`
- [x] T046 [US6] Wrap `StudentCombobox` in `React.memo` in `src/components/common/combobox/StudentCombobox.tsx:14`
- [x] T047 [US6] Wrap `GroupCombobox` in `React.memo` in `src/components/common/combobox/GroupCombobox.tsx:23`
- [x] T048 [US6] Wrap `InstructorCombobox` in `React.memo` in `src/components/common/combobox/InstructorCombobox.tsx:11`
- [ ] T049 [US6] Wrap `SpyCombobox` in `React.memo` in `src/components/common/SpyCombobox.tsx:55`
- [ ] T050 [US6] Remove redundant derived state `useEffect(() => setInputValue(search))` in `src/components/common/SpyCombobox.tsx:100`
- [ ] T051 [US6] Consolidate 3 consecutive useEffects in `src/components/common/SpyCombobox.tsx:116-133`

**Checkpoint**: Performance optimized, no O(n×m) operations

---

## Phase 9: User Story 7 - Fix UI Polish & Design System Issues (Priority: P3)

**Goal**: Apply consistent design system patterns across all comboboxes

**Independent Test**: Verify glassmorphism applied, focus-visible used, semantic buttons, motion-safe animations

### Implementation for User Story 7

- [x] T052 [P] [US7] Apply glassmorphism `bg-white/70 backdrop-blur-xl` to dropdown in `src/components/common/combobox/StudentCombobox.tsx:214`
- [x] T053 [P] [US7] Apply glassmorphism `bg-white/70 backdrop-blur-xl` to dropdown in `src/components/common/combobox/GroupCombobox.tsx:252`
- [x] T054 [P] [US7] Apply glassmorphism `bg-white/70 backdrop-blur-xl` to dropdown in `src/components/common/combobox/InstructorCombobox.tsx:186`
- [x] T055 [P] [US7] Apply glassmorphism `bg-white/70 backdrop-blur-xl` to dropdown in `src/components/common/SpyCombobox.tsx:277`
- [x] T056 [P] [US7] Replace `focus:outline-none focus:ring-2` with `focus-visible:ring-2 focus-visible:outline-none` in StudentCombobox.tsx:195
- [x] T057 [P] [US7] Replace `focus:outline-none focus:ring-2` with `focus-visible:ring-2 focus-visible:outline-none` in GroupCombobox.tsx:233
- [x] T058 [P] [US7] Replace `focus:outline-none focus:ring-2` with `focus-visible:ring-2 focus-visible:outline-none` in InstructorCombobox.tsx:167
- [ ] T059 [P] [US7] Replace `outline-none` with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30` in SpyCombobox.tsx:271
- [x] T060 [P] [US7] Convert `<div role="button">` to `<button type="button">` in StudentCombobox.tsx:306
- [x] T061 [P] [US7] Convert `<div role="button">` to `<button type="button">` in GroupCombobox.tsx:348
- [x] T062 [P] [US7] Convert `<div role="button">` to `<button type="button">` in InstructorCombobox.tsx:251
- [ ] T063 [P] [US7] Convert sidebar `<div onClick>` to `<button>` in SpyCombobox.tsx:312
- [x] T064 [P] [US7] Add `motion-safe:` prefix to `animate-pulse` in StudentCombobox.tsx:280
- [x] T065 [P] [US7] Add `motion-safe:` prefix to `animate-pulse` in GroupCombobox.tsx:316
- [x] T066 [P] [US7] Add `motion-safe:` prefix to `animate-pulse` in InstructorCombobox.tsx:224
- [x] T067 [P] [US7] Add `motion-safe:` prefix to `animate-pulse` in SpyCombobox.tsx:41
- [x] T068 [P] [US7] Fix spacing `p-3.5` → `p-4` in StudentCombobox.tsx (lines 144, 327)
- [x] T069 [P] [US7] Fix spacing `p-3.5` → `p-4` in GroupCombobox.tsx (lines 180, 369)
- [x] T070 [P] [US7] Fix spacing `p-3.5` → `p-4` in InstructorCombobox.tsx (lines 128, 272)
- [x] T071 [P] [US7] Replace `transition-all` with `transition-colors` in StudentCombobox.tsx:195
- [x] T072 [P] [US7] Replace `transition-all` with `transition-colors` in GroupCombobox.tsx:233
- [x] T073 [P] [US7] Replace `transition-all` with `transition-colors` in InstructorCombobox.tsx:167

**Checkpoint**: UI polish complete, design system compliance achieved

---

## Phase 10: User Story 8 - Relocate Domain-Specific Components (Priority: P2)

**Goal**: Move domain-specific comboboxes to their domain directories for architecture compliance

**Independent Test**: Verify all imports updated, components work from new locations, no broken references

### Implementation for User Story 8

- [x] T074 [US8] Move `src/components/common/combobox/StudentCombobox.tsx` → `src/components/student/StudentCombobox.tsx`
- [x] T075 [US8] Move `src/components/common/combobox/GroupCombobox.tsx` → `src/components/groups/GroupCombobox.tsx`
- [x] T076 [US8] Move `src/components/common/combobox/InstructorCombobox.tsx` → `src/components/staff/InstructorCombobox.tsx`
- [x] T077 [US8] Update `src/components/common/combobox/index.ts` — remove relocated component exports, keep only SpyCombobox
- [x] T078 [US8] Update imports in `src/pages/TeamDetailPage.tsx` — StudentCombobox from new location
- [x] T079 [US8] Update imports in `src/components/enrollments/ModifyEnrollmentPanel.tsx` — StudentCombobox from new location
- [x] T080 [US8] Update imports in `src/components/enrollments/EnrollPanel.tsx` — StudentCombobox, GroupCombobox from new locations
- [x] T081 [US8] Update imports in `src/components/enrollments/DropEnrollmentPanel.tsx` — StudentCombobox, GroupCombobox from new locations
- [x] T082 [US8] Update imports in `src/components/teams/TeamEditModal.tsx` — InstructorCombobox from new location
- [x] T083 [US8] Update imports in `src/components/competitions/TeamRegistrationModal.tsx` — GroupCombobox, InstructorCombobox from new locations
- [x] T084 [US8] Update imports in `src/components/student/EnrollmentsTab.tsx` — GroupCombobox from new location
- [x] T085 [US8] Update imports in `src/components/settings/UsersTab.tsx` — InstructorCombobox from new location
- [x] T086 [US8] Update imports in `src/components/finance/UnpaidEnrollmentsFilters.tsx` — GroupCombobox from new location
- [x] T087 [US8] Update imports in `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` — StudentCombobox from new location
- [x] T088 [US8] Fix relative import paths in moved files — adjust `../../../` to correct depth

**Checkpoint**: Architecture compliant, domain components in domain directories

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T089 Run `npm run build` — verify zero TypeScript errors
- [ ] T090 Run `npm run lint` — verify zero ESLint errors
- [ ] T091 Verify no remaining `: any` types in combobox files
- [ ] T092 Verify no remaining `console.*` statements in combobox files
- [ ] T093 Verify no remaining `export default` in combobox files
- [ ] T094 Verify no remaining `useEffect.*get` patterns in combobox files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Phase 2 completion
  - US1 (Runtime Bugs) - P1 - Start immediately after Phase 2
  - US4 (Data Fetching) - P1 - Start immediately after Phase 2
  - US5 (Accessibility) - P1 - Start immediately after Phase 2
  - US2 (Dead Code) - P2 - Start after US1 (uses shared hooks)
  - US3 (TypeScript) - P2 - Can run in parallel with US2
  - US8 (Relocate) - P2 - Start after US2 (components already modified)
  - US6 (Performance) - P3 - Start after US5 (accessibility changes complete)
  - US7 (UI Polish) - P3 - Start after US5 (accessibility changes complete)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Runtime Bugs)**: No dependencies - start after Phase 2
- **US2 (Dead Code)**: Depends on US1 (uses useClickOutside, useDropdownPosition)
- **US3 (TypeScript)**: No dependencies - can run in parallel with US1, US2
- **US4 (Data Fetching)**: No dependencies - start after Phase 2
- **US5 (Accessibility)**: No dependencies - start after Phase 2
- **US6 (Performance)**: Depends on US5 (accessibility changes should be complete first)
- **US7 (UI Polish)**: Depends on US5 (accessibility changes should be complete first)
- **US8 (Relocate)**: Depends on US2 (components already modified with shared hooks)

### Within Each User Story

- Shared hooks/utilities first (if creating new)
- Component modifications in dependency order
- Import updates last

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- All Foundational tasks (T004-T005) can run in parallel
- US1 tasks (T006-T010) can run in parallel (different files)
- US2 tasks (T011-T012) can run in parallel
- US3 tasks (T021-T025) can run in parallel
- US5 tasks (T028-T041) can run in parallel (different files)
- US7 tasks (T052-T073) can run in parallel
- US8 tasks (T078-T088) can run in parallel (different consumer files)

---

## Parallel Example: User Story 1

```bash
# All US1 tasks can run in parallel (different files):
Task: "Add debounce to InstructorCombobox.tsx"
Task: "Fix CSS.escape in SpyCombobox.tsx"
Task: "Fix stale-closure in StudentCombobox.tsx"
Task: "Fix stale-closure in GroupCombobox.tsx"
Task: "Fix stale-closure in InstructorCombobox.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US4 + US5)

1. Complete Phase 1: Setup (shared hooks)
2. Complete Phase 2: Foundational (enabled guard)
3. Complete Phase 3: US1 - Fix Runtime Bugs
4. Complete Phase 6: US4 - Fix Data Fetching
5. Complete Phase 7: US5 - Fix Accessibility
6. **STOP and VALIDATE**: Run `npm run build` and `npm run lint`
7. Deploy if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 + US4 + US5 → Stable, accessible comboboxes (MVP!)
3. US2 + US3 → Clean, type-safe code
4. US8 → Architecture compliant
5. US6 + US7 → Optimized, polished UI

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify build passes after each phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
