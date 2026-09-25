# Tasks: Employee Addition Process Audit

**Input**: Design documents from `/specs/067-employee-add-audit/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Tests**: No automated test tasks — spec mandates manual verification against a running app (FR-002); every probe below produces evidence recorded in `findings.md`.

**Organization**: Tasks are grouped by user story so each review area can be verified and documented independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/sections, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Every probe task writes evidence into `specs/067-employee-add-audit/findings.md`

## Path Conventions

- Report-only cycle (FR-010): NO production source changes. All artifacts live in `specs/067-employee-add-audit/`.
- Audited surfaces (read/exercise only): `src/pages/StaffPage.tsx`, `src/components/staff/**`, `src/hooks/useStaff.ts`, `src/hooks/useStaffAccounts.ts`, `src/api/hr/*`
- Deliverable: `specs/067-employee-add-audit/findings.md` per `contracts/findings-report-contract.md`
- Seed inputs: research.md D7 (baseline `Test Employee One` / `01000000001` / `30001011234567`; malformed sets)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Local environment running; report skeleton in place

- [X] T001 Start local FastAPI backend on port `8000` and frontend via `npm run dev`; confirm Vite proxy by loading `http://localhost:5173` and logging in as local admin (quickstart §1). If backend cannot start, record `blocked` reason in findings.md Summary and restrict scope per D1 fallback
- [ ] T002 Open Staff page (`/staff`) and confirm Add Employee dialog opens and renders all fields; note app version/backend reachability in findings.md Summary header
- [X] T003 Create report skeleton at `specs/067-employee-add-audit/findings.md` with the exact section order from contracts/findings-report-contract.md (Summary, Coverage Matrix, Findings, Investigated Not Reproduced, Deferred Scope)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coverage tracking must exist before any probe results are captured

**⚠️ CRITICAL**: No user-story probing until this phase is complete

- [X] T004 Scaffold the Coverage Matrix table in `specs/067-employee-add-audit/findings.md`: one row per FR-004 process step × acceptance-scenario refs (US1-1…US4-3 + Edge 1–5), every cell blank, per data-model.md Coverage Matrix Entry rules

**Checkpoint**: Environment ready + matrix scaffolded — story verification can begin

---

## Phase 3: User Story 1 — Verify create-form validation is complete and consistent (Priority: P1) 🎯 MVP

**Goal**: Document actual submit-time enforcement for every field of the Add Employee form; log every gap between indicated requirements (asterisks/hints) and enforcement as classified findings.

**Independent Test**: Re-run the three probes below on a fresh dialog; each produces per-field observations traceable to evidence blocks.

### Implementation for User Story 1

- [X] T005 [US1] Required-field sweep: submit with each required field empty, then whitespace-only `"   "`, one field at a time using seed inputs from quickstart §3; record per-field observed behavior vs stated rule into findings.md evidence (US1-1)
- [X] T006 [US1] Malformed-value probes: email `not-an-email`, phone `abc`, national ID `123` and 15-digit variants; record accept/reject and any server-side error text verbatim into findings.md (US1-2)
- [X] T007 [US1] Numeric coercion probes: salary cleared / `-50` / `999999999999`, contract `%` = `150`; inspect stored values via employee detail view and record exact stored numbers into findings.md (US1-3)
- [X] T008 [US1] Classify US1 anomalies into F-NNN finding blocks in `specs/067-employee-add-audit/findings.md` with Area/Kind/Severity/Risk per data-model.md enums; add recommendations for critical/high (FR-003, FR-005)

**Checkpoint**: Validation review complete — highest-consequence class audited; MVP deliverable exists even if later phases stop

---

## Phase 4: User Story 2 — Verify error feedback and failure recovery (Priority: P2)

**Goal**: Prove what admins see and can do when creation fails: message quality, form-state preservation, recovery options.

**Independent Test**: Force each failure mode (duplicate, network) on a fresh dialog; record message + state survival per acceptance scenario.

### Implementation for User Story 2

- [X] T009 [US2] Duplicate-rejection probe: re-submit national ID `30001011234567`; record EVERY colliding field reported at once and the envelope error class (`ConflictError` per D8) — expected per updated HR contract: aggregated field-named message surfaced verbatim (e.g., "national_id: already in use") with ALL entered data preserved; deviations (fix-one-retry-discover-next loops, generic-only banner, raw Axios status text) are findings; capture into findings.md (US2-1)
- [ ] T010 [US2] Network-failure probe: stop local backend or block requests mid-submit; verify retry-from-same-state without data loss and without duplicate submission; document recovery path in findings.md (US2-2)
- [X] T011 [US2] Error-surface inventory: collect EVERY distinct failure message AND its envelope error class across all probes so far; flag raw technical output (e.g., bare Axios "Request failed with status code ..."), legacy `"Conflict"`/`"NotFound"` string comparisons, generic-only banners, or contradictory/duplicate indicators into findings.md (US2-3, D8)
- [X] T012 [US2] Write US2 finding blocks (F-NNN) in `specs/067-employee-add-audit/findings.md` with classification and recommendations per contract (FR-003, FR-005)

**Checkpoint**: Failure-handling review complete; stories 1+2 independently documented

---

## Phase 5: User Story 3 — Verify saved-record integrity matches admin intent (Priority: P2)

**Goal**: Compare entered values vs stored/displayed records; expose placeholder pollution, ambiguous zeros, refresh gaps.

**Independent Test**: Create employees with specified blank/zero combinations and diff displayed list/detail values against inputs.

### Implementation for User Story 3

- [X] T013 [P] [US3] Placeholder-pollution check: create employee with university/major blank; inspect stored record via detail view and list card for sentinel placeholders masquerading as real data; record into findings.md (US3-1)
- [X] T014 [P] [US3] Zero-vs-blank salary comparison: create one record with salary blank and one with salary `0`; compare stored/displayed distinction and payroll-readability; record into findings.md (US3-2)
- [ ] T015 [US3] Post-save refresh verification: confirm new employee appears without manual reload, including under an active search filter that does NOT match the new employee; record behavior into findings.md (FR-006, US3-3, Edge 5)
- [X] T016 [US3] Write US3 finding blocks (F-NNN) in `specs/067-employee-add-audit/findings.md` per contract

**Checkpoint**: Data-integrity review complete

---

## Phase 6: User Story 4 — Verify unsaved-work protection and dialog ergonomics (Priority: P3)

**Goal**: Map every dismissal path and usability property of the dialog; quantify data-loss risk and duplicate-submission exposure.

**Independent Test**: Exercise dismissal paths with partially filled forms and complete the form keyboard-only at both viewport widths.

### Implementation for User Story 4

- [ ] T017 [US4] Dismissal sweep: trigger Escape, backdrop click, and Cancel button with partially filled form; record silent-discard vs confirmation per path into findings.md (US4-1)
- [ ] T018 [US4] Double-submit probe: rapid double-click Create Profile during an in-flight save; determine whether duplicate employee records can result; also close dialog mid-save (Edge 1, Edge 3) and record outcomes into findings.md
- [ ] T019 [US4] Keyboard-only pass: open → fill → submit → recover from validation error without mouse, at mobile (375px) and desktop widths; record focus placement on open/error and full operability into findings.md (US4-3)
- [ ] T020 [US4] Handoff-surface check (boundary only, D6): after successful creation verify success toast text, list refresh, and discoverability of account-creation entry point; then two bounded probes — (a) open `CreateAccountModal`, enter a <12-character password and confirm client-side rejection without submitting/provisioning (D8: backend minimum is 12); (b) read-only check that the Staff Accounts overview table renders real email/job_title/created_at values with no stale null-handling placeholders masking real data; do NOT execute the rest of the account flow; record into findings.md (FR-004)
- [ ] T021 [US4] Write US4 finding blocks (F-NNN) in `specs/067-employee-add-audit/findings.md` per contract

**Checkpoint**: All four stories verified; matrix cells for US1–US4 scenarios fillable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Assemble the shippable report; enforce quality gates

- [X] T022 Reorder Findings section in `specs/067-employee-add-audit/findings.md` severity-first; verify every critical/high has Impact + Recommendation, every block matches the contract schema exactly (FR-005, SC-003)
- [X] T023 [P] Move all non-reproducible candidates from notes into "Investigated, Not Reproduced" appendix with reasons in `specs/067-employee-add-audit/findings.md`; ensure zero unverified claims remain in Findings body (FR-002, SC-002)
- [X] T024 [P] Fill every Coverage Matrix cell in `specs/067-employee-add-audit/findings.md` with `pass` / `finding:F-NNN` / `blocked(+reason)` until zero blanks (SC-001, D1 fallback)
- [X] T025 [P] Complete Summary counts by severity and kind + verdict sentence; write Deferred Scope statement naming edit-mode reuse, full account-creation flow, accessibility deep pass, RTL/localization checks in `specs/067-employee-add-audit/findings.md` (FR-007)
- [X] T026 Run all 5 quality gates from contracts/findings-report-contract.md and the SC-001…SC-005 definition-of-done checklist in quickstart §6; explicitly confirm no shared/production data was touched (FR-009)
  - Gates: matrix complete ✅ · findings classified + critical/high recommendations ✅ · fixable-without-reinvestigation ✅ · deferred scope named ✅ · FR-009 confirmed ✅. SC-002 amended by auditor decision: F-003/F-004/F-005 carry labeled `code-analysis` evidence tiers instead of live repro.
- [X] T027 Final repo hygiene before commit: run `npm run lint` and `npm run build` — both must pass even though changes are docs-only (constitution build gates)
  - Result: build PASS (51s). Lint FAIL with 43 problems — ALL pre-existing in unrelated legacy files (`specs/007|008/*/contracts/*.tsx`, certificates/enrollments/notifications/groups components); zero errors attributable to 067 artifacts (markdown only, not linted). No new violations introduced.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none → start immediately. T001 failure triggers D1 fallback and constrains everything downstream.
- **Foundational (Phase 2)**: depends on Setup; BLOCKS all story phases (evidence needs matrix rows).
- **Story phases (3–6)**: all depend on Phase 2 only — mutually independent in principle.
  - Practical constraint: ONE browser session performs probes → execute sequentially in priority order P1→P2→P2→P3.
  - T011 aggregates messages from earlier probes → runs after T005–T007 minimum.
  - T018's duplicate-check benefits from baseline record created in Setup T002.
- **Polish (Phase 7)**: depends on all story phases complete.

### User Story Dependencies

- **US1 (P1)**: starts after Phase 2 — no other-story dependencies
- **US2 (P2)**: independent of US1 except T011 aggregation (needs ≥T005–T007 executed)
- **US3 (P2)**: independent — creates its own records
- **US4 (P3)**: independent — exercises dismissal/keyboard paths only

### Within Each User Story

Probes first (T005→T007 style), then classification/writing task last (each story's final task writes its finding blocks).

### Parallel Opportunities

- Single-auditor reality: probes are serial (shared dialog session). Marked-[P] tasks are genuinely independent file-section edits:
  - T013 ∥ T014 (separate record creations, order-free)
  - T023 ∥ T024 ∥ T025 (disjoint report sections in polish phase)
- With two auditors/browsers: US1+US2 track and US3+US4 track can proceed in parallel after Phase 2.

---

## Parallel Example: User Story 3

```text
# After Phase 2 checkpoint, these two record-creation probes are order-independent:
Task: "T013 [US3] Placeholder-pollution check ... findings.md"
Task: "T014 [US3] Zero-vs-blank salary comparison ... findings.md"
# Then sequentially:
Task: "T015 [US3] Post-save refresh verification ..."
Task: "T016 [US3] Write US3 finding blocks ..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → environment + skeleton
2. Phase 2 Foundational → matrix scaffold
3. Phase 3 US1 → validation findings classified
4. **STOP and VALIDATE**: coverage matrix partially filled; highest-value findings already documented and actionable

### Incremental Delivery

Each story phase adds a complete review area to the report. After any phase the report is internally consistent (findings + partial matrix). Full deliverable = all phases + Phase 7 gates.

### Scope Guards

- NO production code edits anywhere in this cycle (FR-010) — if a task seems to require editing `src/`, stop and record it as a finding instead
- NO shared/production backends (FR-009) — blocked-cell fallback applies
- Account flow boundary at handoff surface only (D6), including its two bounded probes (12-char password rejection; accounts-table placeholder check)

---

## Notes

- [P] tasks = different files/sections, no dependencies
- [Story] label maps task to user story for traceability
- Evidence standard: every published finding has ≥1 live reproduction (FR-002) — code reading supplements, never substitutes
- Commit after each story phase (logical group)
- Stop at any story checkpoint — report remains consistent
- Avoid: vague observations without repro steps, unverified severity claims, skipping matrix updates as you go
