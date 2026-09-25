# Research: Employee Addition Process Audit

**Feature**: 067-employee-add-audit | **Date**: 2026-08-23
All NEEDS CLARIFICATION items from Technical Context resolved below. No open unknowns remain.

## D1: Audit execution environment

- **Decision**: Run the FastAPI backend locally on port `8000` and the frontend via `npm run dev` (existing Vite proxy `/api` → `http://0.0.0.0:8000`). All form submissions hit this local instance only.
- **Rationale**: FR-009 mandates local-only writes; the proxy is already configured in `vite.config.ts`, so zero frontend config change is needed. Junk employees with fake national IDs never touch shared data.
- **Alternatives considered**:
  - Staging/shared test env — rejected: cleanup burden + PII-like junk records in shared systems.
  - Production — rejected outright per FR-009.
  - **Fallback if no local backend can be started**: write-dependent checks are recorded as `BLOCKED — unverified` in the report rather than switching environments. Evidence rule FR-002 then applies to them as unconfirmed observations, clearly labeled.

## D2: Reproducing failure modes from a frontend-only position

- **Decision**: Use these techniques per failure class:
  - *Validation failures*: submit controlled bad inputs directly through the UI (empty/whitespace/malformed/boundary values).
  - *Server rejection (duplicate)*: create an employee locally, then submit the same national ID again via the UI.
  - *Network/server failure*: stop the local backend process mid-session (or use browser devtools request blocking / offline throttling) while submitting.
  - *Concurrent duplicate submission*: rapid double-click on the submit control during an in-flight save.
- **Rationale**: All classes are reproducible without any code changes or test tooling; each maps to acceptance scenarios in US1–US4.
- **Alternatives considered**: Automated Playwright/Vitest-driven repro — rejected for this cycle: manual verification satisfies FR-002 evidence rule and avoids new tooling in a report-only engagement.

## D3: Severity & classification conventions

- **Decision**: Reuse the repo's established scale — severity `critical | high | medium | low` (definitions fixed in spec Key Entities) plus kind `functional-bug | ux-problem | polish`. Additionally adopt the optional `risk: breaking | moderate | safe` second axis seen in `src/audit-findings.json` to indicate fix risk.
- **Rationale**: Matches prior audits in this repo (spec 065 summary counts by severity; audit-findings.json schema), so downstream fix planning can compare across audits.
- **Alternatives considered**: Inventing a new rubric — rejected: cross-audit comparability lost.

## D4: Report artifact format

- **Decision**: Single Markdown deliverable `specs/067-employee-add-audit/findings.md`, structured per the contract in `contracts/findings-report-contract.md` (per-finding blocks + coverage matrix + deferred-scope statement per FR-007).
- **Rationale**: Markdown matches all prior spec artifacts; human-reviewable before task generation. The JSON format of `src/audit-findings.json` was a one-off machine-readable variant and is not required here.
- **Alternatives considered**: JSON findings file — deferred: can be generated later from markdown if automation is wanted.

## D5: Coverage tracking method (SC-001)

- **Decision**: Maintain a coverage matrix table in the report header: rows = process areas from FR-004, columns = user stories/acceptance scenarios, cells = pass / finding-ID / blocked. SC-001 is satisfied when every cell is filled.
- **Rationale**: Makes the "zero areas unexamined" criterion mechanically checkable at review time.
- **Alternatives considered**: Narrative-only coverage claims — rejected: not verifiable.

## D6: Account-creation handoff boundary (FR-004)

- **Decision**: Review the handoff surface only — what the admin sees immediately after successful employee creation (success toast, list refresh, card action menu offering account creation via `CreateAccountModal`). Verify the path exists and is discoverable; do NOT execute the full account-creation flow. One bounded exception added post-clarification: open `CreateAccountModal` and verify client-side enforcement of the raised 12-character password minimum (type a <12-char password and observe rejection); do not submit or provision anything.
- **Rationale**: Matches spec Assumptions; keeps blast radius inside the employee-record flow. The bounded check follows directly from the clarified spec answer (12-char minimum must be enforced client-side) without expanding into a full account-flow audit.
- **Alternatives considered**: Full CreateAccountModal audit — rejected: separate concern, would dilute scope.

## D7: Baseline state & test data values

- **Decision**: Seed deterministic fake data locally before verification:
  - Valid baseline: full name `Test Employee One`, phone `01000000001`, national ID `30001011234567`, job title `QA Instructor`, salary `5000`.
  - Malformed set: whitespace-only name (`"   "`), email `not-an-email`, phone `abc`, national ID `123` and 15+ digit variants, salary `-50` / `999999999999`, contract `%` = `150`.
- **Rationale**: Fixed inputs make repro steps copy-pasteable and findings comparable across re-runs.
- **Alternatives considered**: Ad-hoc random inputs — rejected: non-repeatable evidence.

## D8: Updated HR staff-endpoint failure contract (evaluation baseline)

- **Decision**: Judge all failure handling against the revised backend contract documented in the `039-audit-employee-creation` migration notes: error classes renamed (`ConflictError`, `NotFoundError`, `BusinessRuleError`) — any legacy `"Conflict"`/`"NotFound"` string comparisons in frontend code count as findings; duplicate rejections aggregate EVERY colliding field into one field-named message (`national_id: already in use; phone: already in use`), which the UI is expected to surface verbatim with entered data preserved (US2-1); provisioning failures marked `BusinessRuleError` guarantee zero partial records, so a transient-error state with retry is the expected UX; account creation rejects passwords <12 chars with 422 naming all invalid fields at once.
- **Rationale**: The spec's US2-1 and Assumptions baseline were clarified against these contract changes after initial planning; auditing against the old one-conflict-per-attempt behavior would misclassify correct new-format responses as anomalies and miss the generic-banner finding in `EmployeeForm`.
- **Alternatives considered**: Auditing against the pre-change contract — rejected: evaluates against obsolete behavior.

## Unresolved items

None. All Technical Context fields known; no NEEDS CLARIFICATION remains.
