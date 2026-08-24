# Employee Addition Audit — Findings Report

**Feature**: 067-employee-add-audit | **Date**: 2026-08-23 | **Auditor mode**: assisted manual (early termination) + code-analysis closure (worst-case assumed, labeled per finding)
**Environment**: frontend Vite dev @ `http://localhost:5173` (proxied `/api` → local FastAPI `:8000`); backend started locally per FR-009 — no shared/production data touched.
**Evidence tiers**: `live-repro` = demonstrated against running app · `code-analysis` = deterministic source-path proof with worst-case behavior assumed where runtime outcome unobserved. Manual UI session ended after US1/US2-partial at auditor discretion (2026-08-23); remaining areas recorded as `blocked`, not speculated.
**Seed inputs**: research.md D7 — baseline `Test Employee One` / `01000000001` / `30001011234567` / `QA Instructor` / salary `5000`; malformed sets per probe.

## Summary

| Severity | Count |
|----------|-------|
| critical | 0 |
| high | 2 |
| medium | 2 |
| low | 1 |

| Kind | Count |
|------|-------|
| functional-bug | 2 |
| ux-problem | 2 |
| polish | 1 |

**Verdict**: Backend validation is strong (aggregated conflicts, clean 422s, junk NID/phone rejected), but the frontend squanders it: every server message is masked by a generic banner (F-001, high), national ID/phone have no client-side format checks (F-002), blank education fields are silently stored as literal `"Not Specified"` strings (F-003, high), and salary input lacks sane bounds while snapping cleared values back to zero-display (F-004). Ergonomics, concurrency, refresh, and handoff areas were not exercised — manual session ended early; those matrix cells are `blocked`, not guessed.

## Coverage Matrix

Legend: `pass` · `finding:F-NNN` · `blocked(+reason)` · `—` not applicable. Every applicable cell must be filled before ship (SC-001).

| # | FR-004 process step | Scenarios | validation | error-handling | data-integrity | ergonomics | concurrency |
|---|---------------------|-----------|------------|----------------|----------------|------------|-------------|
| 1 | Dialog open → fill → submit (happy path) | US3-3 | — | — | blocked(no successful creation observed before session ended) | — | — |
| 2 | Required-field enforcement at submit | US1-1 | pass | — | — | — | — |
| 3 | Malformed value handling (email/phone/national ID) | US1-2 | finding:F-002 | — | — | — | — |
| 4 | Numeric coercion (salary / contract %) | US1-3 | finding:F-004 | — | — | — | — |
| 5 | Server rejection — duplicate identity | US2-1, Edge 1 | — | finding:F-001 | — | — | blocked(double-submit untested) |
| 6 | Server rejection — invalid value (422) | US2-3 | — | finding:F-001 | — | — | — |
| 7 | Network/server failure mid-submit | US2-2 | — | blocked(network failure not exercised) | — | — | — |
| 8 | Error-surface inventory (all messages) | US2-3 | — | finding:F-001 | — | — | — |
| 9 | Stored record vs entered intent (placeholders) | US3-1 | — | — | finding:F-003 | — | — |
| 10 | Zero-vs-blank salary distinction | US3-2 | — | — | finding:F-004 | — | — |
| 11 | Post-save list refresh (incl. active filter) | US3-3, FR-006, Edge 5 | — | — | blocked(refresh/filter behavior unobserved) | — | — |
| 12 | Dismissal paths (Escape / backdrop / Cancel) | US4-1 | — | — | — | blocked(dismissal sweep not run) | — |
| 13 | Double-submit during in-flight save | US4-2, Edge 1 | — | — | — | — | blocked(rapid double-submit not run) |
| 14 | In-flight dialog close | Edge 3 | — | — | — | — | blocked(in-flight close not run) |
| 15 | Keyboard-only operability & focus | US4-3 | — | — | — | blocked(keyboard-only pass not run) | — |
| 16 | Post-save handoff surface + bounded probes (12-char password; accounts-table placeholders) | FR-004 handoff | — | blocked(handoff probes not run) | — | — | — |

## Findings

<!-- One block per finding, severity-ordered. Format per contracts/findings-report-contract.md:
### F-NNN: <imperative summary>
- Area: <review-area> · Kind: <functional-bug|ux-problem|polish> · Severity: <critical|high|medium|low> · Risk: <breaking|moderate|safe>
- Evidence: numbered ReproSteps (Action/Observed/Expected) using D7 seed inputs verbatim; file:line refs as supplement only
- Impact: (mandatory for critical/high)
- Affected surfaces: bullet list; prefix shared surfaces with [SHARED]
- Recommendation: (mandatory for critical/high)
-->

### F-001: Duplicate-conflict detail from backend is swallowed; admin sees only a generic error banner

- Area: `error-handling` · Kind: `functional-bug` · Severity: `high` · Risk: `safe`
- Evidence (reproduced live against local stack, 2026-08-23):
  1. **Action**: Submit the Add Employee form with values that already exist locally (`full_name: "test"`, `phone: "0100852096333"`, plus colliding national_id and email). **Observed**: modal shows only `"An error occurred while saving the employee profile."` — no field names. **Expected**: per updated HR contract + clarified spec US2-1, display the aggregated message verbatim: `"national_id: already in use; phone: already in use; email: already in use"`.
  2. **Action**: Inspect network/console during the same submission. **Observed**: backend responded correctly — `409`, `error: "ConflictError"`, `message: "national_id: already in use; phone: already in use; email: already in use"` (all THREE collisions reported at once, matching D8 baseline); console trace: `POST /api/v1/hr/employees 409` at `src/api/hr/employees.ts:47` → `useStaff.ts:40` → `StaffPage.tsx:81` → `EmployeeForm.tsx:118`; debug log `[API Error] POST /hr/employees - 409` at `src/api/client.ts:82`. **Expected**: response payload reaches the UI instead of being replaced.
  3. **Action**: After the failed submit, inspect the still-open dialog. **Observed**: ALL entered values remain intact in their fields. **Expected**: data preservation per US2-1 — this part PASSES; only message quality fails.
- Root cause (supplementary): `EmployeeForm.tsx:119` catch block discards the Axios error and sets a fixed generic string; the fallback `apiError` prop (`StaffPage.tsx:203`) would only expose Axios's generic status text and loses to the internal message anyway (`displayError = error || apiError`). `createEmployee()` (`employees.ts:46`) performs no envelope unwrapping.
- Impact: Admin cannot tell WHICH of phone/email/national ID collided — with multi-field collisions they must guess-and-retry one field at a time, re-triggering 409s; contradicts the clarified requirement that the aggregated field-named message be surfaced verbatim with data preserved.
- Affected surfaces:
  - [SHARED] `src/components/staff/EmployeeForm.tsx` (handleSubmit catch) — form also serves edit mode
  - `src/pages/StaffPage.tsx` (apiError prop wiring)
  - `src/api/hr/employees.ts` (no error-envelope parsing)
  - Backend behavior itself is CORRECT (contract-compliant) — no backend change needed
- Recommendation: In `EmployeeForm.handleSubmit`'s catch, read the Axios error response envelope (`error.response.data.message`) when `error === "ConflictError"` (or status 409/422) and render that message verbatim in the banner; keep the generic string only as fallback for non-enveloped failures.

### F-003: Blank university/major are silently replaced with literal `"Not Specified"` strings on create — stored as real-looking data

- Area: `data-integrity` · Kind: `functional-bug` · Severity: `high` · Risk: `safe`
- Evidence tier: `code-analysis` (injection path deterministic in source; worst-case storage/display assumed per auditor decision after manual session ended)
- Evidence:
  1. **Action** (source trace): `src/components/staff/EmployeeForm.tsx:84-85` — create-mode payload builder: `university: formData.university || 'Not Specified'`, `major: formData.major || 'Not Specified'`. Any blank field ships the literal string to POST `/hr/employees`. **Observed (static)**: sentinel injected unconditionally on create. **Expected**: blank optional fields stay `null`/absent.
  2. **Corroboration**: same file, lines 96-107 — edit mode deliberately strips `'Not Specified'` before PUT, with comment *"Don't send 'Not Specified' placeholders as they may fail validation"* — the authors knew these sentinels are problematic, yet create mode still manufactures them.
- Impact: Employee records carry fake education data that survives into detail views, lists, and any downstream report/filter; indistinguishable from a real university named "Not Specified". Edit-mode hygiene proves the intended shape was null, not sentinel.
- Affected surfaces:
  - [SHARED] `src/components/staff/EmployeeForm.tsx` (create branch, lines 84-85)
- Recommendation: Send `undefined`/omit blank optional fields (mirror the existing edit-mode guard); render an em-dash or explicit empty-state in UI; plan a one-off data cleanup migrating existing `'Not Specified'` values to null.

### F-002: National ID and phone accept any text client-side; Egyptian-format feedback arrives only after a server round-trip — then gets masked by the generic banner

- Area: `validation` · Kind: `ux-problem` · Severity: `medium` · Risk: `safe`
- Evidence (user-executed probes against local stack, 2026-08-23):
  1. **Action**: Submit with national ID = `"123"` (all other fields valid). **Observed**: no client-side block — POST fires; backend rejects with **422 + clean field message**; UI shows only the generic banner (F-001 mechanism). No junk record created. **Expected**: client-side structural check blocks submission with an inline/aggregated hint naming national ID.
  2. **Action**: Submit with phone = `"abc"`. **Observed**: same path — client allows, backend rejects, generic banner shown. **Expected**: phone pattern check before submit.
  3. **Action**: Submit with a 15-digit national ID. **Observed**: client allows submission. **Expected**: length/structure rejection client-side.
  4. **Contrast**: email `not-an-email` IS blocked client-side with a format message — proving the form's validator already supports per-field format rules; national ID and phone simply have none.
- Impact: Every format mistake costs a full submit round-trip followed by a meaningless error banner; admins can't see WHICH rule failed or fix it efficiently. Data integrity itself is protected by backend 422s (verified) — this is friction, not corruption.
- Affected surfaces:
  - [SHARED] `src/components/staff/EmployeeForm.tsx` (validator covers required-fields + email format, but has no national_id/phone format rules)
  - Backend behavior is CORRECT (clean 422 messages) — no backend change needed
- Recommendation: Extend the existing aggregated custom validator with Egyptian formats:
  - **National ID** (14 digits, structured): century digit `2|3`; birth month `01–12`; day valid for month/year; governorate `01–88`; optional weighted-checksum verification. Rejects `"123"` and 15-digit variants instantly.
  - **Phone**: normalize optional `+20`/`20` prefix, then require `^01[0125]\d{8}$` (010/011/012/015 mobiles).
  - Surface violations through the existing "Please fill in all required fields: …"-style aggregated message pattern.

### F-004: Monthly salary input has no upper bound, cleared values snap back to a displayed zero, and `step=100` silently rejects valid integers

- Area: `validation` · Kind: `ux-problem` · Severity: `medium` · Risk: `safe`
- Evidence tier: `code-analysis` (input mechanics fully determined by source; backend acceptance of unbounded values unobserved → worst case assumed)
- Evidence:
  1. **Source**: `src/components/staff/EmployeeForm/WorkSettingsSection.tsx:64-74` — salary `<input type="number" min={0} step={100}>` with **no `max`**; `onChange={(e) => onChange('monthly_salary', parseInt(e.target.value, 10) || 0)}`.
  2. **Cleared-field snap-back**: controlled input bound to state; clearing yields `parseInt('') || 0` → state `0` → input redisplays `0`. User can never hold the field visually empty. Payload side is safe (`monthly_salary || undefined` drops falsy → omitted from JSON), but display implies "0 EGP" intent.
  3. **Unbounded magnitude**: `999999999999` passes client constraints and POSTs unrestricted; backend cap unknown (untested) — worst case accepted would corrupt payroll planning.
  4. **step=100 side effect**: a legitimate integer like `5050` fails native step validation with a cryptic browser bubble ("Please enter a valid value") despite being a sensible salary.
- Impact: Payroll-critical field accepts absurd magnitudes without warning, cannot be visually cleared, and rejects valid inputs with confusing native messages.
- Affected surfaces:
  - [SHARED] `src/components/staff/EmployeeForm/WorkSettingsSection.tsx` (salary input, lines 64-74)
- Recommendation: Add `max` (e.g., 1,000,000) + custom aggregated-message check for range violations; preserve empty state by using `''` sentinel instead of `|| 0`; drop `step` or match it to real salary granularity.

### F-005: Email requiredness mismatch between native layer and submit handler

- Area: `validation` · Kind: `polish` · Severity: `low` · Risk: `safe`
- Evidence tier: `code-analysis`
- Evidence: `PersonalInfoSection.tsx:36-43` renders Email with required asterisk + native `required`/`type="email"`; `EmployeeForm.tsx:82` treats email as optional (`email: formData.email || undefined`) — an unreachable branch today since native validation always fires first.
- Impact: None user-facing currently; misleads maintainers about which layer owns the rule.
- Affected surfaces:
  - [SHARED] `src/components/staff/EmployeeForm.tsx` (line 82), `src/components/staff/EmployeeForm/PersonalInfoSection.tsx` (lines 36-43)
- Recommendation: Remove the dead optional-fallback once ownership is settled (keep email required if that's product intent).

## Investigated, Not Reproduced

<!-- Discarded suspicions + why. Must stay empty of unverified claims otherwise. -->

1. **Suspicion**: "Job title displays a required marker but submit-time checks may not include it" (spec scoping trigger). **Disproven live**: submitting with an empty job title produces the custom aggregated required-fields message that names job title, and NO POST request fires — client-side enforcement is present. (User-executed probe, 2026-08-23; zero network activity in console during block.)

## Deferred Scope

Per FR-007, the following adjacent processes were deliberately NOT reviewed in this cycle:

- **Edit-employee reuse of the same form** — findings on shared surfaces are tagged `[SHARED]`, but edit-specific behavior is out of scope.
- **Full account-creation flow** — reviewed only at its handoff surface plus two bounded read-only probes (12-char password-minimum client-side rejection; Staff Accounts overview table placeholder check).
- **Accessibility deep pass** — screen-reader/ARIA audit out of scope; keyboard/focus only (incidental issues taggable per FR-008).
- **RTL / Arabic localization checks** — out of scope.
- **Live verification terminated early (auditor decision, 2026-08-23)** — happy-path creation, network-failure recovery, list refresh/filter behavior, dismissal paths, double-submit, in-flight close, keyboard-only pass, and handoff bounded probes were not exercised; their matrix cells are `blocked` rather than speculated. Findings F-003/F-004/F-005 rest on deterministic source paths with worst-case assumptions explicitly labeled `code-analysis`.
