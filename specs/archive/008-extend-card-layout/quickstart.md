# Quickstart: Courses & Competitions Card Layout

## Prerequisites
- Working dev environment (`npm run dev`)
- Groups card layout is implemented (007) — reuses ViewToggle, CardGrid, CardSkeleton
- Existing Courses and Competitions pages are functional

## New Files

```text
src/components/courses/
├── CourseCard.tsx          # Card component for courses (new)
├── CoursesTable.tsx        # Table component extracted from CoursesPage (new)
└── index.ts                # Barrel exports (new)

src/components/competitions/
├── CompetitionColumns.tsx  # Column defs for competition table (new)
├── CompetitionsTable.tsx   # Table component for competitions (new)
└── index.ts                # Barrel exports (new)
```

## Modified Files

```text
src/pages/CoursesPage.tsx           # Add viewMode state, conditional card/table render
src/pages/CompetitionsPage.tsx      # Add viewMode state, conditional table/card render
src/pages/CompetitionDetailPage.tsx # Fix restore modal bug
src/hooks/competitions/
  useCompetition.ts                 # Migrate to React Query (US3)
  useCompetitionCategories.ts       # Migrate to React Query (US3)
```

## Dependencies (reused from existing codebase)

```text
src/components/groups/ViewToggle.tsx              # Reuse as-is
src/components/directory/CardGrid.tsx              # Reuse as-is
src/components/directory/shared/CardSkeleton.tsx   # Reuse as-is
src/components/common/RowActions.tsx               # Reuse as-is
```

## Cleanup Tasks (US3)

```text
src/pages/CompetitionsPage.tsx         # Remove unused UpdateCompetitionInput import
src/components/competitions/CompetitionForm.tsx # Remove dead handleInputChange, delete console.log
src/components/competitions/CategoryList.tsx     # Remove unused destructured props
src/components/competitions/CompetitionCard.tsx  # Ensure consistent pattern
```

## Implementation Order

1. **Setup**: Create CourseCard, CoursesTable, CompetitionColumns, CompetitionsTable, barrel exports
2. **Courses Card View**: Add ViewToggle to CoursesPage, implement CourseCard + CourseCardGrid rendering
3. **Competitions Table View**: Add ViewToggle to CompetitionsPage, implement DataTable rendering
4. **US3 Cleanup**: Fix bugs, remove dead code, migrate deprecated hooks
5. **Polish**: Lint, build, verify

## Verification

```bash
npm run build    # tsc -b && vite build must pass
npm run lint     # zero new errors
```

## Pattern Reference

Follow the existing GroupCard and ViewToggle implementations:
- `src/components/groups/GroupCard.tsx` — card structure (rounded-xl, border, shadow, hover, RowActions)
- `src/components/groups/ViewToggle.tsx` — icons-only pill toggle
- `src/components/groups/GroupColumns.tsx` — columns file pattern
- `src/components/directory/StudentCard.tsx` — action button pattern
- `src/pages/GroupsPage.tsx` — viewMode state management pattern
