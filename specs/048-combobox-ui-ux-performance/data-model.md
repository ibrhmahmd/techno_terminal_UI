# Data Model: Student & Group Combobox UI/UX Redesign

This document describes the key data models and type contracts introduced or modified for this feature.

## Data Structures

### 1. Recent Selection (Stored in `localStorage`)

To support browse mode when the input is empty while protecting PII, recently selected students, groups, and instructors are saved as minimal objects.

```typescript
export interface RecentItem {
  id: number | string;
  name: string; // Resolves to student.full_name, group.name, or employee.full_name
}
```

- **LocalStorage Keys**:
  - Students: `techno_recent_students`
  - Groups: `techno_recent_groups`
  - Instructors: `techno_recent_instructors`

### 2. Category Struct for SpyCombobox

Categories are used to group items and drive the sidebar scrollspy menu.

```typescript
export interface SpyCategory<T> {
  id: string;          // Unique identifier (e.g. course name, letter prefix)
  title: string;       // Display header text
  icon?: string;       // Material Symbol icon identifier (e.g., 'sort_by_alpha', 'warning')
  items: T[];          // Array of generic items in this category
  isSpecial?: boolean; // If true, skipped in scrollspy sidebar (e.g., "Recently Used" section)
}
```

### 3. Component Prop Contracts

#### SpyCombobox Props

```typescript
export interface SpyComboboxProps<T> {
  search: string;                              // Current debounced search state from parent
  onSearchChange: (val: string) => void;       // Debounced callback when input value changes
  placeholder?: string;
  isLoading?: boolean;
  noResultsText?: string;
  modes?: readonly string[];
  activeMode?: string;
  onModeChange?: (mode: string) => void;
  categories: SpyCategory<T>[];
  totalItemsCount: number;
  renderItem: (item: T, isHighlighted: boolean, index: number) => React.ReactNode;
  renderCategoryHeader?: (category: SpyCategory<T>) => React.ReactNode;
  onSelect: (item: T) => void;
}
```
*Note: The props are backwards-compatible, but the component internalizes input handling and debouncing.*
