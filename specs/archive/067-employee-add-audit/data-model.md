# Data Model: Employee Addition Process Audit

**Feature**: 067-employee-add-audit | **Date**: 2026-08-23
Entities for the audit's deliverable (findings report). No production data model changes.

## Entity: Finding

A single verified issue discovered during the audit.

| Field | Type | Rules |
|-------|------|-------|
| id | string | Stable identifier `F-NNN`, sequential in report order |
| title | string | One-line imperative summary; non-empty |
| area | enum | One of the Review Areas below |
| kind | enum | `functional-bug` \| `ux-problem` \| `polish` |
| severity | enum | `critical` \| `high` \| `medium` \| `low` (definitions in spec Key Entities) |
| risk | enum, optional | `breaking` \| `moderate` \| `safe` — expected fix risk (repo precedent: src/audit-findings.json) |
| evidence | ReproStep[] + ObservedVsExpected | ≥1 demonstrated repro; code refs allowed as supplement only (FR-002) |
| impact | string | Consequence for admins/staff data; required for critical/high |
| affectedSurfaces | string[] | Files/screens sharing the flaw; drives FR-008 blast-radius tags |
| sharedSurfaceTag | boolean | true if any surface is used by flows outside add-employee (FR-008) |
| recommendation | string | Required for critical/high (FR-005); optional otherwise |

**State transitions**: `suspected → verified → published` (normal path) or `suspected → discarded` (could not reproduce per FR-002). Discarded findings MUST NOT appear in the report body; they may be listed in an appendix as "investigated, not reproduced" with reasons. Published is terminal for this cycle (no fixes here, FR-010).

## Entity: Review Area

A slice of the add-employee process. Fixed enumeration (drives coverage matrix):

1. `validation` — field-level rules at submit time
2. `error-handling` — failure feedback & recovery
3. `data-integrity` — stored record vs entered intent
4. `ergonomics` — dismissal protection, keyboard/focus, layout
5. `concurrency` — duplicate submission / in-flight close

## Entity: ReproStep

One step of a reproduction script.

| Field | Type | Rules |
|-------|------|-------|
| order | integer | 1-based within a Finding |
| action | string | What the auditor does (uses D7 seed values where applicable) |
| observed | string | What actually happened |
| expected | string | What reasonable behavior would be |

## Entity: Coverage Matrix Entry

Tracks SC-001 (100% process areas examined).

| Field | Type | Rules |
|-------|------|-------|
| area | enum | Review Area |
| scenarioRef | string | User story acceptance scenario ID (e.g., US1-2) |
| status | enum | `pass` \| `finding:F-NNN` \| `blocked` |
| note | string, optional | Context for blocked cells |

**Validation rule**: every (area × FR-004 process-step) cell must have exactly one entry before the report ships.

## Relationships

- A **Review Area** contains zero or more **Findings**.
- A **Finding** references one or more **Coverage Matrix Entries** (the scenarios that exposed it).
- Every Coverage Matrix Entry resolves to `pass`, a Finding, or `blocked`; no empty cells.
