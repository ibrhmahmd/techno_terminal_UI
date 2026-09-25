# Implementation Plan: Certificates Page

**Branch**: `066-certificates-page` | **Date**: 2026-07-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/066-certificates-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Add a Certificates management page (`/certificates`) that lets admins and instructors browse, search, filter, download, generate, and revoke course completion certificates. The page consumes a separate certificates microservice API. Instructors have view/download-only access; admins additionally see Generate, Revoke, and Export CSV actions.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API (Main)**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**API (Certificates)**: Separate microservice at `https://techno-future-certs.fastapicloud.dev/api/v1` — will use a dedicated Axios instance with no auth in dev (public endpoints for now)  
**Icons**: Material Symbols (`material-symbols-outlined`) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules. Certificates page adds ~10 new files.

### Unknowns & Research Tasks

- **Separate API client strategy**: Certs service is at a different domain. Must decide between a new Axios instance or adding a Vite + Vercel proxy entry. (Resolved in research)
- **Download mechanism**: The existing blob-download pattern (`responseType: 'blob'`, `window.URL.createObjectURL`) is well-established for receipts and will be reused. (Resolved in research)
- **Student enrollment data for auto-fill**: `getStudentWithDetails(id)` returns `CurrentEnrollmentInfo` with `group_name`, `course_name`, `level_number`. (Resolved in research)
- **Track filter dropdown values**: Hardcoded from API spec (13 track keys). (Resolved in research)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All cert code in `src/`. Certs API is consumed as an external service — no backend code written. |
| II. Server State Discipline | ✅ PASS | All data fetched via React Query. Mutations invalidate cert query keys. |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores. Page state: local useState and React Query. |
| IV. TypeScript Strict Mode | ✅ PASS | All types use `import type`, no `any`, no enums, no parameter properties. |
| V. Component Naming Convention | ✅ PASS | `CertificatesPage`, `CertificatesTable`, `CertificateForm`, `CertificatesHeader` — follows `*Page`, `*Table`, `*Form`, `*Header` naming. |
| Build Gates | ✅ PASS | `tsc -b && vite build` must pass. Lint must pass. |

**Result: ALL GATES PASS. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/066-certificates-page/
├── plan.md              # This file
├── research.md          # Phase 0 — technical decisions
├── data-model.md        # Phase 1 — entities and state
├── quickstart.md        # Phase 1 — implementation notes
├── contracts/           # Phase 1 — API interface contracts
│   └── certificates-api.md
└── tasks.md             # Phase 2 (created by /speckit.tasks)
```

### Source Code

```text
src/
├── api/
│   ├── certificates/          # NEW domain module
│   │   ├── index.ts           # barrel
│   │   ├── certificates.ts    # API functions
│   │   └── types.ts           # DTOs
│   └── client.ts              # Shared Axios instance (unchanged)
├── components/
│   └── certificates/          # NEW component group
│       ├── CertificatesHeader.tsx
│       ├── CertificatesTable.tsx
│       ├── CertificateForm.tsx
│       └── CertificateDetailModal.tsx
├── hooks/
│   ├── queryKeys.ts           # Add certificate keys
│   └── useCertificates.ts     # React Query hook (NEW)
├── pages/
│   └── CertificatesPage.tsx   # NEW page (named export)
├── components/layout/
│   ├── Sidebar.tsx            # Add nav link
│   └── MobileNavSheet.tsx     # Add nav link
└── App.tsx                    # Add route
```

## Complexity Tracking

No constitution violations. No complexity justification needed.
