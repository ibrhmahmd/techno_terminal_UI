# Contract: Findings Report (`findings.md`)

The deliverable interface of this audit cycle. `/speckit.tasks` and downstream fix planning consume this document; it must conform exactly.

## File location

`specs/067-employee-add-audit/findings.md`

## Document structure (ordered)

```text
# Employee Addition Audit — Findings Report
## Summary
   - counts by severity (critical/high/medium/low) and kind
   - overall verdict sentence
## Coverage Matrix          ← D5 matrix; every cell filled (SC-001)
## Findings                 ← one block per finding, severity-ordered
### F-001: <title>
- Area / Kind / Severity / Risk:
- Evidence: numbered ReproSteps with Observed vs Expected (+ file:line refs as supplement)
- Impact:
- Affected surfaces: [ ]  (mark SHARED-SURFACE tag when FR-008 applies)
- Recommendation:         (mandatory for critical/high)
## Investigated, Not Reproduced   ← discarded suspicions + why (FR-002)
## Deferred Scope                 ← FR-007 statement: edit-mode reuse,
                                     full account-creation flow, a11y deep pass, RTL
```

## Per-finding block contract

| Section | Required | Format rule |
|---------|----------|-------------|
| Title heading | yes | `### F-NNN: <imperative summary>` |
| Classification line | yes | `Area: <area> · Kind: <kind> · Severity: <severity> · Risk: <risk?>` using fixed enums from data-model.md |
| Evidence | yes | ≥1 complete repro script; each step has Action/Observed/Expected; steps must be executable verbatim against local env (D7 seed inputs) |
| Impact | critical/high: yes | plain-language consequence |
| Affected surfaces | yes | bullet list of file/screen paths; prefix shared ones with `[SHARED]` |
| Recommendation | critical/high: mandatory | concrete, actionable; medium/low optional |

## Quality gates (report is done when)

1. Every cell in the Coverage Matrix is `pass`, `finding:F-NNN`, or `blocked` — none blank.
2. Zero published findings lack evidence; zero unverified claims outside the "Not Reproduced" appendix.
3. 100% findings classified; 100% critical/high carry recommendations (SC-003).
4. Each finding is fixable without re-investigation (SC-004): repro + surfaces present.
5. Deferred Scope section names everything deliberately not reviewed (FR-007).

## Blocked-cell rule

If the local backend cannot run (D1 fallback), affected cells are marked `blocked` with reason; the report still ships, with blocked items explicitly excluded from severity counts.
