# Research: Student Multi-Selector for Team Registration

## Decision: Multi-Select Pattern — Chips + Search Dropdown

**Rationale**: The existing `StudentCombobox` uses single-select with `SpyCombobox`. For multi-select, the best pattern is a search dropdown that adds selected students as removable chips below the search field. This avoids the complexity of multi-select checkboxes in a dropdown while keeping the UX clear and familiar.

**Alternatives considered**: 
- Multi-select dropdown with checkboxes — rejected because it's harder to see who's selected without opening the dropdown
- Drag-and-drop from a list — rejected as over-engineered for this use case
- Tag input with typeahead — adopted as the chip-based pattern

## Decision: Reuse SpyCombobox Infrastructure

**Rationale**: The `SpyCombobox` already handles search input, keyboard navigation, category grouping, loading states, and empty states. The `StudentMultiSelector` can use `SpyCombobox` for the search/results portion and layer multi-selection on top with a separate selected-chips area.

**Alternatives considered**:
- Build a standalone combobox from scratch — rejected because `SpyCombobox` already exists and is used elsewhere
- Fork `StudentCombobox` for multi-select — rejected because the single-select and multi-select patterns differ significantly in state management

## Decision: Direct API Call (Not React Query)

**Rationale**: The existing `searchStudents` function makes a direct Axios call (not wrapped in React Query). The `StudentCombobox` already uses this pattern with local `useState` for search results. The `StudentMultiSelector` should follow the same pattern — search is ephemeral, doesn't benefit from caching, and React Query would add unnecessary complexity for a type-ahead field.

## Decision: Per-Student Fee Input Inside Selected Chips

**Rationale**: Each selected student chip includes an inline fee input. This keeps the fee contextually attached to the student. Empty fee fields are omitted from the `student_fees` payload (backend defaults to 0).

**Alternatives considered**:
- Separate fee table below the selector — rejected because it decouples fees from students visually
- Single "apply fee to all" input — rejected because the API supports per-student variation

## Decision: No "Already Enrolled" Filtering

**Rationale**: The `searchStudents` API doesn't filter by competition membership. Adding this would require a separate API call or backend change. Instead, the 409 conflict error from `POST /teams` will be displayed inline after submission, telling the admin which student is already enrolled.

**Alternatives considered**:
- Pre-fetch all students already in teams for this competition — rejected as an extra API call with marginal UX benefit
- Backend adds `is_enrolled_in_competition` flag to search results — rejected as a backend change outside this feature's scope
