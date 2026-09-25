# Research: Fix Directory Audit

## Overview

This feature is a code-quality fix based on a comprehensive audit of the directory feature (40 issues found). All issues are well-defined with exact file locations, line numbers, and proposed fixes. No open unknowns remain.

## Resolutions

### Unknown 1: Should `staleTime` values be aligned to 5min project convention?

**Decision**: No — keep 2-3min values as-is.

**Rationale**: The directory uses search (2min staleTime) and paginated list queries (3min staleTime). Search benefits from fresher data since it's interactive. The list queries deviate from the 5min convention but the deviation is intentional for the directory's interactive browsing UX.

### Unknown 2: Does the `waitingStudents` total require an API change?

**Decision**: No.

**Rationale**: The fix is purely frontend. The `studentsListQuery.data?.total` from the backend already reflects the full count across all pages. The current code incorrectly subtracts the current-page waiting count from the total. The fix is to remove the subtraction and display the raw total.

### Unknown 3: Do removed dead functions have test consumers?

**Decision**: No — confirmed zero test file imports.

**Rationale**: `rg` across `src/tests/` returns zero matches for all 9 dead function names. Safe to remove.

## Dependency Checks

| Dependency | Status |
|------------|--------|
| `isAxiosError` from axios | Available — ships with axios 1.x |
| `queryKeys` factory import | Already imported in relevant files |
| Tailwind CSS classes used in a11y fixes | No new classes needed — only adding ARIA attributes |
