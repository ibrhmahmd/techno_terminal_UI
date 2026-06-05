# Implementation Plan: Notifications Feature Audit & Fix

**Branch**: `038-notifications-audit` | **Date**: 2026-06-05 | **Spec**: `specs/038-notifications-audit/spec.md`
**Input**: Feature specification from audit findings across 5 phases (bugs, dead code, TS violations, data fetching anti-patterns, accessibility gaps)

## Summary

Audit and fix the notifications feature across 5 user stories: (1) fix 2 runtime bugs (null guard on `template.variables`, TestModal variables setter); (2) remove 1 dead component, 14 dead hooks, 1 unused type, 1 unused query key; (3) eliminate 2 unsafe type casts and 1 dead prop; (4) consolidate 1 duplicate parallel API fetch, use mutation hook, migrate query keys to centralized factory, add enabled guard; (5) add ARIA labels to 7 icon-only buttons, aria-hidden to 10 decorative icons, htmlFor/id to 4 label-input pairs, ErrorBoundary and role="tabpanel" to tabs, retry button to logs error state.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**API**: Axios client at `src/api/client.ts`, base `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). Build must pass `tsc -b && vite build`.

### Notifications Feature Structure

```
src/
├── api/notifications/
│   ├── index.ts              # Barrel re-export
│   ├── types.ts              # DTOs and types
│   ├── admin.ts              # Admin settings API
│   ├── bulk.ts               # Bulk messaging API
│   ├── logs.ts               # Dispatch logs API
│   └── templates.ts          # Templates API
├── hooks/notifications/
│   ├── index.ts              # Barrel (14 unused exports)
│   ├── queryKeys.ts          # Local query keys (should be centralized)
│   ├── useAdditionalRecipients.ts
│   ├── useAdminSettings.ts   # 4 unused hooks
│   ├── useBulkMessaging.ts   # 5 unused hooks
│   ├── useNotificationLogs.ts # 3 unused hooks
│   └── useNotificationTemplates.ts # 1 unused hook
├── components/notifications/tabs/
│   ├── AdminSettingsTab.tsx   # Active
│   ├── BulkMessagingTab.tsx   # Placeholder/active
│   ├── LogsTab.tsx            # Active
│   └── TemplatesTab.tsx       # DEAD — never imported
└── pages/
    └── NotificationsPage.tsx  # Active, imports 3 of 4 tabs
```

**Unknowns (NEEDS CLARIFICATION):**
1. Whether `TemplatesTab` should be removed entirely or kept for future use — audit findings marked it as unreachable (zero imports). Decision: remove entirely since no roadmap item references it.
2. Whether the centralized query keys file `src/hooks/queryKeys.ts` already has notification stubs — NEEDS CLARIFICATION: check file before migrating.
3. Whether `BulkMessagingTab.tsx` placeholder should also receive accessibility fixes — yes, it's a live rendered component.
4. How `useToggleNotification` mutation hook should be refactored to accept type at mutation-call time — needs design decision on hook signature.

## Constitution Check

*GATE: No constitution file found — automatically passed.*

No constitution.md present in `.specify/memory/`. All gates skipped.

## Project Structure

### Documentation (this feature)

```
specs/038-notifications-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
```

### Source Code

No new source files needed — this is an audit/fix feature. All changes are edits to existing files.

## Complexity Tracking

No Constitution Check violations to justify.

## Phase 0 — Research Tasks

The following unknowns need resolution before design:

1. Does `src/hooks/queryKeys.ts` already contain notification stubs? Read file to confirm.
2. Verify that removing `TemplatesTab` doesn't break anything by confirming zero imports across the entire `src/` tree.
3. Verify that removing each of the 14 unused hooks doesn't break anything by confirming zero imports.
4. Confirm the `useAdminSettings` response shape to verify `additional_recipients` field name.
5. Check existing pattern for centralized query keys — how other domains add theirs.
