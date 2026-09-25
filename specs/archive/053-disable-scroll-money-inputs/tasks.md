# Tasks: Disable Scroll Wheel on Money Inputs

**Feature**: `specs/053-disable-scroll-money-inputs/spec.md`
**Plan**: `specs/053-disable-scroll-money-inputs/plan.md`
**Research**: `specs/053-disable-scroll-money-inputs/research.md`
**Quickstart**: `specs/053-disable-scroll-money-inputs/quickstart.md`

## Task Convention

```
- [ ] TNNN [P?] [Story?] Description with file path
```

- `[P]` = parallelizable (no dependency on other incomplete tasks)
- `[US1]` = user story label

---

## Phase 1: Setup

- [x] T001 Read `specs/053-disable-scroll-money-inputs/research.md` to understand the chosen technique: `onWheel={(e) => (e.target as HTMLInputElement).blur()}`

---

## Phase 2: Apply Scroll Prevention — US1 + US2 + US3

All tasks below are fully parallel — every input is independent and can be edited in any order. The same 1-line addition goes into each.

**Pattern to add**: `onWheel={(e) => (e.target as HTMLInputElement).blur()}` — add immediately after the `onChange` prop on each `<input type="number">`.

### Receipts — `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx`

- [x] T002 [P] [US1] Add `onWheel` scroll prevention to Amount input at `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx:86`
- [x] T003 [P] [US1] Add `onWheel` scroll prevention to Discount input at `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx:97`

### Enrollments — `src/components/enrollments/ModifyEnrollmentPanel.tsx`

- [x] T004 [P] [US1] Add `onWheel` scroll prevention to Amount Due input at `src/components/enrollments/ModifyEnrollmentPanel.tsx:232`
- [x] T005 [P] [US1] Add `onWheel` scroll prevention to Discount Applied input at `src/components/enrollments/ModifyEnrollmentPanel.tsx:249`

### Enrollments — `src/components/enrollments/EditEnrollmentModal.tsx`

- [x] T006 [P] [US1] Add `onWheel` scroll prevention to Amount Due input at `src/components/enrollments/EditEnrollmentModal.tsx:85`
- [x] T007 [P] [US1] Add `onWheel` scroll prevention to Discount Applied input at `src/components/enrollments/EditEnrollmentModal.tsx:102`

### Competition Payments — `src/pages/TeamDetailPage.tsx`

- [x] T008 [P] [US1] Add `onWheel` scroll prevention to Payment Amount input at `src/pages/TeamDetailPage.tsx:749`
- [x] T009 [P] [US1] Add `onWheel` scroll prevention to Refund Amount input at `src/pages/TeamDetailPage.tsx:825`

### Staff Salary — `src/components/staff/EmployeeForm/WorkSettingsSection.tsx`

- [x] T010 [P] [US1] Add `onWheel` scroll prevention to Monthly Salary input at `src/components/staff/EmployeeForm/WorkSettingsSection.tsx:64`

### Course Price — `src/components/courses/CourseForm.tsx`

- [x] T011 [P] [US1] Add `onWheel` scroll prevention to Price Per Level input at `src/components/courses/CourseForm.tsx:163`

### Competition Fee — `src/components/competitions/CompetitionForm.tsx`

- [x] T012 [P] [US1] Add `onWheel` scroll prevention to Fee per Student input at `src/components/competitions/CompetitionForm.tsx:153`

### Student Multi-Selector Fee — `src/components/common/StudentMultiSelector.tsx`

- [x] T013 [P] [US1] Add `onWheel` scroll prevention to Per-student Fee input at `src/components/common/StudentMultiSelector.tsx:157`

### Progress Level Price Override — `src/components/groups/detail/ProgressLevelDialog.tsx`

- [x] T014 [P] [US1] Add `onWheel` scroll prevention to Price Override input at `src/components/groups/detail/ProgressLevelDialog.tsx:239`

### Finance Filter — `src/components/finance/UnpaidEnrollmentsFilters.tsx`

- [x] T015 [P] [US1] Add `onWheel` scroll prevention to Min Balance filter input at `src/components/finance/UnpaidEnrollmentsFilters.tsx:52`

### Verify Existing — `src/components/enrollments/EnrollPanel.tsx`

- [x] T016 [P] [US1] Verify scroll prevention already present on Course Fee (line 230) and Discount (line 249) inputs — confirm `onWheel` handler exists, no change needed

---

## Phase 3: Verification

- [x] T017 Run `npm run build` — must pass zero errors (includes `tsc -b && vite build`)
- [x] T018 Run `npm run lint` — must pass with no new errors (pre-existing errors are acceptable)
- [ ] T019 Manual QA: focus each of the 14 modified inputs, scroll up/down with mouse wheel — value must not change, input should lose focus on scroll attempt

---

## Dependencies

```
T001 (read research) → T002–T016 (apply fix, fully parallel) → T017 (build) → T018 (lint) → T019 (manual QA)
```

All 15 file-edit tasks (T002–T016) are independent — they modify different files and can be executed in any order or concurrently.

---

## Parallel Execution Opportunities

| Task Group | Tasks | Degree of Parallelism |
|-----------|-------|----------------------|
| Setup read | T001 | Single task |
| **Apply scroll prevention** | **T002–T016** | **15-way parallel** — all independently editable |
| Build + Lint | T017–T018 | Sequential (build first, lint second) |
| Manual QA | T019 | Single task |

---

## Implementation Strategy

**MVP** (Phase 2 tasks only): All 15 tasks can be done in a single pass. The fix is purely additive (no logic changes, no refactoring). Build and lint verification ensures zero regressions.

**Risk**: Minimal — the `onWheel` → `blur()` pattern is already proven in `EnrollPanel.tsx`. Each change is a single line added to an existing input element.

**Total**: 15 tasks (T002–T016) to apply the fix across 14 inputs + 1 verification, plus 3 verification tasks.
