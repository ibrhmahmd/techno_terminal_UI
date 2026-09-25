# Implementation Plan: Reusable Terminal Pattern Background

**Branch**: 55-terminal-pattern-background | **Date**: 2026-07-10 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/055-terminal-pattern-background/spec.md)

---

## Summary

This plan integrates the repeating terminal symbol matrix background into core layout components (`PageHeader.tsx` and `EmptyState.tsx`) to unify the visual identity of the website. To avoid duplication, the inline SVG code is extracted into a reusable `TerminalPattern` component, which is also used to simplify `AuthLayout.tsx`.

---

## Technical Context

- **Frontend**: TypeScript, React 18, Tailwind CSS.
- **Testing & Quality**: Vitest, ESLint.

---

## Constitution Check

- **Principle I: Frontend-Only Scope**: PASS. All changes are contained within the `src/` directory of the UI repository.
- **Principle II: Server State Discipline**: PASS. No server state or queries are impacted.
- **Principle III: Component Deduplication**: PASS. Reuses a unified component instead of copy-pasting inline SVGs.

---

## Proposed Changes

### [NEW] [TerminalPattern.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/TerminalPattern.tsx)
Create a reusable SVG-based pattern component supporting custom id, opacity, and className.

### [MODIFY] [index.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/index.ts)
Export `TerminalPattern` so it can be imported cleanly.

### [MODIFY] [EmptyState.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/EmptyState.tsx)
Wrap layout with `relative overflow-hidden` and render the pattern with `opacity={0.03}`. Wrap content in a `relative z-10` container.

### [MODIFY] [PageHeader.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/PageHeader.tsx)
Wrap layout with `relative overflow-hidden` and render the pattern with `opacity={0.04}`. Wrap content in a `relative z-10` container.

### [MODIFY] [AuthLayout.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/auth/AuthLayout.tsx)
Import `TerminalPattern` from `../common` and replace duplicate inline SVG templates.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify clean TypeScript compiling.
- Run `npm run lint` or ESLint directly to confirm zero lint errors.
- Run `npm run test` to ensure vitest regression checks pass.
