# Implementation Plan: Employee Addition Process Audit

**Branch**: `067-employee-add-audit` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/067-employee-add-audit/spec.md`

## Summary

Audit the Add Employee flow (Staff page → dialog open → fill → submit → success/failure → list refresh → account-creation handoff) and produce an evidence-backed findings report. Every finding must be reproduced against a locally started backend (per FR-009), classified by kind (bug/UX/polish) and severity (critical/high/medium/low), with recommended fixes for critical/high items. This cycle delivers the report only — all fixes are deferred to a follow-up engagement (FR-010). Technical approach: manual exploratory verification driven by a fixed coverage matrix (process areas × acceptance scenarios), using browser devtools and controlled inputs against `npm run dev` proxied to a local FastAPI instance on port 8000.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)
**Testing**: Vitest 4.1 + happy-dom; test files in `src/tests/`. This audit is manual verification — automated tests are not required by the spec.
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (React single-page application)
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh. Dev proxy `/api` → `http://0.0.0.0:8000` (vite.config.ts). Employee endpoints under `src/api/hr/`; account creation under `src/api/hr/staff-accounts.ts`.
**Icons**: Material Symbols (`material-symbols-outlined`) + Lucide React components
**Fonts**: Space Grotesk (`font-headline`), Inter (`font-body`)
**Performance Goals**: <1s initial load, <200ms navigation
**Constraints**: Frontend-only — no backend code changes. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`. All write-based verification MUST hit a locally started backend only (FR-009).
**Scale/Scope**: SPA with 25 pages, 15 API domain modules. Audit surface: `src/pages/StaffPage.tsx`, `src/components/staff/**`, `src/hooks/useStaff.ts`, `src/hooks/useStaffAccounts.ts`, `src/api/hr/*`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | PASS | Audit touches frontend code/docs only; local backend is executed, never modified |
| II. Server State Discipline | PASS | No new data paths introduced; findings will be evaluated against this principle |
| III. Global State Minimalism | PASS | No new global state; report artifacts are static docs |
| IV. TypeScript Strict Mode | PASS | Report-only cycle (FR-010): no production source changes planned |
| V. Component Naming Convention | PASS | No new components |
| Build Gates (`lint`, `build`) | PASS | Documentation-only changes cannot break gates |

**Post-Phase-1 re-check**: Still PASS — Phase 1 outputs are documentation artifacts inside `specs/`; no source impact.

## Project Structure

### Documentation (this feature)

```text
specs/067-employee-add-audit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── findings-report-contract.md
├── checklists/          # requirements.md (from /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code

```text
src/
├── api/
│   ├── client.ts         # Axios instance with JWT interceptor
│   ├── hr/               # AUDIT SURFACE: employees, staff-accounts
│   └── ...               # academics, crm, finance, dashboard, competitions,
│                         # enrollments, attendance, analytics, notifications,
│                         # auth, certificates, reports, tasks, teams
├── components/
│   ├── common/           # Modal, Toast, SearchBar, Pagination, ErrorState...
│   ├── layout/           # AppLayout, Sidebar
│   └── staff/            # AUDIT SURFACE: EmployeeForm/, EmployeeCard,
│                         # EmployeeDetailModal, CreateAccountModal
├── hooks/
│   ├── queryKeys.ts      # Centralized cache keys
│   ├── useStaff.ts       # AUDIT SURFACE: staffKeys, useCreateEmployee
│   └── useStaffAccounts.ts
├── pages/
│   └── StaffPage.tsx     # AUDIT SURFACE: modal orchestration, handlers
├── store/                # Zustand stores (authStore)
├── lib/                  # queryClient.ts
├── types/                # api.ts, pagination.ts
├── utils/                # formatting.ts, etc.
├── test/                 # setup.ts (Vitest setup)
└── tests/                # *.test.{ts,tsx} test files
```

**Structure Decision**: Report-only audit cycle — no production code is added or changed (FR-010). All artifacts live under `specs/067-employee-add-audit/`. The audit exercises existing code paths listed above through the running application.

## Complexity Tracking

No constitution violations — table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    |            |                                     |
