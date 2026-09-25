# Quickstart: Competition Detail Redesign

## Files to Modify

| File | Action |
|------|--------|
| `src/api/teams/teams.ts` | Change `include_members` from `false` to `true` in `getTeams()` |
| `src/hooks/teams/useTeams.ts` | Transform `TeamWithMembersDTO[]` response into `TeamCardData[]` |
| `src/pages/CompetitionDetailPage.tsx` | Major: reduce to 2 tabs, restructure overview with stats + category grid, wire teams tab with grouping/filtering |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/competitions/TeamCard.tsx` | Rich team card component |
| `src/components/competitions/TeamGroupBySelector.tsx` | Group-by + subgroup-by selectors |
| `src/components/competitions/TeamCategoryFilter.tsx` | Category filter for teams tab |
| `src/tests/TeamCard.test.tsx` | Tests for TeamCard rendering |
| `src/tests/CompetitionDetailPage.test.tsx` | Tests for new page layout |

## Implementation Order

1. **API layer**: Update `getTeams` → `include_members=true`, update hook response type
2. **Utility**: Create `groupTeams()` pure function
3. **TeamCard**: Build and test the card component
4. **TeamGroupBySelector**: Build group-by + subgroup-by selectors
5. **TeamCategoryFilter**: Build category filter
6. **CompetitionDetailPage**: Restructure tabs, integrate all components
7. **Tests**: Write component and integration tests

## Run Commands

```bash
npm run dev          # Dev server with hot reload
npm run build        # tsc -b && vite build (must pass)
npm run test         # All tests (must pass)
npm run lint         # ESLint (must pass)
npm run test -- src/tests/TeamCard.test.tsx   # Single test file
```
