# Feature Audit Report: Tasks Page
Generated: 2026-07-11 | Phases: bug, dead-code, ts-quality, data-fetch, a11y-ux, react-perf, arch-compliance, ui-polish | Mode: standard

## Severity Heatmap
🟥 Critical: 0   🟧 High: 16   🟨 Medium: 28   🟩 Low: 14

## Breakdown by Phase
| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Bug | 0 | 0 | 4 | 2 | 6 |
| Dead Code | 0 | 1 | 1 | 2 | 4 |
| TS Quality | 0 | 0 | 2 | 4 | 6 |
| Data Fetch | 0 | 0 | 0 | 2 | 2 |
| A11y/UX | 0 | 8 | 12 | 4 | 24 |
| React Perf | 0 | 0 | 5 | 4 | 9 |
| Arch Compliance | 0 | 0 | 0 | 0 | 0 |
| UI Polish | 0 | 3 | 5 | 0 | 8 |
| **Total** | **0** | **12** | **29** | **18** | **59** |

## Top Findings (High)

### 🟧 A11y: TaskDetailDrawer.tsx:69 — Tab ARIA roles missing
**Rule**: `tab-aria-roles` | **Risk**: breaking
**Before**: `<div className="flex border-b border-slate-200 px-6">` with plain `<button>` children
**After**: `<div role="tablist">` with `<button role="tab" aria-selected={...} aria-controls={...}>`
**Context**: Three tab buttons (overview/subtasks/activity) have no ARIA roles. Screen readers cannot identify the tab interface.

### 🟧 A11y: CreateTaskModal.tsx:79 — Modal focus trap missing
**Rule**: `modal-focus-trap` | **Risk**: breaking
**Before**: No useEffect for focus management, no Escape handler
**After**: useRef for container, useEffect to focus first input, Tab trap, Escape handler, focus return on close
**Context**: Users can Tab into background content while modal is open.

### 🟧 A11y: CreateTaskModal.tsx:79 — Backdrop click broken
**Rule**: `modal-backdrop-click` | **Risk**: breaking
**Before**: Backdrop z-50 and modal wrapper z-50 share same z-index; wrapper intercepts clicks
**After**: Add `onClick={(e) => e.stopPropagation()}` on inner modal card, or separate z-indices
**Context**: Clicking outside the card hits the wrapper div, not the backdrop.

### 🟧 A11y: TaskDetailDrawer.tsx:35 — Drawer focus trap missing
**Rule**: `drawer-focus-trap` | **Risk**: breaking
**Before**: No useEffect, no onKeyDown, no focus management
**After**: Focus first element on open, Escape handler, Tab trap, focus return on close
**Context**: Focus stays on page body when drawer opens.

### 🟧 A11y: SubtaskChecklist.tsx:52 — Checkbox aria-checked missing
**Rule**: `checkbox-aria-checked` | **Risk**: breaking
**Before**: `<button onClick={...}>` with visual-only state indication
**After**: `<button role="checkbox" aria-checked={subtask.is_done} aria-label={...}>`
**Context**: Screen readers cannot determine checked/unchecked state.

### 🟧 A11y: SubtaskChecklist.tsx:39 — Progress bar ARIA missing
**Rule**: `progressbar-aria` | **Risk**: breaking
**Before**: Plain `<div>` with width% styling
**After**: `role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={...}`
**Context**: No screen reader announcement of subtask completion progress.

### 🟧 A11y: TaskListTable.tsx:35 — Clickable row keyboard support
**Rule**: `clickable-row-keyboard` | **Risk**: breaking
**Before**: `<tr onClick={...}>` with no onKeyDown, tabIndex, or role
**After**: Add `role="button" tabIndex={0} onKeyDown={(e) => Enter/Space handler}`
**Context**: Keyboard users cannot open task details.

### 🟧 A11y: CommentsFeed.tsx:56 — Delete button no accessible name
**Rule**: `button-accessible-name` | **Risk**: moderate
**Before**: Icon-only button with no aria-label
**After**: `aria-label="Delete comment"` + `aria-hidden="true"` on icon
**Context**: Screen readers announce nothing for the delete button.

### 🟧 A11y: SubtaskChecklist.tsx:68 — Delete button no accessible name
**Rule**: `button-accessible-name` | **Risk**: moderate
**Before**: Icon-only button with no aria-label
**After**: `aria-label="Delete subtask: {title}"` + `aria-hidden="true"` on icon
**Context**: Same pattern as CommentsFeed.

### 🟧 UI-Polish: TaskListTable.tsx:35 — Semantic interactive element
**Rule**: `semantic-interactive-element` | **Risk**: breaking
**Before**: `<tr onClick={...}>` — not a native interactive element
**After**: Add role="button", tabIndex={0}, onKeyDown, focus-visible styles
**Context**: Overlaps with a11y clickable-row-keyboard finding.

### 🟧 UI-Polish: CreateTaskModal.tsx:79 — Semantic interactive backdrop
**Rule**: `semantic-interactive-backdrop` | **Risk**: breaking
**Before**: `<div onClick={onClose} />` — not keyboard-accessible
**After**: Add role="button", tabIndex={0}, onKeyDown for Escape
**Context**: Modal backdrop not dismissible via keyboard.

### 🟧 UI-Polish: TaskDetailDrawer.tsx:38 — Semantic interactive backdrop
**Rule**: `semantic-interactive-backdrop` | **Risk**: breaking
**Before**: `<div onClick={onClose} />` — not keyboard-accessible
**After**: Add role="button", tabIndex={0}, onKeyDown for Escape
**Context**: Drawer backdrop not dismissible via keyboard.

### 🟧 UI-Polish: CreateTaskModal.tsx:79 — z-index stacking conflict
**Rule**: `z-index-stacking-conflict` | **Risk**: moderate
**Before**: Backdrop z-50, modal container z-50
**After**: Backdrop z-[55], modal container z-[60]
**Context**: CreateTaskModal can open while TaskDetailDrawer (z-50) is open.

### 🟧 Dead Code: useTasks.ts:54 — useDeleteTask unused
**Rule**: `unused-export` | **Risk**: safe
**Before**: `export function useDeleteTask() { ... }`
**After**: Remove entirely — zero consumers across codebase
**Context**: Hook is exported but never imported by any component.

### 🟧 A11y: CommentsFeed.tsx:58 — opacity-0 keyboard trap
**Rule**: `opacity-hidden-keyboard` | **Risk**: moderate
**Before**: `opacity-0 group-hover:opacity-100`
**After**: `opacity-0 group-hover:opacity-100 focus-visible:opacity-100`
**Context**: Keyboard users Tab into invisible delete button.

### 🟧 A11y: SubtaskChecklist.tsx:70 — opacity-0 keyboard trap
**Rule**: `opacity-hidden-keyboard` | **Risk**: moderate
**Before**: `opacity-0 group-hover:opacity-100`
**After**: `opacity-0 group-hover:opacity-100 focus-visible:opacity-100`
**Context**: Same pattern as CommentsFeed.

## File-by-File Summary
| File | Bug | DeadCode | TS | Fetch | A11y | Perf | Arch | UI | Score |
|------|-----|----------|----|-------|------|------|------|----|-------|
| TaskDetailDrawer.tsx | 1 | 0 | 0 | 0 | 4 | 2 | 0 | 2 | 🟧 9 |
| CreateTaskModal.tsx | 2 | 0 | 0 | 0 | 4 | 1 | 0 | 3 | 🟧 10 |
| SubtaskChecklist.tsx | 1 | 0 | 0 | 0 | 4 | 0 | 0 | 2 | 🟧 7 |
| CommentsFeed.tsx | 1 | 0 | 0 | 0 | 3 | 0 | 0 | 1 | 🟨 5 |
| TaskListTable.tsx | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 2 | 🟨 5 |
| TasksPage.tsx | 0 | 0 | 2 | 0 | 2 | 3 | 0 | 1 | 🟨 8 |
| useTasks.ts | 1 | 1 | 2 | 2 | 0 | 0 | 0 | 0 | 🟨 6 |
| TimeLogPanel.tsx | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 🟨 3 |
| tasks.ts (API) | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 1 |
| types.ts | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 2 |
| index.ts (barrel) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 0 |
| TaskPriorityBadge.tsx | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 🟩 1 |
| TaskStatusBadge.tsx | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 🟩 1 |

Score legend:
- 🟩 0-2 findings — Clean
- 🟨 3-5 findings — Needs attention
- 🟧 6-10 findings — Needs significant work
- 🟥 10+ findings — Needs rewrite

## Architecture Compliance
- ✅ Component naming: All 8 components follow `{Domain}{Suffix}` pattern
- ✅ Directory structure: All files in correct directories
- ✅ Route guard: TasksPage wrapped in ProtectedRoute → InstructorBlockedRoute → AppLayout
- ✅ No direct API calls in pages
- ✅ No cross-feature domain imports (TopNavbar in dashboard/ is a systemic issue, not tasks-specific)
