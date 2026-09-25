# Feature Specification: Employee Addition Process Audit

**Feature Branch**: `067-employee-add-audit`
**Created**: 2026-08-23
**Status**: Draft
**Input**: User description: "focus on the employee adding feature — review its processes, especially adding a new employee: potential UX problems or potential bugs"

## Clarifications

### Session 2026-08-23

- Q: Against which environment should the audit exercise write operations (form submissions creating real employee records), and what happens to test records afterwards? → A: Local dev backend only; all test submissions hit a locally started instance, shared/production data untouched, no cleanup needed.
- Q: Should the resulting plan include implementing fixes for confirmed findings, or only produce the findings report? → A: Report only; all fixes (including critical/high) are deferred to a separate follow-up engagement.
- Q: Should the audit include a full accessibility pass and/or RTL/Arabic localization check for the dialog, or stay at basic keyboard/focus level? → A: Stay at basic level — keyboard operability + focus checks only; full screen-reader/ARIA and RTL passes are out of scope (incidental findings still taggable per FR-008).
- Q: When the backend rejects a submission for duplicate phone/email/national ID, how should the conflict be surfaced to the admin? → A: Display the API's aggregated field-specific message directly (e.g., "national_id: already in use; phone: already in use") and preserve all entered form data.
- Q: Should the frontend enforce the raised 12-character password minimum on the account-provisioning form? → A: Yes — enforce 12 characters minimum client-side on the provisioning form.
- Q: Should the audit include a bounded check of the Staff Accounts overview table for stale placeholder handling now that email/job_title/created_at carry real values? → A: Yes — one bounded read-only probe of the accounts table rendering; leftover placeholders masking real values are logged as tagged findings.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verify create-form validation is complete and consistent (Priority: P1)

An office admin opens the Add Employee dialog on the Staff page and attempts to submit the form in various incomplete or malformed states. The audit traces each attempt end-to-end and records exactly what happens: which fields are enforced at submit time, which rely only on per-field hints (e.g., a red asterisk), which are never enforced, and whether the messages shown match the actual rules. Any field the UI presents as required but that can be submitted empty/invalid — or any field silently coerced to a different value than typed — is captured as a finding.

Known review triggers observed during scoping (to be confirmed, not assumed): job title displays a required marker but submit-time checks may not include it; email and phone accept arbitrary text; whitespace-only values may pass; numeric inputs may silently coerce cleared or partial input to zero.

**Why this priority**: Bad data created here propagates to payroll, attendance, and staff accounts. Validation gaps are the highest-consequence class of bug in this feature.

**Independent Test**: Can be fully tested by attempting submission with each required/optional field in turn (empty, whitespace-only, malformed, boundary) and comparing actual behavior against the stated rules.

**Acceptance Scenarios**:

1. **Given** the Add Employee dialog open, **When** each required field is submitted empty or whitespace-only one at a time, **Then** behavior is documented per field and every inconsistency between indicated requirements and enforcement is logged as a finding.
2. **Given** malformed email, phone, or national ID values, **When** the form is submitted, **Then** actual acceptance/rejection is recorded and compared against reasonable data-quality expectations for an HR record.
3. **Given** numeric fields (salary, contract percentage) with cleared, partial, negative, or oversized input, **When** submitted, **Then** the exact value stored is recorded and any silent coercion is logged as a finding.

---

### User Story 2 - Verify error feedback and failure recovery (Priority: P2)

Creation can fail for reasons the admin can act on: an employee with the same identity already exists, the server rejects a value, or the connection drops mid-save. The audit reproduces representative failures and evaluates what the admin sees and can do next: Is the message specific enough to act on? Does entered data survive? Can they retry without re-typing? Are technical/internal error texts exposed raw? Is there any path where two different error indicators appear simultaneously or where a failure leaves the dialog in a confusing state?

**Why this priority**: Failure handling determines whether a first-time error becomes a quick retry or a lost work session and a support ticket.

**Independent Test**: Can be fully tested by forcing each failure mode during submit and recording message quality, form-state preservation, and recovery options.

**Acceptance Scenarios**:

1. **Given** a duplicate employee submission, **When** the backend rejects it, **Then** the displayed message identifies every colliding field in plain language using the aggregated format of the updated HR contract (e.g., "national_id: already in use; phone: already in use") and all entered data remains intact.
2. **Given** a network/server failure mid-submit, **When** the request fails, **Then** the admin can retry from the same state without data loss and without duplicate submission.
3. **Given** any failure, **When** error surfaces are shown, **Then** the audit documents every distinct message shown and flags raw technical output or contradictory/duplicate indicators.

---

### User Story 3 - Verify saved-record integrity matches admin intent (Priority: P2)

After a successful creation, the audit compares what the admin entered against what ends up in the employee record and in the staff list. It specifically checks whether blank optional fields are stored as real-looking placeholder values, whether "no salary" is distinguishable from "salary = 0", and how the new record appears (position, completeness) in the list immediately after creation without a manual reload.

**Why this priority**: Silent placeholder pollution and ambiguous zeros corrupt reporting and payroll decisions made later by people who never saw the original form.

**Independent Test**: Can be fully tested by creating employees with various combinations of blank optional fields and comparing displayed list/detail values against entered values.

**Acceptance Scenarios**:

1. **Given** optional education fields left blank, **When** creation succeeds, **Then** the stored record contains no misleading placeholder masquerading as real data (or the placeholder behavior is documented as intended with evidence).
2. **Given** salary left blank versus salary entered as zero, **When** records are created, **Then** the distinction (or lack of one) is documented as a finding if it can mislead.
3. **Given** a successful creation, **When** the dialog closes, **Then** the new employee appears in the staff list without manual page reload.

---

### User Story 4 - Verify unsaved-work protection and dialog ergonomics (Priority: P3)

The admin fills in most of the form and then dismisses the dialog accidentally (Escape key, backdrop click, Cancel). The audit maps every dismissal path and records whether input is lost silently, and whether that risk is acceptable given typical form length (~10 fields including salary). Basic usability of the flow is reviewed alongside: field grouping/labels clarity on desktop and mobile widths, keyboard-only completion, focus placement on open/error, and whether double-clicking the submit button can trigger duplicate submissions.

**Why this priority**: Data loss from accidental dismissal is an annoyance rather than a corruption source, but it is a common daily friction point worth fixing cheaply.

**Independent Test**: Can be fully tested by exercising every dismissal path with partially filled data and completing the form using only a keyboard at mobile and desktop widths.

**Acceptance Scenarios**:

1. **Given** partially filled form, **When** any dismissal path is used, **Then** the outcome (silent discard vs confirmation) is recorded and flagged if data loss is possible without warning.
2. **Given** rapid repeated activation of the submit control, **When** creation is in flight, **Then** the audit determines whether duplicate employee records can result.
3. **Given** keyboard-only use, **When** the dialog opens and validation fails, **Then** focus behavior and full operability are recorded.

### Edge Cases

- What happens when the same national ID or phone is submitted twice across separate attempts (near-simultaneous or sequential)?
- How does the system handle creation succeeding but the subsequent list refresh failing?
- What happens when the dialog is closed while a save is still in flight?
- How are extreme numeric inputs handled (salary with many digits, contract percentage above 100 or below 0)?
- What does the admin experience when the staff list is filtered/searched and a new employee is created who doesn't match the active filter?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The audit MUST exercise every field of the Add Employee form in isolation and combination (empty, whitespace-only, malformed, boundary-length, boundary-numeric) and document actual submit-time behavior.
- **FR-002**: Every reported finding MUST include verifiable evidence — reproduction steps demonstrated against the running application — and MUST NOT rely on code reading alone; unverified suspicions MUST be labeled explicitly as unconfirmed or discarded.
- **FR-003**: Each finding MUST be classified by kind (functional bug vs UX problem vs polish opportunity) and severity (critical / high / medium / low) using the severity conventions of prior audits in this repository.
- **FR-004**: The audit MUST cover these process areas end-to-end: dialog open → fill → submit (happy path); validation failure; server rejection (duplicate/invalid); network failure; successful save → list refresh; every cancel/dismissal path; post-save handoff surface (the prompt/path toward creating a login account).
- **FR-005**: Every critical and high finding MUST have a concrete recommended fix; medium/low findings SHOULD have one.
- **FR-006**: The audit MUST verify and state explicitly whether the staff list reflects a newly created employee without manual reload, including under an active search filter.
- **FR-007**: The final report MUST enumerate which adjacent processes were reviewed versus deferred out of scope (edit-employee reuse of the same form; full account-creation flow), so nothing is assumed covered.
- **FR-008**: Findings affecting shared surfaces used by other flows MUST be tagged so downstream fix planning knows the blast radius beyond this feature.
- **FR-009**: All write-based verifications (submissions that create or attempt to create employee records) MUST be executed against a locally started backend instance; shared or production data MUST NOT be used, and test records require no cleanup because they remain isolated.
- **FR-010**: The deliverable of this cycle is the verified findings report with prioritized recommendations; NO fix implementation is performed here — every fix, including critical and high severity, is deferred to a follow-up engagement planned from the report.

### Key Entities *(include if feature involves data)*

- **Finding**: A single verified issue — attributes: review area, kind (bug/UX/polish), severity, evidence (repro steps + observed vs expected), impact on admins, affected surfaces, recommendation.
- **Review Area**: A slice of the add-employee process — validation, error handling & recovery, data integrity, ergonomics & data-loss protection, concurrency/duplicate submission.
- **Severity**: Critical (data corruption/unrecoverable), High (wrong data saved or workflow blocked), Medium (friction/confusion with workaround), Low (polish).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the process areas listed in FR-004 have documented observations (pass or finding), with zero areas left unexamined.
- **SC-002**: Every published finding has reproducible evidence confirmed against the running application at least once — zero speculative claims in the final report.
- **SC-003**: 100% of findings carry a kind classification and severity rating; 100% of critical/high findings carry a concrete recommended fix.
- **SC-004**: A maintainer can begin fixing directly from the report without re-investigating any finding (each contains location references and reproduction steps).
- **SC-005**: The complete review is delivered in one pass such that the top-priority fixes could be planned immediately (report ready for task generation).

## Assumptions

- Primary actor is an office admin; instructor accounts cannot reach the Staff page, so role-gating is assumed working and out of scope.
- Scope centers on the Add Employee (create) flow. The same form serves edit mode — findings in shared surfaces are tagged (per FR-008), but edit-specific behavior is deferred.
- Accessibility review is limited to keyboard operability and focus placement; full screen-reader/ARIA passes and RTL/Arabic localization checks are out of scope. Incidental accessibility/localization issues spotted along the way may be logged as tagged findings (per FR-008) without deep-pass verification.
- The account-creation step after an employee is created is reviewed only at its handoff surface (plus the bounded 12-char password-minimum probe and one bounded read-only check that the Staff Accounts overview table renders real email/job_title/created_at values without stale null-handling placeholders); the full account flow is deferred.
- This feature delivers the review and prioritized recommendations; implementing fixes happens via follow-up tasks generated from the report.
- Severity scale follows prior audits in this repo (critical/high/medium/low).
- The audit evaluates against the updated HR staff-endpoint failure contract (2026-08-23): error classes renamed (`ConflictError`, `NotFoundError`, `BusinessRuleError`), duplicate rejections aggregate every colliding field into one field-named message, and account provisioning enforces a 12-character password minimum. Expected frontend behavior: surface the aggregated message verbatim, enforce 12-char minimum client-side on the provisioning form, treat `BusinessRuleError` as safe-to-retry; any legacy `"Conflict"`/`"NotFound"` string comparisons or generic-only error banners count as findings.
