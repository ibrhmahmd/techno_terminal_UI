# Quick Start: Competitions & Team Management Feature Complete

## Implementation Order (Recommended)

### Phase 1: Code Quality Foundation
These are safe, independent cleanup tasks that should be done first to reduce noise:

1. **Remove duplicate types** in `src/api/competitions/types.ts`
   - Delete the second block of duplicate type definitions (lines ~71-89)
   - Keep the first block (lines ~18-36), ensure all imports still resolve
2. **Complete barrel exports** in `src/components/competitions/index.ts`
   - Add `CompetitionForm`, `CompetitionCard`, `CategoryList`, `TeamRegistrationModal`, `CategoryTeamsModal`
3. **Remove unused `onRestore`/`actionLabels`** from `CompetitionsTable` props
4. **Remove unused `useTeamsWithMembers`** hook and `getTeamsWithMembers` API function

### Phase 2: Payload Fix
5. **Fix `registerTeam` payload** — conditionally omit `student_ids` when `group_id` is set (use `undefined` or conditional spread)

### Phase 3: Feature Gaps
6. **Add instructor selector** (`InstructorCombobox`) to `TeamRegistrationModal`, `TeamEditModal`, and team detail display
7. **Add team edit UI** — `TeamEditModal` wired into `TeamDetailPage`
8. **Add parent selector** (`ParentCombobox`) to pay fee modal
9. **Add placement + fee status** to Teams tab and CategoryTeamsModal

### Phase 4: Tests
10. Add test coverage for team registration modal, category list, and team detail page

## Build & Verify

After each phase:
```bash
npm run build    # tsc -b && vite build (zero errors)
npm run lint     # eslint (zero warnings)
npm run test     # vitest (54 pass, 3 pre-existing fails)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/api/competitions/types.ts` | Remove duplicate types |
| `src/api/teams/teams.ts` | Remove unused `getTeamsWithMembers` |
| `src/components/competitions/index.ts` | Complete barrel exports |
| `src/components/competitions/TeamRegistrationModal.tsx` | Add instructor selector, fix group payload |
| `src/components/competitions/CategoryTeamsModal.tsx` | Add fee status per team |
| `src/components/competitions/CategoryList.tsx` | No changes expected |
| `src/components/teams/TeamDetailPage.tsx` | Add edit button, parent selector, instructor display |
| `src/components/teams/TeamEditModal.tsx` | New file — team edit modal |
| `src/pages/CompetitionDetailPage.tsx` | Add placement/fee status to Teams tab |
| `src/hooks/teams/useTeams.ts` | Remove `useTeamsWithMembers` |
| `src/components/common/combobox/InstructorCombobox.tsx` | New file — searchable instructor selector |
| `src/components/common/ParentCombobox.tsx` | New file — searchable parent selector |
