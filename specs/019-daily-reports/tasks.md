---

description: "Task list for Daily Reports feature implementation"

---

# Tasks: Daily Reports

**Input**: Design documents from `specs/019-daily-reports/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/daily-reports-api.md

**Tests**: Test tasks are included in the Polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/components/reports/hooks/`
  - Pages: `src/pages/`
  - Tests: `src/tests/`
- Reports follow the existing atoms/molecules/organisms/hooks pattern under `src/components/reports/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directories and verify existing structure.

- [X] T001 [P] Create `src/api/reports/` directory
- [X] T002 [P] Read and understand the current `src/pages/ReportsPage.tsx` tab structure and `src/components/reports/molecules/TabNavigation.tsx` TabId type

**Checkpoint**: Directories ready, ReportsPage structure understood.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API functions and types that MUST be complete before ANY user story can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create `src/api/reports/daily.ts` with `getDailyReportData(targetDate: string)` — calls `GET /notifications/reports/daily/data?target_date=...`, returns `ApiResponse<DailyReportData>`
- [X] T004 [P] Add `getDailyReportPdf(targetDate: string)` to `src/api/reports/daily.ts` — calls `POST /notifications/reports/daily?target_date=...` (no body), returns `ApiResponse<DailyReportPdf>`
- [X] T005 [P] Add `sendDailyReportEmail(targetDate: string, recipients: string[])` to `src/api/reports/daily.ts` — calls `POST /notifications/reports/daily?target_date=...` with `{email_recipients: [...]}`, returns `ApiResponse<string>`
- [X] T006 [P] Add all TypeScript interfaces to `src/api/reports/daily.ts`: `DailyReportData`, `DailyReportPdf`, `EmailSendPayload`, `PaymentDetail`, `SessionDetail`, `PaymentsByTypeItem`, `InstructorSummaryItem` using `import type` for envelope types
- [X] T007 [P] Create `src/components/reports/hooks/useDailyReport.ts` with `useDailyReportData(date: string | undefined)` — React Query hook with `queryKey: ['daily-report', 'data', date]`, `staleTime: 0`, `enabled: !!date`
- [X] T008 [P] Add `useDailyReportPdf()` to `src/components/reports/hooks/useDailyReport.ts` — `useMutation` for one-shot PDF download
- [X] T009 [P] Add `useSendDailyReport()` to `src/components/reports/hooks/useDailyReport.ts` — `useMutation` for email send

**Checkpoint**: Foundation ready — all 3 API functions callable, all 3 hooks ready. User story implementation can now begin.

---

## Phase 3: User Story 1 — View & Download Daily Report (Priority: P1) 🎯 MVP

**Goal**: An admin can view a daily report summary (revenue, attendance, enrollments, sessions) as structured JSON data and download it as a PDF.

**Independent Test**: Login as admin, navigate to Reports > Daily, select a date with data, see the summary dashboard with KPI cards and session details. Click "Download PDF" and receive a PDF file. Select a date with no data and see an empty state message.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create `src/components/reports/atoms/ReportSummaryCards.tsx` — renders 4 KPI cards (Total Revenue, New Enrollments, Sessions Held, Attendance Rate) using the existing `MetricCard` atom. Props: `data: DailyReportData`
- [X] T011 [P] [US1] Create `src/components/reports/atoms/ReportSessionDetails.tsx` — renders a table of `session_details[]` with columns: Instructor, Time, Present, Absent, Cancelled, Students Present, Students Absent. Props: `sessions: SessionDetail[]`
- [X] T012 [P] [US1] Create `src/components/reports/atoms/ReportPaymentDetails.tsx` — renders `payments_by_type[]` as a grouped table with subtotals and expandable rows. Props: `payments: PaymentsByTypeItem[]`
- [X] T013 [US1] Create `src/components/reports/organisms/DailyReportTab.tsx` — main tab component that:
- [X] T014 [US1] Update `src/components/reports/molecules/TabNavigation.tsx` — add `'daily'` to `TabId` union type; add tab config with label "Daily" and icon `'calendar_today'`
- [X] T015 [US1] Refactor `src/pages/ReportsPage.tsx` — add `case 'daily'` to `renderTabContent` rendering `<DailyReportTab />`; import `DailyReportTab`

**Checkpoint**: US1 fully functional — report viewing, KPI summary, session/payment details, and PDF download all work independently.

---

## Phase 4: User Story 2 — Email Daily Report (Priority: P2)

**Goal**: An admin can send the daily report to one or more email recipients directly from the UI.

**Independent Test**: On the Daily Report page, enter valid comma-separated email addresses, click "Send", verify success toast. Enter invalid email format, verify inline validation error. Try to send on a date with no data — button should be disabled.

### Implementation for User Story 2

- [X] T016 [P] [US2] Create `src/components/reports/molecules/ReportEmailSender.tsx` — text input for comma-separated emails with client-side regex validation on blur/submit; "Send Report" button wired to `useSendDailyReport()`; success/error toast feedback; `disabled` prop when no data; max 100 recipients validation
- [X] T017 [US2] Integrate `ReportEmailSender` into `src/components/reports/organisms/DailyReportTab.tsx` — place in action bar alongside PDF download button; pass current date and disable state

**Checkpoint**: US2 fully functional — email sending, validation, and disabled state all work independently.

---

## Phase 5: User Story 3 — Date Navigation & Default (Priority: P3)

**Goal**: Report defaults to today's date and allows picking any past date. Future dates are rejected.

**Independent Test**: Visit reports page — defaults to today. Pick a past date — report refreshes. Try a future date — validation error shown.

### Implementation for User Story 3

- [X] T018 [P] [US3] Create `src/components/reports/molecules/ReportDatePicker.tsx` — native `<input type="date">` with `max={today}`; controlled via `value` and `onChange` props; labeled field; rejects future dates with inline validation message
- [X] T019 [US3] Integrate `ReportDatePicker` into `src/components/reports/organisms/DailyReportTab.tsx` — place at top; on date change, trigger `useDailyReportData(date)` refetch; default to `getTodayISO()` on mount

**Checkpoint**: US3 fully functional — date navigation works independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] T020 [P] Add unit tests in `src/tests/daily-reports.test.ts` — test all 3 API functions make correct Axios calls; test hooks return expected data shapes
- [ ] T021 [P] Add component smoke tests in `src/tests/daily-reports.test.ts` — render `ReportSummaryCards`, `ReportSessionDetails`, `ReportPaymentDetails` with mock data; verify KPI values display correctly
- [X] T022 Run `npm run lint` and fix all errors
- [X] T023 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [X] T024 Code cleanup — remove unused imports, ensure `import type` for type-only imports, verify no `any` types

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on US1 (`DailyReportTab.tsx` must exist to integrate `ReportEmailSender`)
- **User Story 3 (Phase 5)**: Depends on US1 (`DailyReportTab.tsx` must exist to integrate `ReportDatePicker`)

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — can start after Foundational
- **US2 (P2)**: Depends on US1 for `DailyReportTab.tsx` integration point
- **US3 (P3)**: Depends on US1 for `DailyReportTab.tsx` integration point
- **US2 and US3** sub-components can be built in parallel, but integration into the tab requires US1 to be complete.

### Within Each User Story

- API functions and types before hooks
- Hooks before components
- Sub-components before main tab assembly
- Layout and routing last
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001–T002) can run in parallel
- All Foundational tasks (T003–T009) can run in parallel
- All US1 sub-component tasks (T010–T012) can run in parallel
- US2 sub-component (T016) and US3 sub-component (T018) can run in parallel
- T020 and T021 (tests) can run in parallel with each other

---

## Parallel Example: User Story 1

```bash
# Launch all sub-components for User Story 1 together:
Task: "Create ReportSummaryCards.tsx in atoms/"
Task: "Create ReportSessionDetails.tsx in atoms/"
Task: "Create ReportPaymentDetails.tsx in atoms/"

# Launch page integration tasks:
Task: "Update TabNavigation.tsx with 'daily' tab"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test US1 independently — report viewing, KPI cards, session/payment details, PDF download
5. Deploy/demo if ready

### Incremental Delivery

1. Foundational complete → API layer + hooks ready
2. Add US1 (View & Download) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Email Report) → Test independently → Deploy/Demo
4. Add US3 (Date Navigation) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Complete Phase 2: Foundational together (7 parallel tasks)
2. Once Foundational is done:
   - Developer A: US1 (View & Download) — core components + tab + page integration
   - Developer B: US2 (Email) + US3 (Date Navigation) — sub-components
   - Both integrate into DailyReportTab.tsx after US1 tab is ready
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- After each phase: run `npm run lint && npm run build` to catch TS errors early
