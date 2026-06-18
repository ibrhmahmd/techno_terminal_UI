# Research: Student & Group Combobox UI/UX Redesign & Performance Optimization

This document consolidation decisions and rationales for the combobox optimization feature.

## Decisions & Rationales

### 1. DOM Chunking / Progressive Rendering
- **Decision**: Implement a custom scroll-listener inside `SpyCombobox` that appends 40 items when scroll position gets within 100px of the list viewport bottom.
- **Rationale**: Keeps initial rendering load extremely small, ensuring 60fps responsiveness during rapid search typing. Avoids external virtualization library dependencies that might conflict with React 19.
- **Alternatives Considered**: 
  - `react-window` / `react-virtualized`: Rejected due to peer dependency warnings on React 19 and complexity of dynamic item heights.
  - Pure pagination: Rejected because infinite scrolling provides a better UX for dropdown selection.

### 2. Component-Level Input Debouncing
- **Decision**: Encapsulate the debouncing timer (250ms) inside `SpyCombobox` via an internal `inputValue` state and `useEffect` timer. Sync `inputValue` with the parent's `search` prop only when `search` changes from the outside.
- **Rationale**: Guarantees all search selectors (students, groups, instructors, parents) are protected from API flooding by default, preventing developer oversight bugs like in `CreateReceiptPanel.tsx`.
- **Alternatives Considered**: 
  - Retaining parent-level debouncing: Rejected because it duplicates boilerplate code across multiple pages and is error-prone.

### 3. Local Storage Privacy & Key Structure
- **Decision**: Save recently selected items (up to 5 per list type) in `localStorage` under `techno_terminal_recent_students`, `_groups`, and `_instructors`. Persist only `{ id, name }` objects to prevent leaking PII.
- **Rationale**: Compliance with standard data privacy guidelines. Names are safe to store locally, whereas contact details (phone numbers) must not be stored in unencrypted browser storage.
- **Alternatives Considered**: 
  - Store full objects: Rejected due to PII leak risks.
  - Store only IDs: Rejected because resolving IDs on every focus triggers redundant API requests.

### 4. Group Dropdown Initial List Behavior
- **Decision**: Match the student dropdown exactly: show nothing on focus unless recently used groups are present, and require typing to search.
- **Rationale**: Standardizes user interaction patterns across the application, lowering cognitive load and creating a consistent user experience.

### 5. Outstanding Balance Warning
- **Decision**: Render a small orange warning icon (Material Symbols warning icon or Lucide warning) next to the student's name inside `StudentCombobox` if `has_unpaid_balance` is true.
- **Rationale**: Highly visible indicator for finance workflows (like Create Receipt) without breaking the clean typography of the list card.
