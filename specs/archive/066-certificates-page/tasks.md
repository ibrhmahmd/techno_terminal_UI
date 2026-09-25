# Tasks: Certificates Page

**Input**: Design documents from `specs/066-certificates-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/certificates-api.md, quickstart.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/certificates/`
  - Components: `src/components/certificates/`
  - Hooks: `src/hooks/useCertificates.ts`
  - Pages: `src/pages/CertificatesPage.tsx`
  - Tests: `src/tests/`
- No test tasks are included unless explicitly requested.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure for the new feature

- [ ] T001 Create component directory at `src/components/certificates/` and API module directory at `src/api/certificates/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer, types, query keys, and hook — MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Define CertificateDTO, CreateCertificateInput, CertificatesListResponse, and all request/response TypeScript interfaces in `src/api/certificates/types.ts`
- [ ] T003 [P] Create separate Axios instance for the certs microservice (`certsClient` with baseURL `https://techno-future-certs.fastapicloud.dev/api/v1`) and implement all API functions (list, create, get, download PDF, download HTML, revoke, export CSV) in `src/api/certificates/certificates.ts`
- [ ] T004 [P] Create barrel export in `src/api/certificates/index.ts`
- [ ] T005 [P] Add `certificates` key factory (`all`, `list`, `detail`) to `src/hooks/queryKeys.ts`
- [ ] T006 Create `useCertificates` React Query hook in `src/hooks/useCertificates.ts` with server-side pagination, search, track filter, and include_revoked support

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and Search Certificates (Priority: P1) 🎯 MVP

**Goal**: Users can view a paginated table of certificates, search by student name or cert ID, filter by track, toggle revoked visibility, and click a row to see full certificate details in a modal.

**Independent Test**: Navigate to `/certificates`, see a table with certificates, paginate through results, search by name, filter by track, toggle include_revoked, click a row to see detail modal.

- [ ] T007 [P] [US1] Create `CertificatesTable` component with DataTable columns (cert ID, student name, course, level, branch, issue date, status) and filters (track dropdown, include_revoked toggle) in `src/components/certificates/CertificatesTable.tsx`
- [ ] T008 [P] [US1] Create `CertificatesHeader` component with title, search bar, and action buttons (Generate, Export CSV — admin only) in `src/components/certificates/CertificatesHeader.tsx`
- [ ] T009 [P] [US1] Create `CertificateDetailModal` component showing all certificate fields in a modal in `src/components/certificates/CertificateDetailModal.tsx`
- [ ] T010 [US1] Create `CertificatesPage` in `src/pages/CertificatesPage.tsx` that assembles header + table + detail modal, with loading/empty/error states and pagination
- [ ] T011 [US1] Register lazy-loaded route at `/certificates` under `ProtectedRoute` in `src/App.tsx`
- [ ] T012 [P] [US1] Add `/certificates` nav link under "Programs" section in `src/components/layout/Sidebar.tsx` and to `MORE_ITEMS` in `src/components/layout/MobileNavSheet.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional. Navigate to `/certificates` and browse/search/filter certificates.

---

## Phase 4: User Story 2 - Download Certificate PDF/HTML (Priority: P1)

**Goal**: Users can download a certificate as PDF or HTML file by clicking action buttons on the table row or detail modal.

**Independent Test**: Find a certificate, click Download PDF, receive a `.pdf` file. Click Download HTML, receive an `.html` file.

- [ ] T013 [P] [US2] Add `downloadCertificatePdf` and `downloadCertificateHtml` API functions (using `responseType: 'blob'`) in `src/api/certificates/certificates.ts`
- [ ] T014 [US2] Add Download PDF and Download HTML action buttons to `CertificatesTable` row actions and `CertificateDetailModal`, implementing the blob download pattern (createObjectURL → anchor click → revoke)

**Checkpoint**: Certificates are browsable AND downloadable.

---

## Phase 5: User Story 3 - Generate New Certificate (Priority: P2)

**Goal**: Admins can open a generate modal, search/select a student (auto-filling from enrollment), fill track/level/date/branch, optionally set instructor/director/custom color, and submit. Duplicate detection with clear error.

**Independent Test**: Open generate modal, search for student, select one, fill form, submit — new certificate appears in list. Try duplicate — error shown.

- [ ] T015 [P] [US3] Add `createCertificate` API function in `src/api/certificates/certificates.ts`
- [ ] T016 [US3] Create `CertificateForm` component with student search/select (using `useStudentsSearch` and `getStudentWithDetails` for auto-fill), track dropdown (13 options), level dropdown (3 options), date picker, branch, optional instructor/director/custom color, and submit with duplicate error handling in `src/components/certificates/CertificateForm.tsx`
- [ ] T017 [US3] Integrate generate flow: add "Generate Certificate" button to header (admin only), wire to open `CertificateForm` modal in `CertificatesPage`, invalidate query cache on success

**Checkpoint**: Certificates can be browsed, downloaded, AND generated.

---

## Phase 6: User Story 4 - Revoke Certificate (Priority: P3)

**Goal**: Admins can revoke an active certificate with a required reason. Revoked certificates show status change and cannot be re-activated.

**Independent Test**: Click Revoke on an active certificate, enter reason, confirm — status changes to Revoked. Revoke button disappears on revoked certs.

- [ ] T018 [P] [US4] Add `revokeCertificate` API function in `src/api/certificates/certificates.ts`
- [ ] T019 [US4] Add Revoke action button (admin only, hidden for revoked certs) and `ConfirmDialog` with reason textarea in `CertificatesPage`, invalidate query cache on success

**Checkpoint**: Full lifecycle — browse, download, generate, revoke.

---

## Phase 7: User Story 5 - Export Certificates as CSV (Priority: P3)

**Goal**: Admins can export the filtered certificate list as a CSV file.

**Independent Test**: Apply filters, click Export CSV, receive a `.csv` file with matching data.

- [ ] T020 [US5] Add export CSV flow: add "Export CSV" button to header (admin only), call export endpoint with current filters, trigger blob download in `CertificatesPage`

**Checkpoint**: All 5 user stories complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Instructor role checks, build verification, and cleanup

- [ ] T021 [P] Add `isInstructor` guard to hide Generate, Revoke, and Export CSV buttons (import `useAuthStore` in `CertificatesPage` and pass `isInstructor` to header and table components)
- [ ] T022 [P] Add mobile card list view for `CertificatesTable` (show card grid on mobile, table on desktop matching the app's responsive pattern)
- [ ] T023 Run `npm run lint` and fix all errors
- [ ] T024 Run `npm run build` (`tsc -b && vite build`) and verify zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 Browse (Phase 3)**: Depends on Foundational — **MVP**
- **US2 Download (Phase 4)**: Depends on Foundational, but can run in parallel with US1
- **US3 Generate (Phase 5)**: Depends on Foundational
- **US4 Revoke (Phase 6)**: Depends on Foundational
- **US5 Export (Phase 7)**: Depends on Foundational
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundational only — no story dependencies. **MVP candidate.**
- **User Story 2 (P1)**: Foundational only — independently testable. Can be built alongside US1.
- **User Story 3 (P2)**: Foundational + US1 (for UI integration) but primarily independent
- **User Story 4 (P3)**: Foundational + US1 (for UI integration)
- **User Story 5 (P3)**: Foundational + US1 (for filter state passthrough)

### Within Each User Story

- API functions before components
- Hooks before page assembly
- Components before page integration
- Route/nav registration last within story

### Parallel Opportunities

- **Phase 2**: T002, T003, T004, T005 can all run in parallel
- **Phase 3**: T007, T008, T009 can run in parallel; T010 depends on all three; T011/T012 can run in parallel
- **Phase 4**: T013 and T014 are sequential (API func → component usage)
- **Phase 5**: T015 and T016 are sequential; T017 depends on T016
- **Phase 6**: T018 and T019 are sequential
- **Phase 8**: T021 and T022 can run in parallel; T023/T024 depend on all prior phases

---

## Parallel Example: User Story 1

```bash
# Launch all independent components together:
Task: "Create CertificatesTable in src/components/certificates/CertificatesTable.tsx"
Task: "Create CertificatesHeader in src/components/certificates/CertificatesHeader.tsx"
Task: "Create CertificateDetailModal in src/components/certificates/CertificateDetailModal.tsx"

# Then assemble page:
Task: "Create CertificatesPage in src/pages/CertificatesPage.tsx"

# Route + nav in parallel:
Task: "Register route in src/App.tsx"
Task: "Add nav links in Sidebar.tsx and MobileNavSheet.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (browse, search, filter, detail modal)
4. **STOP and VALIDATE**: Navigate to `/certificates`, test search/filter/pagination/detail modal independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Browse) → Test independently → **MVP!**
3. Add US2 (Download) → Test independently → Deploy
4. Add US3 (Generate) → Test independently → Deploy
5. Add US4 (Revoke) → Test independently → Deploy
6. Add US5 (Export CSV) → Test independently → Deploy
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Foundational is done:
   - Developer A: US1 + US2 (P1 features)
   - Developer B: US3 (generate form)
   - Developer C: US4 + US5 (revoke + export)
3. Polish Phase (role checks, lint, build) done last

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No test tasks generated (not requested in spec)
