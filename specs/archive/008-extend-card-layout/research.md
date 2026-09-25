# Research: Courses & Competitions Card Layout

## Unknowns Resolved

### 1. ViewToggle Reuse
- **Decision**: Reuse `src/components/groups/ViewToggle.tsx` as-is for both Courses and Competitions
- **Rationale**: The component is generic (table/cards toggle) with no Groups-specific logic. Both pages just need to import and render it with local `viewMode` state.
- **Alternatives considered**: Creating separate toggles per page — unnecessary duplication.

### 2. CardGrid / CardSkeleton Reuse
- **Decision**: Reuse `src/components/directory/CardGrid.tsx` and `CardSkeleton.tsx` as-is
- **Rationale**: Same responsive grid pattern (1/2/3/4 columns) needed on both pages. No customization required.
- **Alternatives considered**: Wrapping in CourseCardGrid/CompetitionCardGrid wrappers — unnecessary given no custom empty state or loading logic needed beyond what's already provided.

### 3. CourseCard Fields
- **Decision**: Show name, category badge, price per level, sessions per level, active status
- **Rationale**: These are the same fields already displayed in the Courses DataTable columns. All exist on the `Course` type.
- **Source**: `src/api/academics/types/courses/models.ts` — `Course` interface has `name`, `category`, `price_per_level`, `sessions_per_level`, `is_active`.

### 4. Competition Table Columns
- **Decision**: Show name, location, date, edition, fee per student, deleted status
- **Rationale**: Same fields currently shown on CompetitionCard. Exists on `Competition` type. The table is a new view, not a replacement.
- **Source**: `src/api/competitions/types.ts` — `Competition` interface has `name`, `location`, `competition_date`, `edition`, `fee_per_student`, `deleted_at`.

### 5. GroupBySelector Not Needed
- **Decision**: Neither Courses nor Competitions pages need grouping controls
- **Rationale**: Spec doesn't mention grouping for either page. The view toggle sits in the header area, not replacing or integrating into a grouping bar. (Courses has no grouping; Competitions has no grouping.)
- **Alternative**: Adding grouping — out of scope per spec.

### 6. Competitions Stateful Hook Migration
- **Decision**: Migrate `useCompetition.ts` and `useCompetitionCategories.ts` from `useState`/`useEffect` to React Query (`useQuery`)
- **Rationale**: Constitution Principle II requires all server data through React Query. These hooks use the deprecated stateful pattern.
- **Scope**: US3 (P2) — only if feasible without breaking existing consumers (CompetitionDetailPage, CompetitionEditPage).

### 7. CoursesPage Column Extraction
- **Decision**: Extract inline column definitions from `CoursesPage.tsx` into a new `CompetitionColumns.tsx` file (consistent with GroupColumns pattern)
- **Rationale**: Keeps columns reusable between table and card views, and follows established convention from `GroupColumns.tsx`.
- **Alternative**: Keeping columns inline — works but inconsistent with codebase patterns.

### 8. Competitions Table View Architecture
- **Decision**: Add a `DataTable` alongside the existing card grid, toggled via view mode state
- **Rationale**: Matches the Groups page pattern exactly. Both views share the same data (no need to refetch).
- **Note**: The existing "deleted" toggle (Trash2 button) switches between active cards and deleted table. When in table mode, this toggle should switch between active table and deleted table (both DataTable).

## Existing Bugs Found During Audit

| Bug | File | Severity | Fix |
|-----|------|----------|-----|
| Restore modal doesn't call API | CompetitionDetailPage | High | Wire `restore()` from `useCompetition` to confirm button |
| `handleInputChange` dead code | CompetitionForm.tsx:22 | Low | Remove unused function |
| `console.log` in production | CompetitionForm.tsx:58,61 | Low | Remove or gate behind api_debug |
| `UpdateCompetitionInput` unused import | CompetitionsPage.tsx:12 | Low | Remove import |
| `competitionId`, `canManage` unused props | CategoryList.tsx | Low | Remove destructured props |
| Import after interface | CompetitionsTab.tsx:11 | Low | Move import to top |
| Mixed named/default export | CompetitionsTab.tsx:145 | Low | Use named export only |
