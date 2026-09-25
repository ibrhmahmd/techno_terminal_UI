# Research: Groups Card Layout

## Unknowns Resolved

### Unknown 1: GroupCard fields
**Decision**: Display exactly the fields from GroupColumns — group_name, course_name, instructor_name, schedule (day + time), capacity (current_student_count / max_capacity), status — plus click-to-navigate and action buttons.

**Rationale**: These are the same fields already shown in the DataTable. No backend changes needed since `EnrichedGroupPublic` already carries all required data.

**Alternatives considered**: Adding more fields (notes, level_number) would clutter the card. The StudentCard precedent shows ~3-4 info fields is appropriate for a card.

### Unknown 2: View toggle placement
**Decision**: Add a toggle integrated into the `GroupBySelector` bar area — a simple pills-style toggle with icons for "Table" and "Cards" modes.

**Rationale**: The GroupBySelector already occupies the horizontal space above the data. Adding a view toggle as the first or last item keeps related controls together. The directory page doesn't have a toggle because it's cards-only, but GroupsPage needs to preserve the existing table view.

**Alternatives considered**: 
- Separate toggle above GroupBySelector — wastes vertical space
- URL param only — hidden from users

### Unknown 3: Grouped card view behavior
**Decision**: In grouped mode with card view, render category tabs (reusing the same dark-themed tab bar pattern from DirectoryPage's grouped view) with cards beneath the active tab.

**Rationale**: The existing DataTable grouped view uses `defaultActiveGroup` prop to show one group at a time. The directory page implemented the same pattern with `StudentCard` in its grouped views. This is a proven pattern.

**Alternatives considered**: 
- Showing all groups in sections with headers — too much scrolling
- Accordion — more complex interaction

### Unknown 4: CardGrid reuse vs new component
**Decision**: Reuse `CardGrid` from `src/components/directory/CardGrid.tsx` directly. It's already a generic responsive grid container.

**Rationale**: The CardGrid component has no directory-specific logic — it's just `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`. Reusing it avoids duplication.

**Alternatives considered**: Creating a groups-specific copy (violates DRY).

### Unknown 5: CardSkeleton reuse
**Decision**: Reuse `CardSkeleton` from `src/components/directory/shared/CardSkeleton.tsx`.

**Rationale**: Same as CardGrid — the skeleton is a generic pulsing placeholder.

### Unknown 6: RowActions reuse
**Decision**: Use `RowActions` from `src/components/common/RowActions.tsx`, already used on StudentCard and ParentCard.

**Rationale**: Already a shared common component. No need for groups-specific action buttons.
