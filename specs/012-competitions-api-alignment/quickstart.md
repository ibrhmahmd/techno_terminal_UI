# Quickstart: Competitions API Alignment

## Prerequisites

- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm install`)
- Backend API running at `https://techno-terminal-5c255cfe.fastapicloud.dev/` (proxied via Vite dev server)

## Development Setup

```bash
# Start dev server with API proxy
npm run dev

# Open http://localhost:5173
# Navigate to /competitions to test
```

## Verification Steps

1. **Check types compile**: `npx tsc --noEmit` — should pass with zero errors after all type updates
2. **Check lint**: `npm run lint` — zero errors
3. **Check build**: `npm run build` — `tsc -b && vite build` must succeed
4. **Run tests**: `npm run test` — existing tests should pass; new tests for payment flow added

## Key Files to Modify

### API Layer (start here — unblocks everything else)
- `src/api/teams/types.ts` — update all type definitions
- `src/api/teams/teams.ts` — unwrap ApiResponse envelope, update endpoint paths
- `src/api/competitions/types.ts` — update CompetitionSummaryCategory, TeamMemberDTO, CompetitionDTO

### Hooks (after API layer)
- `src/hooks/competitions/useTeams.ts` — update response parsing
- `src/hooks/competitions/useTeamPayments.ts` — new payment endpoint
- `src/hooks/competitions/useCompetitions.ts` — update summary parsing

### Components (after hooks)
- `src/components/competitions/TeamRegistrationModal.tsx` — per-student fees, project fields
- `src/components/competitions/CategoryTeamsModal.tsx` — new category shape
- `src/components/competitions/CompetitionCard.tsx` — nullable location
- `src/components/competitions/CompetitionForm.tsx` — edition_year support

### Pages (last — depend on components)
- `src/pages/CompetitionsPage.tsx` — remove trash/restore UI
- `src/pages/CompetitionDetailPage.tsx` — update summary rendering
- `src/pages/CompetitionEditPage.tsx` — edition_year field
- `src/pages/TeamDetailPage.tsx` — payment flow, project fields, remove fee display

## Testing the Payment Flow

1. Navigate to a competition detail page
2. Open a team's member roster
3. Click "Pay" on a member with outstanding balance
4. Enter a partial amount (less than amount_due)
5. Verify the remaining balance updates correctly
6. Pay the remaining balance
7. Verify the member shows as fully paid

## Common Pitfalls

- **ApiResponse envelope**: Every teams API call now returns `{ success, data, message }` — access data via `response.data.data`, not `response.data`
- **Nullable fields**: `location`, `competition_date`, `edition_year` can be null — use optional chaining or nullish coalescing
- **Hard delete**: No more `deleted_at` checks or restore buttons — delete is permanent
- **Team.fee removed**: Display per-member fees (`amount_due - amount_paid`) instead of team-level fee
