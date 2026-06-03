# Research: Frontend Migration

## Replacing Deprecated Endpoints
- **Decision**: All removed endpoints (`GET /academics/groups`, `GET /academics/groups/enriched`, `GET /academics/groups/search`, `GET /academics/groups/archived`, `GET /academics/groups/by-course/{courseId}`) will map directly to `GET /academics/groups/filter`.
- **Rationale**: This is the new canonical endpoint configured in the backend that handles all these operations based on query parameters.

## Handling Pagination Format
- **Decision**: The `PaginatedApiResponse<Group>` expects `{ data: T[], total: number }`. The new backend returns `{ groups: EnrichedGroupPublic[], total: number, skip: number, limit: number }`. The frontend API client functions will be rewritten to extract `.data.data.groups` and map it using `normalizeEnrichedGroup`.
- **Rationale**: This allows us to keep the React Query hooks mostly untouched while still accommodating the new API wrapper structure.
