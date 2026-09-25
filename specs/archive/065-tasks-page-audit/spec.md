# Tasks Page Audit & Fix

## Summary
Audit and fix of the Tasks page feature across 12 user stories covering accessibility, runtime bugs, dead code removal, TypeScript quality, React performance, and UI polish.

**Files affected**: 13 files across `src/components/tasks/`, `src/pages/TasksPage.tsx`, `src/hooks/useTasks.ts`, `src/api/tasks/`

**Findings**: 0 critical, 16 high, 28 medium, 14 low (59 total)

---

## User Stories

### US-1: Fix TaskDetailDrawer tab accessibility
**As a** screen reader user, **I want** the task detail drawer tabs to be properly announced, **so that** I can navigate between Overview/Subtasks/Activity tabs.

**Acceptance Criteria:**
- Tab container has `role="tablist"`
- Each tab button has `role="tab"` and `aria-selected`
- Each tab panel has `role="tabpanel"` and `aria-labelledby`
- Tab buttons have `id` and `aria-controls` linking to panels

**Files**: `src/components/tasks/TaskDetailDrawer.tsx:69-85`

---

### US-2: Fix CreateTaskModal accessibility
**As a** keyboard/screen reader user, **I want** the create task modal to trap focus, respond to Escape, and close on backdrop click, **so that** I can complete the form without getting lost.

**Acceptance Criteria:**
- Focus moves to first input on open
- Tab is trapped within the modal
- Escape key closes the modal
- Backdrop click closes the modal (fix z-index stacking)
- Modal has `role="dialog"` and `aria-modal="true"`
- Modal title has `id` referenced by `aria-labelledby`
- All form labels use `htmlFor`/`id` associations

**Files**: `src/components/tasks/CreateTaskModal.tsx:75-86`

---

### US-3: Fix TaskDetailDrawer focus management
**As a** keyboard user, **I want** the task detail drawer to trap focus and close on Escape, **so that** I can navigate the drawer without losing focus to the background.

**Acceptance Criteria:**
- Focus moves to drawer on open
- Escape key closes the drawer
- Tab is trapped within the drawer
- Focus returns to trigger element on close

**Files**: `src/components/tasks/TaskDetailDrawer.tsx:22-35`

---

### US-4: Fix subtask checkbox accessibility
**As a** screen reader user, **I want** subtask checkboxes to announce their state, **so that** I know which subtasks are complete.

**Acceptance Criteria:**
- Toggle button has `role="checkbox"` and `aria-checked`
- Toggle button has `aria-label` describing the action
- Check icon has `aria-hidden="true"`

**Files**: `src/components/tasks/SubtaskChecklist.tsx:52-63`

---

### US-5: Fix progress bar accessibility
**As a** screen reader user, **I want** the subtask progress bar to announce completion percentage, **so that** I know overall progress without visual inspection.

**Acceptance Criteria:**
- Progress container has `role="progressbar"`
- Has `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Has `aria-label` with human-readable progress text

**Files**: `src/components/tasks/SubtaskChecklist.tsx:39-46`

---

### US-6: Fix clickable table row keyboard support
**As a** keyboard user, **I want** task table rows to be activatable via Enter/Space, **so that** I can open task details without a mouse.

**Acceptance Criteria:**
- `<tr>` has `role="button"` and `tabIndex={0}`
- `onKeyDown` handler for Enter and Space keys
- Focus-visible ring style matches project convention
- Focus-visible styles on all interactive elements (close buttons, tabs)

**Files**: `src/components/tasks/TaskListTable.tsx:35-38`, `src/components/tasks/TaskDetailDrawer.tsx:60-84`, `src/components/tasks/CreateTaskModal.tsx:86`

---

### US-7: Add accessible names to icon-only buttons
**As a** screen reader user, **I want** all icon-only buttons to have accessible labels, **so that** I know what each button does.

**Acceptance Criteria:**
- Close drawer button: `aria-label="Close task detail"`
- Close modal button: `aria-label="Close create task dialog"`
- Delete comment button: `aria-label="Delete comment"`
- Delete subtask button: `aria-label="Delete subtask: {title}"`
- All decorative icons have `aria-hidden="true"`

**Files**: `src/components/tasks/TaskDetailDrawer.tsx:60-65`, `src/components/tasks/CreateTaskModal.tsx:86-88`, `src/components/tasks/CommentsFeed.tsx:56-61`, `src/components/tasks/SubtaskChecklist.tsx:68-73`, `src/pages/TasksPage.tsx:50`, `src/components/tasks/TaskListTable.tsx:15,44`, `src/components/tasks/TimeLogPanel.tsx:46`, `src/components/tasks/SubtaskChecklist.tsx:61`

---

### US-8: Add labels to form inputs
**As a** screen reader user, **I want** all form inputs to have programmatic labels, **so that** I know what each field expects.

**Acceptance Criteria:**
- Status/priority/assignee filter selects have `aria-label`
- Comment input has `aria-label`
- Add subtask input has `aria-label`
- Hours and note inputs in TimeLogPanel have `aria-label`
- CreateTaskModal form labels use `htmlFor`/`id` associations

**Files**: `src/pages/TasksPage.tsx:58-83`, `src/components/tasks/CommentsFeed.tsx:70-76`, `src/components/tasks/SubtaskChecklist.tsx:81-87`, `src/components/tasks/TimeLogPanel.tsx:64-79`, `src/components/tasks/CreateTaskModal.tsx:91-240`

---

### US-9: Fix loading state and heading consistency
**As a** user, **I want** consistent heading fonts and accessible loading states, **so that** the page feels polished and screen readers announce loading.

**Acceptance Criteria:**
- Loading spinner wrapped in `role="status"` with sr-only text
- Loading state uses skeleton placeholders instead of spinner
- Drawer h2 and modal h2 use `font-headline` class
- Loading spinner has `motion-reduce:animate-none`

**Files**: `src/pages/TasksPage.tsx:117-120`, `src/components/tasks/TaskDetailDrawer.tsx:48`, `src/components/tasks/CreateTaskModal.tsx:85`

---

### US-10: Fix motion-safe and contrast issues
**As a** user with reduced motion preferences, **I want** animations to be disabled, **so that** the interface doesn't cause discomfort.

**Acceptance Criteria:**
- Delete buttons: `focus-visible:opacity-100` added alongside `group-hover:opacity-100`
- Progress bar: `motion-reduce:transition-none` added
- Loading spinner: `motion-reduce:animate-none` added
- Timestamps use `text-slate-500` instead of `text-slate-400` (WCAG AA contrast)
- Empty state icon uses `text-slate-400` instead of `text-slate-300`

**Files**: `src/components/tasks/CommentsFeed.tsx:58`, `src/components/tasks/SubtaskChecklist.tsx:41,70`, `src/pages/TasksPage.tsx:119`, `src/components/tasks/CommentsFeed.tsx:51`, `src/components/tasks/TimeLogPanel.tsx:51,55`, `src/components/tasks/TaskListTable.tsx:15,44`

---

### US-11: Fix runtime bugs
**As a** user, **I want** the tasks feature to handle edge cases correctly, **so that** I don't see inconsistent or broken behavior.

**Acceptance Criteria:**
- Overdue styling excludes both `done` and `cancelled` (consistent between table and drawer)
- `estimated_hours` and `recurrence_interval_days` inputs guard against NaN from paste
- `parseInt` calls include radix parameter
- Comment and subtask deletions show confirmation before executing
- Non-null assertion on `id!` replaced with safer pattern

**Files**: `src/components/tasks/TaskDetailDrawer.tsx:131`, `src/components/tasks/CreateTaskModal.tsx:55,59`, `src/components/tasks/CommentsFeed.tsx:25-27`, `src/components/tasks/SubtaskChecklist.tsx:28-30`, `src/hooks/useTasks.ts:28`

---

### US-12: Remove dead code
**As a** developer, **I want** unused code removed, **so that** the codebase stays clean and maintainable.

**Acceptance Criteria:**
- Remove `useDeleteTask` hook (zero consumers)
- Remove `deleteTask` API function (only consumed by dead hook)
- Remove `recurrence_day_of_month` from `CreateTaskInput` and `UpdateTaskInput` (never populated)
- Fix `void taskId` suppressions by not destructuring unused param in mutationFn
- Remove redundant `queryKeys.tasks.detail()` invalidation in `useUpdateTask` (covered by root prefix)

**Files**: `src/hooks/useTasks.ts:54-62,88-90,111-113,47-49`, `src/api/tasks/tasks.ts:40-42`, `src/api/tasks/types.ts:74,90`

---

### US-13: React performance improvements
**As a** user, **I want** the tasks page to render efficiently, **so that** it stays responsive with large task lists.

**Acceptance Criteria:**
- `TaskPriorityBadge` and `TaskStatusBadge` wrapped in `React.memo`
- Tab and status option arrays extracted to module-level constants
- `handleRowClick` wrapped in `useCallback`
- `Date.now()` computed once before table row map instead of per-row `new Date()`
- `tasks ?? []` replaced with stable `EMPTY_TASKS` constant

**Files**: `src/components/tasks/TaskPriorityBadge.tsx:16`, `src/components/tasks/TaskStatusBadge.tsx:16`, `src/components/tasks/TaskDetailDrawer.tsx:70,94`, `src/pages/TasksPage.tsx:30,123`, `src/components/tasks/TaskListTable.tsx:70`

---

### US-14: Fix z-index layering
**As a** user, **I want** modals and drawers to layer correctly, **so that** overlapping panels don't create visual glitches.

**Acceptance Criteria:**
- CreateTaskModal backdrop uses `z-[55]`, modal container uses `z-[60]`
- TaskDetailDrawer backdrop uses `z-40`, drawer uses `z-50` (current, acceptable)
- Modal z-index is higher than drawer to ensure modal appears on top

**Files**: `src/components/tasks/CreateTaskModal.tsx:79,82`

---

## Non-Goals
- Database performance (db-perf phase disabled)
- New feature additions (e.g., wiring up `recurrence_day_of_month` form field)
- Refactoring CreateTaskModal to use `useReducer` (low priority, can be separate PR)
- Moving TopNavbar from `dashboard/` to `layout/` (systemic issue, not tasks-specific)
