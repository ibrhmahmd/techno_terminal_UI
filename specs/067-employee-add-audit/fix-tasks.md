# Fix Tasks: Employee Addition Findings Remediation

**Input**: `specs/067-employee-add-audit/findings.md` (F-001â€¦F-005) â€” follow-up engagement per FR-010 of the audit spec
**Prerequisites**: findings.md âœ… Â· evidence tiers noted per finding Â· local backend on `:8000` + `npm run dev` required for verification tasks

**Tests**: Unit tests included for the pure validator functions only (T003) â€” UI behavior verified via the original audit probes, which double as regression checks.

**Story mapping**: US1 = F-001 Â· US2 = F-003 Â· US3 = F-002+F-004 Â· US4 = F-005. Priorities follow severity: highs first.

**Same-file constraint**: T005/T007/T010 all edit `src/components/staff/EmployeeForm.tsx` â†’ execute their phases sequentially; do not parallelize across those tasks.

---

## Phase 1: Setup

- [X] T001 Confirm clean working tree; capture baseline gates: `npm run build` must pass and record current lint problem count (43 known pre-existing) as the no-new-violations ceiling for T016

---

## Phase 2: Foundational

**Purpose**: Pure validation logic exists before any story wires it in

- [X] T002 Create `src/utils/egyptianValidators.ts` exporting: `isValidEgyptianNationalId(nid: string): boolean` â€” 14 digits, century digit `2|3`, month `01â€“12`, day valid for derived month/year, governorate `01â€“88` (checksum optional second param, default off until real-ID verified); `normalizeEgyptianPhone(raw: string): string | null` â€” strips optional `+20`/`20` prefix, then requires `^01[0125]\d{8}$`, returns normalized or null
- [X] T003 [P] Create `src/tests/egyptianValidators.test.ts` (Vitest): valid seed `30001011234567`; invalid `'123'`; invalid 15-digit; invalid month `13`; invalid day `32`; invalid governorate `99`; phones `010â€¦/011â€¦/012â€¦/015â€¦` valid, `018â€¦` invalid, `+201001234567` normalizes to `01001234567`, `'abc'` null

**Checkpoint**: validators tested green via `npm run test -- src/tests/egyptianValidators.test.ts`

---

## Phase 3: US1 â€” Surface server truth instead of generic banner (F-001, high)

**Goal**: Admin sees the backend's aggregated field-named conflict/validation message verbatim.

**Independent Test**: Re-run findings F-001 evidence step 1 (triple-collision duplicate submit) â†’ banner shows `"national_id: already in use; phone: already in use; email: already in use"`.

- [X] T004 Add `extractApiErrorMessage(err: unknown): string | null` helper in `src/api/hr/errors.ts` â€” reads Axios `error.response.data.message` when `success === false`, else returns null
- [X] T005 In `src/components/staff/EmployeeForm.tsx` handleSubmit catch (~line 119): replace fixed generic string with `setError(extractApiErrorMessage(err) ?? 'An error occurred while saving the employee profile.')`
- [ ] T006 (PENDING MANUAL VERIFY) Verify against local backend: re-submit duplicate set from F-001 evidence â†’ verbatim aggregated message renders in banner; form data preserved; non-enveloped failures still show generic fallback

---

## Phase 4: US2 â€” Stop manufacturing placeholder data (F-003, high)

**Goal**: Blank optional education fields store as absent/null, never as literal `"Not Specified"`.

**Independent Test**: Create employee with blank university/major â†’ GET/detail shows no sentinel string; UI renders explicit empty state.

- [X] T007 In `src/components/staff/EmployeeForm.tsx` create-mode payload (lines 84-85): omit university/major (`undefined`) when blank instead of injecting `'Not Specified'`; verify POST `/hr/employees` accepts omission against local backend (per migration-notes Â§2 PUT-partial precedent); if POST demands them, fall back to explicit `null` and document in code comment
- [X] T008 [P] Empty-state rendering in `src/components/staff/EmployeeDetailModal.tsx` and `src/components/staff/EmployeeCard.tsx`: render em-dash (`â€”`) for absent/null university/major
- [ ] T009 (PENDING MANUAL VERIFY) Verify: UI-create with blanks succeeds; detail view/card show em-dash; response payload contains no `'Not Specified'`

---

## Phase 5: US3 â€” Client-side Egyptian formats & salary bounds (F-002 + F-004, medium)

**Goal**: Format/range errors blocked before submit with named-field messages; salary input sane.

**Independent Test**: Rerun F-002/F-004 probe inputs â†’ client-side blocks with named messages, zero POSTs for invalid sets; cleared salary stays visually empty; `5050` accepted.

- [X] T010 Wire validators into `src/components/staff/EmployeeForm.tsx` handleSubmit pre-submit checks: create-mode national_id via `isValidEgyptianNationalId`, phone via `normalizeEgyptianPhone` (store normalized value); violations extend the existing aggregated message pattern naming each offending field (consistent with "Please fill in all required fields: â€¦")
- [X] T011 In `src/components/staff/EmployeeForm/WorkSettingsSection.tsx` salary input (lines 64-74): remove `step={100}`, add `max={1000000}`, change onChange sentinel from `parseInt(e.target.value, 10) || 0` to empty-string-preserving logic; update `monthly_salary` type to `number | ''` in `EmployeeForm.tsx` state (payload's falsy-drop at line 89 already handles `''`)
- [X] T012 Range feedback in `src/components/staff/EmployeeForm.tsx`: salary `< 0` / `> max` and contract `% > 100` produce named-field messages through the custom validator rather than native bubbles
- [ ] T013 (PENDING MANUAL VERIFY) Verify: `123`, 15-digit NID, phone `abc` â†’ blocked client-side, no POST; cleared salary remains visually empty; `999999999999` blocked by max message; `5050` submits fine

---

## Phase 6: US4 â€” Ownership consistency cleanup (F-005, low)

- [X] T014 In `src/components/staff/EmployeeForm.tsx` line 82: remove the misleading `email || undefined` optional-fallback branch; send trimmed email unconditionally (email is natively required â€” one owner, one rule)

---

## Phase 7: Polish & Cross-Cutting

- [ ] T015 Regression sweep: rerun quickstart Â§3 core probes (duplicate 409 verbatim banner âœ“, malformed set âœ“, numeric set âœ“, happy-path create âœ“) end-to-end against local stack; confirm fixes hold under the original evidence steps
- [X] T016 `npm run lint` (â‰¤43 problems â€” zero new) and `npm run build` (PASS)
- [ ] T017 Append "Fix Engagement Outcome" section to `specs/067-employee-add-audit/findings.md` marking F-001â€¦F-005 resolved with commit references

---

## Dependencies & Execution Order

```text
T001 â†’ T002 â†’ T003 â”€â”
                     â”œâ†’ US1 (T004â†’T005â†’T006) â†’ US2 (T007âˆ¥T008â†’T009) â†’ US3 (T010â†’T011âˆ¥T012â†’T013) â†’ US4 (T014) â†’ T015 â†’ T016 â†’ T017
```

- **Sequential spine**: US1 â†’ US2 â†’ US3 share `EmployeeForm.tsx` edits â€” never parallelize across them
- **Within-phase parallel**: T007 âˆ¥ T008 (different files); T011 âˆ¥ T012 after T010 lands (both touch files T010 finalized)
- **US4 (T014)** is trivial and could ride anywhere after US3, kept last for clean review isolation

## MVP Scope

US1 + US2 (both high-severity findings) â€” ship those before mediums.

## Scope Guards

- Backend is contract-correct (audit-verified) â€” NO backend changes in this engagement
- Do not touch unrelated legacy files failing lint (43 known problems stay out of scope)
- Every fix task's verify step reuses its finding's original evidence script â€” same inputs, now expected to pass

