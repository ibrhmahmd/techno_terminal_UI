# Quickstart: Groups API Alignment

## Prerequisites

- Node.js 18+ and npm installed
- Repository cloned and dependencies installed (`npm install`)
- Backend API at `https://techno-terminal-5c255cfe.fastapicloud.dev/` running with new contract

## Development Setup

```bash
# Start dev server with API proxy
npm run dev

# Open browser to http://localhost:5173
```

## Verification Steps

### 1. Type Changes

After updating types in `src/api/academics/types/groups/`, run:

```bash
npm run build
```

This runs `tsc -b && vite build`. Any type mismatches will fail here.

### 2. API Function Changes

After updating API functions in `src/api/academics/groups/`, verify no unused exports remain:

```bash
npm run lint
```

### 3. Hook Changes

After adding new hooks in `src/hooks/`, test that they fetch correctly:

```bash
npm run dev
# Navigate to /groups and verify:
# - Active groups load
# - Search returns results
# - "Completed" tab shows archived groups
```

### 4. Component Changes

After updating components, verify UI renders correctly:

```bash
npm run dev
# Navigate to:
# - /groups — verify list, search, completed tab
# - /groups/:id — verify detail page loads without competition errors
# - Group create/edit dialog — verify schedule fields work
```

### 5. Full Build Gate

Before committing:

```bash
npm run lint && npm run build
```

Both must pass with zero errors.

## Key Files to Modify

Order of modification (bottom-up dependency chain):

1. `src/api/academics/types/groups/models.ts` — Group, EnrichedGroupPublic types
2. `src/api/academics/types/groups/inputs.ts` — ScheduleGroupInput, UpdateGroupDTO
3. `src/api/academics/types/groups/index.ts` — Remove competition re-exports
4. `src/api/academics/groups/core.ts` — Update type usage
5. `src/api/academics/groups/competitions.ts` — DELETE file
6. `src/api/academics/groups/utils.ts` — Remove getGroupsWithCompetitions
7. `src/api/academics/groups/index.ts` — Remove competition re-exports
8. `src/utils/scheduleTransform.ts` — NEW file
9. `src/hooks/queryKeys.ts` — Add new cache keys
10. `src/hooks/useGroupQueries.ts` — Add search, archived, by-course hooks
11. `src/pages/GroupsPage.tsx` — Add "Completed" tab, server-side search
12. `src/pages/GroupDetailPage.tsx` — Remove competition data loading
13. `src/components/groups/shared/GroupStatusBadge.tsx` — Update status union
14. `src/components/groups/detail/EditGroupDialog.tsx` — Update status, schedule
