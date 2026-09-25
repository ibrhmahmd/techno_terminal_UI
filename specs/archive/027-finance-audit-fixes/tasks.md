# Tasks: Finance Audit Fixes

**Input**: Design documents from `/specs/027-finance-audit-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No tests requested in the specification. All verification is via build (`npm run build`), lint (`npm run lint`), and manual QA.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/{domain}/`
  - Pages: `src/pages/{domain}Page.tsx`
  - API: `src/api/{domain}/`
  - Common UI: `src/components/common/`
  - Types: `src/types/`
  - Query keys: `src/hooks/queryKeys.ts`
- All changes are modifications to existing source files or deletions of dead files.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

No setup tasks needed – this feature modifies and deletes existing files only. No new directories, routes, or project initialization required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 [P] Add `studentEnrollments` query key factory to `finance` block in `src/hooks/queryKeys.ts` — key pattern: `['finance', 'student-enrollments', studentId]`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Fix Breaking Bugs in Receipt Creation and Search (Priority: P1) 🎯 MVP

**Goal**: Fix 4 runtime bugs: stale error display, zero-amount search results, broken ReceiptDetailPanel fetch, incorrect unpaid totals with >200 enrollments.

**Independent Test**: (a) trigger receipt creation error → real error message appears; (b) advanced search returns receipts with non-zero amounts; (c) click "View Details" → detail panel renders; (d) unpaid metrics match actual data when >200 enrollments.

### Implementation for User Story 1

- [x] T101 [P] [US1] Fix error message display in `src/components/finance/CreateReceiptPanel.tsx` — replace `createError?.message` with the actual caught `err` message in the mutation `onError` callback
- [x] T102 [P] [US1] Fix zero-amount search results in `src/components/finance/TodayReceiptsList.tsx` — map `total_amount` from API response (replace hardcoded `0` on line ~103)
- [x] T103 [P] [US1] Fix broken ReceiptDetailPanel fetch — removed via dead code deletion of `SearchReceiptsPanel.tsx` (View Details bug in `finally` block); also switched live `ReceiptDetailPanel.tsx` to centralized query key factory
- [x] T104 [P] [US1] Fix incorrect unpaid totals with >200 enrollments in `src/hooks/finance/useDailyMetrics.ts` — add pagination loop to fetch all pages of unpaid enrollments

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Keep Dashboard Metrics Up-to-Date After Transactions (Priority: P1)

**Goal**: After creating a receipt, adjusting a balance, or issuing a refund, invalidate metrics and daily receipts cache so dashboard updates within 5 seconds without page refresh.

**Independent Test**: Create receipt → "Today's Receipts" card and list update within 5 seconds without page refresh.

### Implementation for User Story 2

- [ ] T201 [P] [US2] Add `queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })` after successful receipt creation in `src/hooks/finance/useReceipts.ts`
- [ ] T202 [P] [US2] Add `queryClient.invalidateQueries({ queryKey: ['finance', 'daily-receipts'] })` after successful receipt creation in `src/hooks/finance/useReceipts.ts`
- [ ] T203 [P] [US2] Add `queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })` after successful balance adjustment in `src/hooks/finance/useBalance.ts`
- [ ] T204 [P] [US2] Add `queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })` after successful refund issuance in `src/hooks/finance/useRefunds.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Remove Dead Finance Components (Priority: P2)

**Goal**: Delete two dead files — `SearchReceiptsPanel.tsx` (178 lines, zero imports) and `finance/index.ts` (dead barrel).

**Independent Test**: Remove files → `npm run build` passes with zero errors → all finance panels render correctly.

### Implementation for User Story 3

- [x] T301 [P] [US3] Delete `src/components/finance/SearchReceiptsPanel.tsx` — verified zero external imports
- [x] T302 [P] [US3] Delete `src/components/finance/index.ts` — verified all consumers import directly from individual files

**Checkpoint**: User Story 3 should now be independently testable

---

## Phase 6: User Story 4 — Show Correct Payment Method Labels (Priority: P2)

**Goal**: Update `METHOD_LABELS`/`METHOD_COLORS` to show "E-Wallet" and "instaPay" instead of `e_wallet`/`instapay` raw values.

**Independent Test**: Search for receipt paid via E-Wallet → label shows "E-Wallet" with red badge; instaPay → shows "instaPay" with purple badge.

### Implementation for User Story 4

- [ ] T401 [P] [US4] Update `METHOD_LABELS` and `METHOD_COLORS` in `src/components/finance/TodayReceiptsList.tsx` — replace `card`/`transfer` entries with `e_wallet`/`instapay`
- [ ] T402 [P] [US4] Update `METHOD_LABELS` in `src/components/finance/ReceiptDetailPanel.tsx` — same mapping update (card→e_wallet, transfer→instapay)

**Checkpoint**: User Story 4 should now be independently testable

---

## Phase 7: User Story 5 — Harden Runtime Type Safety (Priority: P2)

**Goal**: Add runtime validation arrays for payment method and type values; narrow `PillOption.color` from `string` to union of 4 colors.

**Independent Test**: Inspect receipt creation payload — method/type values pass through `.includes()` validation with fallback to safe default.

### Implementation for User Story 5

- [ ] T501 [P] [US5] Add `const VALID_METHODS = ['cash', 'e_wallet', 'instapay', 'other'] as const` and `const VALID_TYPES = ['course_level', 'competition', 'other'] as const` with `.includes()` guards before type assertions in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T502 [P] [US5] Narrow `PillOption.color` type from `string` to `'emerald' | 'red' | 'purple' | 'slate'` in the `PillOption` interface at `src/components/finance/PaymentMethodPills.tsx`

**Checkpoint**: User Story 5 should now be independently testable

---

## Phase 8: User Story 6 — Improve Accessibility of Finance Interface (Priority: P3)

**Goal**: 14 accessibility fixes across 11 files — ARIA roles, hidden icons, form labels, error boundaries, focus management.

**Independent Test**: Navigate finance page with screen reader → icons not announced, tab controls have proper roles, form inputs are labeled, a crash in one panel doesn't affect others.

### Implementation for User Story 6

- [ ] T601 [P] [US6] Add `aria-hidden="true"` to all `<span className="material-symbols-outlined">` decorative icon instances in `src/components/finance/CreateReceiptPanel.tsx`, `TodayReceiptsList.tsx`, `ReceiptDetailPanel.tsx`, `UnpaidEnrollmentsPanel.tsx`, `UnpaidEnrollmentCard.tsx`, `PaymentMethodPills.tsx`, `ComingSoonPlaceholder.tsx`, and `CreateReceipt/ReceiptLineItemRow.tsx`
- [ ] T602 [P] [US6] Add `role="tablist"` to container and `role="tab"` + `aria-selected={isActive}` to each metric card button in `src/components/common/MetricsStripCards.tsx`
- [ ] T603 [P] [US6] Add matching `htmlFor`/`id` pairs to form labels and inputs in `src/components/finance/CreateReceiptPanel.tsx`, `CreateReceipt/ReceiptLineItemRow.tsx`, `CreateReceipt/EnrollmentSelection.tsx`, and `UnpaidEnrollmentsFilters.tsx`
- [ ] T604 [P] [US6] Wrap each panel section (TodayReceiptsList, CreateReceiptPanel, UnpaidEnrollmentsPanel, ComingSoonPlaceholder) with `<ErrorBoundary>` in `src/pages/FinancePage.tsx`
- [ ] T605 [P] [US6] Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` to the container element in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T606 [P] [US6] Add `aria-label="Close receipt details"` to the close button in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T607 [P] [US6] Add `role="radiogroup"` to filter button groups and `role="radio"` + `aria-checked` to individual filter buttons in `src/components/finance/UnpaidEnrollmentsFilters.tsx` and `UnpaidEnrollmentsPanel.tsx`
- [ ] T608 [P] [US6] Replace bare `title` attribute with `aria-label` on the card element in `src/components/finance/UnpaidEnrollmentCard.tsx`
- [ ] T609 [P] [US6] Add focus management (ref + `tabIndex={-1}` + `.focus()`) on panel container after panel switch in `src/pages/FinancePage.tsx`
- [ ] T610 [P] [US6] Add `aria-hidden="true"` on the Material Symbols icon in `src/components/finance/ComingSoonPlaceholder.tsx`

**Checkpoint**: User Story 6 should now be independently testable

---

## Phase 9: User Story 7 — Migrate Student Enrollments to Cached Query (Priority: P3)

**Goal**: Rewrite `useStudentEnrollments` from manual `useEffect`+`useState` to `useQuery`, enabling cache sharing across components.

**Independent Test**: Two components using `useStudentEnrollments` with same student ID → only one API call made (verified via network tab).

### Implementation for User Story 7

- [ ] T701 [P] [US7] Rewrite `src/hooks/finance/useStudentEnrollments.ts` from `useState`+`useEffect` to `useQuery` using key `queryKeys.finance.studentEnrollments(id)`, `staleTime: 2 * 60 * 1000`, maintain same return type `UseStudentEnrollmentsReturn`
- [ ] T702 [P] [US7] Remove all `console.log` statements from `src/hooks/finance/useStudentEnrollments.ts`

**Checkpoint**: User Story 7 should now be independently testable

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories — catch clause typing, console.log removal, build verification.

- [ ] T801 [P] Change `catch (err)` to `catch (err: unknown)` in `src/hooks/finance/useReceipts.ts`, `useBalance.ts`, `useRefunds.ts`, and `useStudentEnrollments.ts`
- [ ] T802 [P] Remove `console.log` statements from `src/hooks/finance/useReceipts.ts`, `useBalance.ts`, `useRefunds.ts`, and `useDailyMetrics.ts`
- [ ] T803 [P] Remove `alert()` calls from `src/components/finance/UnpaidEnrollmentsPanel.tsx`
- [ ] T804 Run `npm run build` and verify zero errors
- [ ] T805 Run `npm run lint` and verify zero errors in finance-related files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — no tasks needed
- **Foundational (Phase 2)**: No dependencies — add query key factory first (blocks US7)
- **User Stories (Phase 3+)**: All depend on Phase 2 completion for the query key factory (only US7 strictly requires it, but implement Phase 2 first for consistency)
  - User stories can then proceed in parallel (P1 → P2 → P3 priority order recommended)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — Independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) — Independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) — Independently testable
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) — Independently testable
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) — Requires query key factory from Phase 2

### Within Each User Story

- All tasks within a story are in different files — order doesn't matter
- Tasks marked [P] can run in parallel
- Test story independently before moving to next priority

### Parallel Opportunities

- All Phase 2 tasks marked [P] can run in parallel
- Once Phase 2 completes, all user stories (Phases 3–9) can run in parallel
- All tasks marked [P] within a user story can run in parallel
- Polish tasks marked [P] (T801–T803) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all 4 bug fixes together (different files, no dependencies):
Task: "T101 [US1] Fix error display in CreateReceiptPanel.tsx"
Task: "T102 [US1] Fix zero-amount search in TodayReceiptsList.tsx"
Task: "T103 [US1] Fix ReceiptDetailPanel fetch in ReceiptDetailPanel.tsx"
Task: "T104 [US1] Fix unpaid totals in useDailyMetrics.ts"
```

## Parallel Example: User Story 6

```bash
# Launch all accessibility fixes together (different files):
Task: "T601 [US6] aria-hidden on icons (8 files)"
Task: "T602 [US6] MetricsStripCards tablist roles"
Task: "T603 [US6] htmlFor/id on form labels (4 files)"
Task: "T604 [US6] ErrorBoundary per panel in FinancePage.tsx"
Task: "T605 [US6] Dialog role on ReceiptDetailPanel"
Task: "T607 [US6] Radiogroup roles on filter groups"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (query key factory)
2. Complete Phase 3: User Story 1 (4 breaking bug fixes)
3. **STOP and VALIDATE**: Test User Story 1 independently — verify all 4 bug scenarios
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 (P1 bugs) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (P1 cache invalidation) → Test independently → Deploy/Demo
4. Add User Story 3 (P2 dead code) + 4 (P2 labels) + 5 (P2 type safety) → Deploy/Demo
5. Add User Story 6 (P3 a11y) + 7 (P3 migration) → Deploy/Demo
6. Add Polish (Phase 10) → Final build verification

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational (Phase 2) together
2. Once Phase 2 is done:
   - Developer A: User Story 1 (P1 bugs)
   - Developer B: User Story 2 (P1 cache invalidation)
   - Developer C: User Stories 3+4+5 (P2 cleanup)
   - Developer D: User Story 6 (P3 a11y)
   - Developer E: User Story 7 (P3 migration)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests requested in spec — verification is build + lint + manual QA
- All catch clause type fixes (T801) and console.log removal (T802–T803) are deferred to Polish phase
- Commit after each task or logical group
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
