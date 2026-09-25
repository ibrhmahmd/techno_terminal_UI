# Spec: Student & Group Combobox UI/UX Redesign & Performance Optimization

**Spec ID**: `048-combobox-ui-ux-performance`  
**Date**: 2026-06-18  
**Status**: Proposal  

---

## Feature Description

This feature addresses UX and performance limitations in the search and selection selectors (`SpyCombobox`, `StudentCombobox`, `GroupCombobox`, `InstructorCombobox`, and `StudentMultiSelector`). 

When data volumes are large, these components suffer from DOM rendering lag (due to lack of list virtualization or progressive chunking), high scroll overhead (due to unthrottled DOM queries in scrollspy logic), API request flooding (due to lack of debouncing in several key parent components), and poor empty-state usability (showing a blank screen instructing the user to "Type at least 2 characters").

This spec details a redesigned, responsive, debounced, and progressively-rendered combobox system.

---

## Clarifications

### Session 2026-06-18
- Q: What should be displayed in the empty state of `StudentCombobox`? → A: Keep the blank state but list the last 5 recently selected students (persisted in local storage).
- Q: Should we keep the dual-pane category list layout on desktop or migrate to a single-column layout? → A: Keep the dual-pane category list layout on desktop (min-width: 640px) and use a single-column layout on mobile.
- Q: Should we store full student records or only IDs and Names in local storage to prevent PII leakage? → A: Store only ID and Name in local storage (exclude phone numbers and other PII).
- Q: Should `StudentCombobox` display a visual indicator for students who have outstanding unpaid balances? → A: Yes, show a subtle warning icon next to the student's name if `has_unpaid_balance` is true.
- Q: Should the `GroupCombobox` display all groups on focus, or match `StudentCombobox` behavior? → A: Match the student dropdown exactly: show nothing on focus unless recently used groups are present, and require typing to search.

---

## User Stories

### US1: Performance Optimization & Progressive DOM Rendering
- **High (P1)**: Implement scroll-triggered progressive rendering inside `SpyCombobox`. Initially, render only the first 40 matching items. As the user scrolls near the bottom of the viewport, append another 40 items. This avoids mounting hundreds of DOM nodes on keypress and during list browsing.
- **High (P1)**: Throttle the scrollspy scroll handler (e.g., limit checks to once every 100ms) to prevent excessive browser reflows caused by `querySelectorAll` and `getBoundingClientRect`.
- **Medium (P2)**: Optimize the keyboard navigation scroll behavior to target `{ block: 'nearest' }` relative to the list container, avoiding jarring page-level layout shifts.

### US2: Built-in Component-Level Debouncing
- **High (P1)**: Move text-input debouncing from parent components into the combobox input wrapper. `SpyCombobox` will manage its own local immediate typing state and fire a debounced `onSearchChange` after 250ms of typing inactivity.
- **High (P1)**: Eliminate keystroke API flooding in `CreateReceiptPanel.tsx` and `InstructorCombobox.tsx` by leveraging the new built-in debounced callbacks.
- **Medium (P2)**: Refactor and clean up manual debouncing boilerplate in `EnrollPanel.tsx`, `TeamDetailPage.tsx`, and other pages to use the simplified combobox interfaces.

### US3: Interactive Browse Mode (Empty Search State)
- **High (P1)**: Keep all comboboxes (Student, Group, Instructor) blank on focus by default, showing only the last 5 recently selected items of that type at the top of the list if present.
- **Medium (P2)**: Store recently selected items (up to 5) in local storage, persisting only their ID and Name (no phone numbers or sensitive PII) to prevent data leakage in shared browser environments.
- **Medium (P2)**: Support local filtering for 1-character search terms, only hitting the backend API when the search term length reaches 2 or more characters.
- **Medium (P2)**: Student dropdown items display a subtle warning icon next to the student's name if `has_unpaid_balance` is true.

### US4: Mobile-Responsive Layout Refactoring
- **High (P1)**: Keep the dual-pane category list layout on desktop screens (`min-width: 640px`).
- **High (P1)**: For small screen viewports (`< 640px`), hide the left category list sidebar and present a single-column layout with inline sticky category headers.
- **Medium (P2)**: Style the dropdown container to scale correctly within mobile screen boundaries (max-width/min-width constraints) to prevent off-screen overflow.

---

## Out of Scope
- Creating new API endpoints on the backend.
- Modifying backend filters or database schemas.
- Virtualization of parent page lists (handled separately).
