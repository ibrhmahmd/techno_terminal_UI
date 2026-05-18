# API Contracts: Competitions & Teams

All endpoints use base URL `/api/v1` and return `ApiResponse<T>` envelope:
```json
{ "success": true, "data": T, "message": "optional" }
```

## Competitions

### GET /competitions
- **Auth**: Any authenticated user
- **Response**: `ApiResponse<CompetitionDTO[]>`

### POST /competitions
- **Auth**: Admin only
- **Body**: `{ name, edition?, competition_date?, location?, notes?, fee_per_student? }`
- **Response**: `ApiResponse<CompetitionDTO>` (201)

### GET /competitions/{id}
- **Auth**: Any authenticated user
- **Response**: `ApiResponse<CompetitionDTO>`
- **Errors**: 404

### PUT /competitions/{id}
- **Auth**: Admin only
- **Body**: `{ name?, edition?, edition_year?, competition_date?, location?, fee_per_student?, notes? }` (at least one required)
- **Response**: `ApiResponse<CompetitionDTO>`

### PATCH /competitions/{id}
- **Auth**: Admin only
- **Body**: Same as PUT, partial update
- **Response**: `ApiResponse<CompetitionDTO>`

### DELETE /competitions/{id}
- **Auth**: Admin only
- **Response**: `ApiResponse<boolean>`
- **Errors**: 404, 409 (has registered teams)

### GET /competitions/{id}/summary
- **Auth**: Any authenticated user
- **Response**: `ApiResponse<CompetitionSummaryResponse>`
- **Errors**: 404

### GET /competitions/{id}/categories
- **Auth**: Any authenticated user
- **Response**: `ApiResponse<CategoryResponse[]>`
- **Errors**: 404

## Teams

### GET /teams
- **Auth**: Any authenticated user (coach sees own teams only)
- **Query**: `competition_id` (required), `category?`, `subcategory?`, `include_members?` (default true)
- **Response**: `ApiResponse<TeamWithMembersDTO[]>` or `ApiResponse<TeamDTO[]>`

### POST /teams
- **Auth**: Admin only
- **Body**: `{ competition_id, team_name, category, subcategory?, project_name?, project_description?, student_ids[], student_fees?, coach_id?, group_id?, notes? }`
- **Response**: `ApiResponse<TeamRegistrationResultDTO>` (201)
- **Errors**: 400, 404, 409 (duplicate student or team name)

### GET /teams/{id}
- **Auth**: Admin or team coach
- **Response**: `ApiResponse<TeamDTO>`
- **Errors**: 404, 403

### PUT /teams/{id}
- **Auth**: Admin only
- **Body**: `{ team_name?, category?, subcategory?, project_name?, project_description?, group_id?, coach_id?, notes? }` (at least one required)
- **Response**: `ApiResponse<TeamDTO>`

### PATCH /teams/{id}
- **Auth**: Admin only
- **Body**: Same as PUT, partial update
- **Response**: `ApiResponse<TeamDTO>`

### DELETE /teams/{id}
- **Auth**: Admin only
- **Response**: `ApiResponse<boolean>`
- **Errors**: 404, 409 (has paid members)

### GET /teams/{id}/members
- **Auth**: Admin or team coach
- **Response**: `ApiResponse<TeamMemberListResponse>`
- **Errors**: 404, 403

### POST /teams/{id}/members
- **Auth**: Admin only
- **Body**: `{ student_id, amount_due? }` (amount_due defaults to 0.0)
- **Response**: `ApiResponse<AddTeamMemberResultDTO>` (201)
- **Errors**: 400, 409

### DELETE /teams/{id}/members/{student_id}
- **Auth**: Admin only
- **Response**: `ApiResponse<boolean>`
- **Errors**: 400 (paid member), 404

### POST /teams/{id}/members/{student_id}/pay
- **Auth**: Admin only
- **Body**: `{ amount, parent_id? }` (amount > 0, supports partial)
- **Response**: `ApiResponse<PayCompetitionFeeResponseDTO>`
- **Errors**: 400, 404

### PATCH /teams/{id}/placement
- **Auth**: Admin only
- **Body**: `{ placement_rank, placement_label? }`
- **Response**: `ApiResponse<TeamDTO>`
- **Errors**: 400 (competition date not passed)

## Student Competitions

### GET /students/{id}/competitions
- **Auth**: Any authenticated user
- **Response**: `ApiResponse<StudentCompetitionsResponse>`
- **Errors**: 404

## Removed Endpoints (No Longer Exist)

- `POST /competitions/{id}/restore` — hard delete, no restore
- `GET /competitions/deleted` — no soft delete
- `POST /teams/{id}/restore` — hard delete, no restore
- `GET /teams/deleted` — no soft delete
- `POST /teams/{id}/pay` — replaced by `POST /teams/{id}/members/{student_id}/pay`
