# Quickstart: Competitions Bug Audit

## Prerequisites
- Dev server running (`npm run dev`)
- Logged in as admin
- API debug mode enabled: `localStorage.setItem('api_debug', 'true')`

## Step 1 — Verify Critical Mismatches

Open browser console, navigate the competitions flow, and check these responses:

### 1a. Category Response Shape
1. Open any competition with registered teams
2. Click the **Categories** tab
3. Check console for `GET /competitions/{id}/categories`
4. **Verify**: Does the response contain `{ category: string, subcategories[] }` or entity objects with `id`, `name`, `max_team_size`?
5. **Report**: Record the raw response in `research.md`

### 1b. Team Registration Endpoint
1. On any category, click **Register Team**
2. Submit with valid data
3. Check console for the POST request
4. **Verify**: Which endpoint was called? What payload was sent?
5. **Report**: Record the endpoint and payload

### 1c. List Competitions Response
1. Load the competitions page
2. Check console for `GET /competitions`
3. **Verify**: What params were sent (`status`, `skip`, `limit`, `search`)? What response format (flat list or paginated wrapper)?
4. **Report**: Record params and response shape

### 1d. Group Teams Field Names
1. Open any group detail page
2. Check console for `GET /academics/groups/{id}/teams`
3. **Verify**: Does response use `team_name` (doc) or `name` (frontend)?
4. **Report**: Record the field name

### 1e. Group Analytics Field Names
1. On group detail, check console for `GET /academics/groups/{id}/competitions/analytics`
2. **Verify**: Does response use `participations[]` (doc) or `competitions[]` (frontend)?
3. **Report**: Record the field names

### 1f. Undocumented Endpoints
Check these exist (expect 200, 401, or 404):
- `GET /competitions/{id}/stats`
- `GET /competitions/{id}/categories/{catId}/teams`
- `POST /competitions/register-team`
- `POST /competitions/team-members/{id}/mark-paid`

## Step 2 — Fix Based on Findings

### If backend matches documentation:
1. Update `src/api/competitions/types.ts` — align `CompetitionCategory`, `RegisterTeamInput`, `TeamRegistration` to doc schemas
2. Update `src/api/competitions/competitions.ts` — fix endpoint paths, params, response unwrapping
3. Update `src/api/academics/types/groups/competitions.ts` — align `TeamPublic` field `team_name`, fix history DTO fields
4. Update components that consume changed types (`CategoryList.tsx`, `TeamRegistrationModal.tsx`, etc.)
5. Delete unused `teams.md` or mark as legacy

### If backend matches frontend:
1. Update `docs/api/competitions/competitions.md` — add pagination params, stats endpoint, category teams endpoint
2. Update `docs/api/competitions/schemas.md` — add `CompetitionCategory`, `CompetitionStatsResponse`, fix `RegisterTeamInput`
3. Update `docs/api/competitions/teams.md` — mark as legacy or remove
4. Verify types in `types.ts` are already correct

### If it's a mix (some endpoints match docs, some match frontend):
1. Document each endpoint's actual behavior in the contracts
2. Fix frontend types for endpoints that match docs
3. Fix docs for endpoints that match frontend
4. Remove dead code / endpoints that don't exist

## Step 3 — Verify
- `npm run build` — must pass
- `npm run lint` — zero new errors
- `npm run test` — all tests pass
- Navigate the full competitions flow with no console errors
