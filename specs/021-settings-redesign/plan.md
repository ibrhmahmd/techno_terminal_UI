# Implementation Plan: Settings Page Redesign

**Spec**: `specs/021-settings-redesign/spec.md`  
**Date**: 2026-05-22  
**Affected files**: `src/pages/SettingsPage.tsx` only (no new files)

## Summary

Refactor `SettingsPage.tsx` to use the app's common components: `TopNavbar`, `PageHeader`, `PageSection`, `ErrorBoundary`, `ActionButton`. Refine tab navigation to use `border-b-2` underline style matching CompetitionDetailPage. All tab sub-components (`ProfileTab`, `SessionsTab`, `ActivityTab`, `UsersTab`, `AuditLogTable`, etc.) remain untouched.

## Technical Context

**Framework**: React 19 + Vite 8  
**Routing**: React Router DOM 7  
**Styling**: Tailwind CSS 3.4 (v3 format)  
**Icons**: Material Symbols (`material-symbols-outlined`)  
**Fonts**: Space Grotesk (`font-headline`), Inter (`font-body`)  
**TypeScript**: Strict mode (noUnusedLocals, noUnusedParameters, verbatimModuleSyntax, erasableSyntaxOnly)  
**Build**: `tsc -b && vite build` — all test files excluded via tsconfig.app.json

## Implementation Tasks

### Phase 1: Refactor SettingsPage Shell

| ID | Description | Details |
|----|-------------|---------|
| T001 | Add `TopNavbar` | Import from `../components/dashboard/TopNavbar` and render before header |
| T002 | Replace custom header with `PageHeader` | Import from `../components/common/PageHeader`. Title: "Settings", subtitle: "Manage your account and system preferences" |
| T003 | Convert Notifications link to `ActionButton` | Import from `../components/common/ActionButton`. Use `useNavigate` for onClick. Place in PageHeader `actions` slot |
| T004 | Add `PageSection` wrapper | Import from `../components/common/PageSection`. Replace raw `<section>` with `<PageSection>` |
| T005 | Add `ErrorBoundary` | Import from `../components/common/ErrorBoundary`. Wrap tab panel content |
| T006 | Refine tab navigation styling | Switch active indicator from `h-0.5 bg-secondary rounded-t` to `border-b-2 border-secondary`. Inactive: `text-slate-500 hover:text-slate-700`. Keep ARIA attributes. |
| T007 | Clean up imports | Remove unused React Router imports (`Link`), keep `useNavigate`. Remove manual class strings no longer needed. |

### Phase 2: Verification

| ID | Description |
|----|-------------|
| V001 | Run `npm run lint` — zero new errors |
| V002 | Run `npm run build` (`tsc -b && vite build`) — zero errors |
| V003 | Manual check: tab navigation renders correctly with underline style |
| V004 | Manual check: Notifications button navigates correctly |
| V005 | Manual check: Tab content switches correctly for all tabs |
| V006 | Manual check: Role-based visibility preserved (instructor sees fewer tabs) |

## Execution Order

```
T001 ─┐
T002 ─┤
T003 ─┤ (all parallel — different concerns in same file)
T004 ─┤
T005 ─┤
T006 ─┤
T007 ─┘
  │
  ▼
V001–V006 (sequential verification)
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking tab selection logic | High | Low | Tab state (`useState`, `activeTab`) and click handlers remain unchanged |
| Breaking ARIA semantics | Medium | Low | ARIA attributes preserved on new tab elements |
| Import conflicts | Low | Low | Single file edit, clear imports |

## Rollback

```bash
git checkout -- src/pages/SettingsPage.tsx
```
