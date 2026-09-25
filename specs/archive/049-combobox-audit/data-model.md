# Data Model: Combobox Feature Audit & Fix

**Date**: 2026-06-18  
**Feature**: Combobox Components  
**Branch**: `049-combobox-audit`

---

## Entities

### 1. Shared Hooks (New)

#### useClickOutside
```typescript
interface UseClickOutsideProps {
  ref: RefObject<HTMLElement | null>
  handler: () => void
}
```
- **Purpose**: Detect clicks outside a referenced element
- **Used by**: All combobox components
- **State**: None (effect-only hook)

#### useDropdownPosition
```typescript
interface UseDropdownPositionResult {
  wrapperRef: RefObject<HTMLDivElement | null>
  dropdownAbove: boolean
}
```
- **Purpose**: Calculate dropdown position relative to viewport
- **Used by**: All combobox components
- **State**: dropdownAbove (boolean)

### 2. Existing Entities (No Changes)

#### StudentComboboxProps
```typescript
interface StudentComboboxProps {
  value: StudentListItem | null
  onChange: (student: StudentListItem | null) => void
  search: string
  setSearch: (search: string) => void
  students: StudentListItem[]
  isLoading: boolean
}
```
- **Location**: `src/components/student/StudentCombobox.tsx` (after relocation)
- **Changes**: None to interface

#### GroupComboboxProps
```typescript
interface GroupComboboxProps {
  value: EnrichedGroupPublic | null
  onChange: (group: EnrichedGroupPublic | null) => void
  search: string
  setSearch: (search: string) => void
  excludeGroupIds?: number[]
}
```
- **Location**: `src/components/groups/GroupCombobox.tsx` (after relocation)
- **Changes**: Remove unused props (groups, isLoading, recentGroupIds)

#### InstructorComboboxProps
```typescript
interface InstructorComboboxProps {
  value: EmployeeListItem | null
  onChange: (instructor: EmployeeListItem | null) => void
}
```
- **Location**: `src/components/staff/InstructorCombobox.tsx` (after relocation)
- **Changes**: None to interface

#### SpyComboboxProps<T>
```typescript
interface SpyComboboxProps<T> {
  search: string
  onSearchChange: (val: string) => void
  placeholder?: string
  isLoading?: boolean
  isFetching?: boolean
  noResultsText?: string
  modes?: readonly string[]
  activeMode?: string
  onModeChange?: (mode: string) => void
  categories: SpyCategory<T>[]
  totalItemsCount: number
  renderItem: (item: T, isHighlighted: boolean, index: number) => ReactNode
  renderCategoryHeader?: (category: SpyCategory<T>) => ReactNode
  onSelect: (item: T) => void
}
```
- **Location**: `src/components/common/SpyCombobox.tsx` (stays)
- **Changes**: None to interface

### 3. State Transitions

#### InstructorCombobox Search Flow
```
User types → search state updates → debouncedSearch (300ms) → useEmployees query
                                              ↓
                                   enabled guard (>= 2 chars)
                                              ↓
                                   API response → data state → render results
```

#### Dropdown Position Flow
```
Dropdown opens → measure viewport → calculate spaceBelow
                                         ↓
                              spaceBelow < 350px && top > spaceBelow
                                         ↓
                              dropdownAbove = true/false
```

---

## Relationships

```
SpyCombobox (generic)
    └── Used by: StudentMultiSelector

StudentCombobox
    └── Uses: StudentListItem (api/crm)
    └── Uses: recentCache utility

GroupCombobox
    └── Uses: EnrichedGroupPublic (api/academics)
    └── Uses: useGroupSearch hook
    └── Uses: recentCache utility

InstructorCombobox
    └── Uses: EmployeeListItem (api/hr)
    └── Uses: useEmployees hook
    └── Uses: recentCache utility
```

---

## Validation Rules

### Search Input
- Minimum 2 characters for server-side search
- Debounce: 300ms before API call
- Empty string shows recent items only

### Dropdown Position
- Flip above when: spaceBelow < 350px AND rect.top > spaceBelow
- Otherwise: position below input

### Category Selection
- Auto-select first category if selected category no longer exists
- Reset to first category when search results change

---

## File Locations (After Relocation)

| Entity | Current Location | New Location |
|--------|------------------|--------------|
| StudentCombobox | `src/components/common/combobox/StudentCombobox.tsx` | `src/components/student/StudentCombobox.tsx` |
| GroupCombobox | `src/components/common/combobox/GroupCombobox.tsx` | `src/components/groups/GroupCombobox.tsx` |
| InstructorCombobox | `src/components/common/combobox/InstructorCombobox.tsx` | `src/components/staff/InstructorCombobox.tsx` |
| SpyCombobox | `src/components/common/SpyCombobox.tsx` | `src/components/common/SpyCombobox.tsx` (no change) |
| useClickOutside | N/A (new) | `src/hooks/useClickOutside.ts` |
| useDropdownPosition | N/A (new) | `src/hooks/useDropdownPosition.ts` |
| barrel index | `src/components/common/combobox/index.ts` | `src/components/common/combobox/index.ts` (SpyCombobox only) |
