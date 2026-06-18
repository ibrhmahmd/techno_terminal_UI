# Implementation Plan: Student & Group Combobox UI/UX Redesign & Performance Optimization

**Branch**: `048-combobox-ui-ux-performance` | **Date**: 2026-06-18 | **Spec**: [spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/048-combobox-ui-ux-performance/spec.md)
**Input**: Feature specification from `/specs/048-combobox-ui-ux-performance/spec.md`

## Summary

Optimize the performance and usability of search dropdowns (`SpyCombobox`, `StudentCombobox`, `GroupCombobox`, `InstructorCombobox`, and `StudentMultiSelector`). We will implement scroll-triggered progressive DOM rendering (render initial 40, append 40 when scrolled near bottom) to keep DOM footprint small and input lag-free. Debouncing (250ms) will be internalized in `SpyCombobox` to eliminate API flooding across all calling components. In empty/focus states, dropdowns will display the last 5 recently selected items from `localStorage` in a privacy-safe `{ id, name }` shape. On mobile screens (<640px), the left scrollspy sidebar is hidden, presenting a clean single-column list with inline sticky headers.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Rule | Status | Notes |
|------|------|--------|-------|
| I | Frontend-Only Scope | ✅ PASS | All changes live inside `src/`. No backend modifications. |
| II | Server State Discipline | ✅ PASS | Queries use React Query hooks. All mutations invalidate keys. |
| III | Global State Minimalism | ✅ PASS | UI focus states and recent cache are kept in React local state and localStorage. |
| IV | TypeScript Strict Mode | ✅ PASS | Strict types, type guards, and `import type` enforced. |
| V | Component Naming Convention | ✅ PASS | Follows standard component suffix rules. |

## Project Structure

### Documentation (this feature)

```text
specs/048-combobox-ui-ux-performance/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
```

### Source Code

```text
src/
├── components/common/
│   ├── SpyCombobox.tsx        # Internal input debounce, progressive render, responsive layout
│   └── StudentMultiSelector.tsx # Prop compatibility alignment
├── components/common/combobox/
│   ├── index.ts               # Re-exports
│   ├── StudentCombobox.tsx    # Blank empty search, recently selected integration, local 1-char filter
│   ├── GroupCombobox.tsx      # Match student dropdown blank-state, remove 50-slice limit
│   └── InstructorCombobox.tsx  # Match student dropdown blank-state, integrate internal debouncer
├── components/finance/
│   ├── CreateReceiptPanel.tsx # Remove manual search sync and redundant keystroke query triggers
│   └── CreateReceipt/
│       └── ReceiptLineItemRow.tsx # Prop compatibility alignment
├── components/enrollments/
│   ├── EnrollPanel.tsx        # Simplify state, remove duplicate debouncer logic
│   └── DropEnrollmentPanel.tsx # Prop compatibility alignment
└── pages/
    └── TeamDetailPage.tsx     # Clean up manual member/parent search timeout states
```

---

## Proposed Changes

### Core UI Components

#### [MODIFY] [SpyCombobox.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/SpyCombobox.tsx)
- Keep an internal `inputValue` state synced immediately to input change.
- Use `useEffect` with a 250ms timeout to invoke the `onSearchChange` prop (debouncing).
- Add `visibleLimit` state starting at 40. Appending 40 more items on scrolling near bottom.
- Throttle the scrollspy header scanner using a 100ms timer guard to prevent reflow bottlenecks.
- Apply `@media` or tailwind responsive utility classes (`hidden sm:block` for the category sidebar) to hide the left menu on viewports under 640px and scale item columns.

#### [MODIFY] [StudentMultiSelector.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/StudentMultiSelector.tsx)
- Simplify props and pass-through parameters to match the updated `SpyCombobox`.

---

### Combobox Selectors

#### [MODIFY] [StudentCombobox.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/combobox/StudentCombobox.tsx)
- Retrieve recently selected student `{ id, name }` items from `localStorage` (`techno_recent_students`).
- Append selected students to localStorage list on selection (capped at 5).
- If input search query is empty, pass empty categories list, showing only the "Recently Selected" list at the top.
- Perform local filtering on the recent items list if search length is 1. Call query callback only when length >= 2.
- Display a warning triangle icon next to student names if `has_unpaid_balance` is true.

#### [MODIFY] [GroupCombobox.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/combobox/GroupCombobox.tsx)
- Implement matching empty/focus behavior: show nothing on focus unless recently used groups are present, and require typing to search.
- Retrieve/store recently selected groups `{ id, name }` in `localStorage` (`techno_recent_groups`) capped at 5.
- Remove the `.slice(0, 50)` limit since progressive rendering resolves performance issues.

#### [MODIFY] [InstructorCombobox.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/common/combobox/InstructorCombobox.tsx)
- Match student dropdown behavior: show nothing on focus unless recently used instructors are present, and require typing to search.
- Retrieve/store recently selected instructors in `localStorage` (`techno_recent_instructors`) capped at 5.
- Rely on internal `SpyCombobox` debouncing to avoid API spamming.

---

### Parent Forms & Pages

#### [MODIFY] [CreateReceiptPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/finance/CreateReceiptPanel.tsx)
- Remove `activeSearchQuery` state. Let `ReceiptLineItemRow` pass the input query directly to `StudentCombobox`, which debounces internally. This stops immediate keystroke API flooding.

#### [MODIFY] [EnrollPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/enrollments/EnrollPanel.tsx)
- Remove `debouncedStudentSearch` and `useEffect` timer. Pass `studentSearch` and `setStudentSearch` directly to `StudentCombobox`.

#### [MODIFY] [TeamDetailPage.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/pages/TeamDetailPage.tsx)
- Remove `debouncedStudentSearch` timer. Pass state directly to `StudentCombobox`.

---

## Verification Plan

### Automated Tests
- Build and type validation checks:
  ```bash
  npm run lint
  npm run build
  ```

### Manual Verification
- **Keystroke Debouncing**: Type "Ibrahim" quickly in Create Receipt student dropdown. Check network tab to verify only one API call is fired.
- **Progressive DOM Rendering**: Verify that scrolling down the dropdown appends items dynamically in chunks of 40.
- **Privacy-Safe Persistence**: Select a student, clear, then refocus. Verify student is listed under "Recently Used". Verify local storage key stores only `{ id, name }` data.
- **Responsive Layout**: Resize screen to mobile size. Confirm scrollspy category sidebar collapses and displays as a clean single column list.
