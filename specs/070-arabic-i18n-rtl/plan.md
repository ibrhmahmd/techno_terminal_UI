# Implementation Plan: Arabic i18n/RTL Support

**Branch**: `070-arabic-i18n-rtl` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/070-arabic-i18n-rtl/spec.md`

## Summary

Add bilingual (EN/AR) support to the Techno Terminal UI. Users toggle language in Settings — the UI re-renders instantly in the selected language with correct RTL layout. Implementation is phased: infrastructure first, Finance/Receipts as proof of concept, then bulk extraction of ~1,490 strings across all pages/components.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (React single-page application)
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.
**Scale/Scope**: Single-page CRM with 25 pages, ~15 API domain modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All code in `src/`. No backend changes. Locale stored in localStorage. |
| II. Server State Discipline | ✅ PASS | No API calls for this feature. Locale is client-side state only. |
| III. Global State Minimalism | ✅ PASS | Locale is truly global UI state — accessed by every component, persisted across sessions. Zustand is the correct choice. |
| IV. TypeScript Strict Mode | ✅ PASS | Will use `import type` for type-only imports, no enums, no `any`. |
| V. Component Naming Convention | ✅ PASS | New components follow existing suffix conventions. |

**Gate Result**: PASS — no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/070-arabic-i18n-rtl/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created by /speckit.plan)
```

### Source Code

```text
src/
├── api/                  # Domain-based Axios modules
│   ├── client.ts         # Axios instance with JWT interceptor
│   ├── auth/
│   ├── academics/        # groups, courses, schedule
│   ├── crm/              # students, parents
│   ├── finance/
│   ├── dashboard/
│   ├── competitions/
│   ├── enrollments/
│   ├── attendance/
│   ├── hr/
│   ├── analytics/
│   └── notifications/
├── components/
│   ├── common/           # Modal, DataTable, Toast, SearchBar, Pagination
│   ├── layout/           # AppLayout, Sidebar
│   └── {domain}/         # Feature-specific components
├── hooks/                # React Query hooks per domain
│   ├── queryKeys.ts      # Centralized cache keys
│   ├── dashboard/
│   ├── students/
│   ├── notifications/
│   └── finance/
├── pages/                # 25 route page components
├── store/                # Zustand stores (authStore, settingsStore)
├── lib/                  # queryClient.ts
├── types/                # Global TS interfaces (api.ts, pagination.ts)
├── utils/                # colors.ts, formatting.ts, date.ts, etc.
├── i18n/                 # NEW — i18n configuration
│   ├── index.ts          # i18next initialization
│   └── locales/
│       ├── en/
│       │   └── common.json
│       └── ar/
│           └── common.json
├── config/               # studentGrouping.ts
├── test/                 # setup.ts (Vitest setup)
└── tests/                # *.test.{ts,tsx} test files
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. New i18n files go in `src/i18n/`. New Zustand store (`settingsStore`) goes in `src/store/`. No backend, no monorepo packages.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — no complexity tracking needed.
