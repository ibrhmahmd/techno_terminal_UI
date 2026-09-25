# Quickstart: Executing the Employee Addition Audit

End-to-end runbook for producing `findings.md` per the contract. Estimated effort: one focused session.

## 0. Prerequisites

- Node + npm installed; repo checked out on branch `067-employee-add-audit`
- A locally runnable FastAPI backend serving `/api/v1` with an admin login (backend lives in a separate repository — start it on port `8000`)
- Chrome/Firefox devtools proficiency (request blocking, network throttling)

> **If no local backend is available**: do NOT switch environments (FR-009). Record write-dependent checks as `blocked` per D1 fallback and ship the report with blocked cells.

## 1. Start the stack

```bash
# terminal 1 — backend (its own repo), listening on :8000
# terminal 2 — frontend
npm install
npm run dev        # Vite proxies /api → http://0.0.0.0:8000
```

Open `http://localhost:5173`, log in as a local admin, confirm the Staff page loads (`/staff`).

## 2. Baseline sanity pass

1. Staff → **Add Employee** → fill with D7 valid baseline:
   full name `Test Employee One` · phone `01000000001` · national ID `30001011234567` · job title `QA Instructor` · salary `5000`
2. Submit. Expect: success toast, dialog closes, card appears without reload (US3-3, FR-006).
3. Note exact list behavior under an active search filter that does not match the new employee (Edge Case 5).

## 3. Run the scenario matrix

Work through each cell of the Coverage Matrix (see contract). Key inputs:

| Probe | Input / action | Story |
|-------|----------------|-------|
| Required-field sweep | submit with each required field empty, then whitespace-only `"   "` | US1-1 |
| Malformed values | email `not-an-email` · phone `abc` · national ID `123` and 15-digit | US1-2 |
| Numeric coercion | salary cleared / `-50` / `999999999999` · contract `%` = `150` | US1-3 |
| Duplicate rejection | re-submit national ID `30001011234567`; record ALL colliding fields reported at once + envelope class (`ConflictError` per D8) — expected: aggregated field-named message shown verbatim, form data preserved | US2-1 |
| Network failure | stop backend (or block requests) then submit | US2-2 |
| Error-surface audit | capture every distinct message AND error class name from all failures; flag raw technical output, legacy `"Conflict"`/`"NotFound"` comparisons (D8), or generic-only banners | US2-3 |
| Placeholder check | leave university/major blank; inspect stored record & detail view | US3-1 |
| Zero-vs-blank salary | create one with blank salary, one with `0`; compare | US3-2 |
| Dismissal sweep | Escape / backdrop click / Cancel with partially filled form | US4-1 |
| Double-submit | rapid double-click Create Profile during in-flight save | US4-2, Edge 1 |
| Keyboard-only | complete form and error recovery without mouse; note focus on open/error | US4-3 |
| In-flight close | close dialog while save pending | Edge 3 |

For every anomaly: capture repro steps immediately (Action/Observed/Expected) using seed inputs verbatim.

## 4. Handoff surface check (boundary only)

After a successful creation verify: success toast text, list refresh, employee card action menu exposes account creation entry point. Then one bounded probe (per D6 amendment + clarified spec answer): open `CreateAccountModal`, enter a <12-character password, and confirm client-side rejection — do NOT submit or provision anything (D8: backend minimum is 12 chars, 422 on violation). Do not execute the rest of the account flow.

## 5. Write the report

Create `findings.md` exactly per `contracts/findings-report-contract.md`:

1. Classify each anomaly (area/kind/severity/risk) — definitions in spec Key Entities.
2. Verify each candidate against running app before publishing; move non-reproducible ones to "Investigated, Not Reproduced".
3. Tag shared surfaces `[SHARED]` (form also serves edit mode).
4. Fill Coverage Matrix until zero blank cells (SC-001).
5. Complete Summary counts, Deferred Scope statement.

## 6. Definition-of-done checklist

- [ ] Every FR-004 process area has observations (SC-001)
- [ ] Every finding evidence-backed ≥1 live repro (SC-002)
- [ ] All findings classified; critical/high have recommendations (SC-003)
- [ ] Fixable-without-reinvestigation standard met (SC-004)
- [ ] Report ready for task generation (SC-005)
- [ ] No production/shared data touched (FR-009)
