# Implementation Plan: Disable Scroll Wheel on Money Inputs

**Branch**: `053-disable-scroll-money-inputs` | **Date**: 2026-07-01 | **Spec**: `specs/053-disable-scroll-money-inputs/spec.md`
**Input**: Feature specification from `specs/053-disable-scroll-money-inputs/spec.md`

## Summary

Add `onWheel` → `blur()` scroll prevention to 14 unprotected money inputs across 10 files to prevent accidental value changes from mouse wheel or trackpad scrolling. Normalize the existing 2 protected inputs in `EnrollPanel.tsx` to match the same pattern. Frontend-only, no new dependencies.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Styling**: Tailwind CSS v3.4
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Dev Environment**: `npm run dev` (Vite, proxy `/api` → `http://0.0.0.0:8000`)
**Build Gate**: `npm run build` = `tsc -b && vite build` — must pass zero errors
**TS Constraints**: `verbatimModuleSyntax`, `erasableSyntaxOnly: true`, `noUncheckedSideEffectImports: true`
**Test**: `npm run test` (Vitest 4.1 + happy-dom). Test files in `src/tests/`, setup in `src/test/setup.ts`

### Performance Impact
Negligible — adding a single `onWheel` handler per input. No re-render cost, no network requests, no new dependencies.

### Browser Compatibility
- `onWheel` is a standard React synthetic event — supported in all modern browsers
- Scroll wheel value changes on `<input type="number">` is a native browser behavior, not a JS framework behavior
- The `blur()` approach works universally: removes focus from the input, causing the browser to stop applying scroll events to it

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I — Frontend-Only Scope
**PASS** — All changes in `src/`. No backend, no database, no server logic.

### Principle II — Server State Discipline
**PASS** — No React Query changes. No cache invalidation. No data fetching.

### Principle III — Global State Minimalism
**PASS** — No Zustand changes. No new stores.

### Principle IV — TypeScript Strict Mode
**PASS** — No TS-level changes. The `onWheel` handler uses existing `(e.target as HTMLInputElement).blur()` pattern already in the codebase.

### Principle V — Component Naming Convention
**PASS** — No new components. No naming violations.

### Cache & API Discipline — Query Keys
**PASS** — No query key changes.

### Build Gates
**PASS** — Changes are additive DOM event handlers only. Must pass `npm run build` and `npm run lint`.

### Testing
**PASS** — No new test files required. Existing tests unaffected (no behavior changes to existing logic — only scroll prevention added).

**Gate result**: ALL CLEAR — no violations.

## Project Structure

```
specs/
└── 053-disable-scroll-money-inputs/
    ├── plan.md           # This file
    ├── research.md       # Phase 0 — technique resolution
    ├── spec.md           # Feature specification
    ├── quickstart.md     # Phase 1 — developer quickstart
    └── checklists/
        └── requirements.md
```

## Complexity Tracking

No constitution violations. Section not applicable.
