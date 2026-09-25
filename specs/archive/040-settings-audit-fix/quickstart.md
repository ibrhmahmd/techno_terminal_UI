# Quickstart: Settings Page Audit & Fix

## Overview

This feature fixes 22 issues found in a systematic audit of the settings page, across 5 categories: runtime bugs, dead code, data fetching anti-patterns, and accessibility gaps.

## Key Files

| Action | File |
|--------|------|
| DELETE | `src/components/settings/SessionsTab.tsx` |
| DELETE | `src/components/settings/ActivityTab.tsx` |
| DELETE | `src/components/settings/CRMSettingsTab.tsx` |
| DELETE | `src/components/settings/AgeBucketEditor.tsx` |
| EDIT | `src/pages/SettingsPage.tsx` |
| EDIT | `src/components/settings/ProfileTab.tsx` |
| EDIT | `src/components/settings/SessionsActivityTab.tsx` |
| EDIT | `src/components/settings/UsersTab.tsx` |
| EDIT | `src/components/settings/AuditLogTable.tsx` |
| EDIT | `src/hooks/useAuthQueries.ts` |

## Build & Verify

```bash
npm run build    # tsc -b && vite build — must pass
npm run lint     # ESLint — must pass for settings files
```

## Accessibility Verification

```bash
# Verify no remaining a11y gaps in settings files:
rg 'material-symbols-outlined' src/components/settings/ | grep -v 'aria-hidden'
rg '<input' src/components/settings/ | grep -v 'aria-label'
rg '<button' src/components/settings/ | grep -v 'aria-\|title=\|aria-label'
```

## Dead Code Verification

```bash
# Verify removed files have no remaining imports:
rg 'SessionsTab|ActivityTab|CRMSettingsTab|AgeBucketEditor' src/ --glob '!*.test.*'
```
