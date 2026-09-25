# Quickstart: Groups Feature Audit & Fix

**Date**: 2026-05-19  
**Feature**: 015-groups-audit-fix

## Getting Started

```bash
# Ensure you're on the feature branch
git checkout 015-groups-audit-fix

# Install dependencies (if needed)
npm install

# Run dev server
npm run dev
```

## Development Workflow

1. **Run tests before changes**: `npm run test`
2. **Make changes** following the task order in `tasks.md`
3. **Verify after each batch**:
   ```bash
   npx tsc --noEmit --project tsconfig.app.json  # Type check
   npm run lint                                   # Lint check
   npm run build                                  # Full build
   ```
4. **Commit incrementally** — each logical group of fixes should be a separate commit

## Key Files to Know

| Category | Files |
|----------|-------|
| Bug fixes | `src/components/groups/GroupColumns.tsx`, `src/components/groups/StudentsTab.tsx`, `src/components/groups/GroupForm.tsx`, `src/components/groups/detail/EditGroupDialog.tsx` |
| Dead code | `src/components/groups/GroupHeader.tsx`, `src/components/groups/history/*.tsx`, `src/api/academics/groups/core.ts`, `src/api/academics/groups/lifecycle.ts` |
| Data fetching | `src/hooks/useGroupMutations.ts`, `src/hooks/useGroupDetail.ts`, `src/hooks/useGroupEnrollments.ts`, `src/hooks/useGroupPayments.ts` |
| Accessibility | `src/components/groups/GroupCard.tsx`, `src/components/groups/TabNavigation.tsx`, `src/components/groups/detail/EditGroupDialog.tsx`, `src/components/groups/detail/ProgressLevelDialog.tsx` |
| Tests | `src/tests/GroupsTable.test.tsx`, `src/tests/useGroups.test.ts` |

## Verification Commands

```bash
# Verify no remaining issues:
rg ': any' src/components/groups/ src/hooks/useGroup*.ts
rg 'console\.' src/components/groups/ src/hooks/useGroup*.ts
rg 'export default' src/components/groups/
rg 'useEffect.*get' src/hooks/useGroup*.ts

# Verify dead code removed:
ls src/components/groups/GroupHeader.tsx  # should fail
ls src/components/groups/history/         # should be empty or deleted
```

## Build Gates

Before committing any changes:
1. `npm run lint` — zero errors
2. `npm run build` — `tsc -b && vite build` must succeed
3. `npm run test` — all tests pass
