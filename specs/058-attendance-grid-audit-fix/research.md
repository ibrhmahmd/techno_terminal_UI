# Research Report: Attendance Grid Audit Fix

Investigation of React performance patterns, accessibility requirements, and stale closure semantics for the attendance grid audit fix.

## Findings & System Context

### 1. Stale Closure Patterns

The attendance grid has two stale closure bugs that prevent the save/cancel footer from hiding after a successful save.

**Bug 1 — `handleSaveAll` (AttendanceGrid.tsx:400)**:
- `dirtyNotes.size` is read inside `handleSaveAll` after `setDirtyNotes(new Map())` runs
- Because `setDirtyNotes` is async (React batching), the `dirtyNotes` variable captured in the closure still holds the pre-update Map
- `hasChanges` is computed as `pendingChanges.size > 0 || dirtyNotes.size > 0` — both read stale values
- **Fix**: Compute `hasChanges` from the results array (count failed vs total) rather than from state variables, or use `useEffect` watching the state variables after they settle

**Bug 2 — `handleRetrySession` (AttendanceGrid.tsx:453)**:
- `pendingChanges.size` is read before `setPendingChanges(newMap)` completes
- Same stale closure pattern — `hasChanges` never clears on single-retry
- **Fix**: Use functional updater `setPendingChanges(prev => { const next = new Map(prev); next.delete(sessionId); return next; })` then compute `hasChanges` from the new state via `queueMicrotask` or `useEffect`

**Research insight**: The React docs recommend computing derived state from the result of state updates, not from the state variables captured in the same closure. `queueMicrotask` ensures the computation runs after React flushes the batched updates.

---

### 2. React.memo and Callback Stability

**Current state**: `AttendanceCell` and `StudentInfo` are not wrapped in `React.memo`. They receive props from `AttendanceTableBody`, which re-renders on every toggle because `handleToggle` recreates (depends on `[students]`).

**Performance impact**:
- Grid has ~30 students × ~10 sessions = ~300 cells
- Each toggle changes `students` state → `handleToggle` recreates → `AttendanceTableBody` re-renders → all 300 cells re-render
- With `React.memo`, only the toggled cell re-renders (status prop changes)

**`React.memo` pattern**:
```tsx
const AttendanceCell = React.memo(function AttendanceCell({ status, onToggle, disabled }) {
  // ...
})
```

**Callback stability**:
- `handleToggle` currently depends on `[students]` — recreates on every toggle
- Fix: Use functional state updates `setStudents(prev => prev.map(...))` — no dependency on `students`
- This stabilizes the callback identity, so `React.memo` on child components actually works

**Inline function elimination**:
- `AttendanceTableBody` passes `onToggle={() => onToggle(student.id, session.id)}` per cell
- 300+ inline arrow functions created per render
- Fix: Pass `studentId` and `sessionId` as separate props to `AttendanceCell`, let the cell call `onToggle(studentId, sessionId)` directly — no closure needed

---

### 3. Component-inside-component Pattern

**`renderTimeGrid` in EditSessionPopup.tsx:123**:
- JSX-returning function defined inside the component body
- Recreated every render, called twice (conditional rendering)
- Creates new component identity each render → React unmounts/remounts the entire subtree

**Fix**: Extract to standalone `TimeGridSelector` component file. Pass `value`, `onChange`, `label` as props. Component identity stays stable across renders.

---

### 4. Accessibility Requirements

**ARIA semantics needed**:

| Element | Current | Required |
|---------|---------|----------|
| Material Symbols icons | No `aria-hidden` | `aria-hidden="true"` on all decorative icons |
| Icon-only buttons (back, close) | No accessible name | `aria-label="Back to sessions"`, `aria-label="Close attendance sheet"` |
| Toggle switch (substitute instructor) | Plain `<button>` | `role="switch"`, `aria-checked`, `aria-label="Substitute Instructor"` |
| Data table | No table semantics | `aria-label="Student attendance"` or `<caption>`, `scope="col"` on headers |
| Loading states | Visual only | `aria-live="polite"` to announce loading completion |
| Form inputs | Some missing labels | `htmlFor`/`id` pairs for programmatic label association |

**Keyboard navigation**:
- Bottom sheet needs Escape key handler to dismiss
- Focus trap: when sheet is open, Tab cycles within the sheet (not behind it)
- `requestAnimationFrame` + `focus()` for initial focus on sheet open

**Focus-visible pattern**:
- Replace `focus:ring-secondary/30` with `focus-visible:ring-2 focus-visible:ring-secondary/50`
- `focus-visible` only shows ring on keyboard navigation, not mouse clicks
- Ring opacity 50% meets WCAG 2.4.13 Focus Appearance (≥3:1 contrast against adjacent colors)

---

### 5. Reduced Motion Support

**WCAG 2.3.3 (Level AAA)**: Respect `prefers-reduced-motion: reduce`.

**Tailwind pattern**: Add `motion-reduce:animate-none` alongside every `animate-*` utility.

**Affected animations in attendance components**:
- `animate-spin` on loading spinners → `motion-reduce:animate-none`
- `animate-fade-in` on loading states → `motion-reduce:animate-none`
- `transition-all` on hover/focus states → `motion-reduce:transition-none`
- `blur-[1px]` on cancelled sessions → `motion-reduce:blur-none`

---

### 6. Cache Invalidation Pattern

**Correct pattern** (from AGENTS.md Section 8):
```ts
if (selectedDate) {
  await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
}
await qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
await refetchData()
```

**Missing in current code**:
- `handleRetrySession`: Never invalidates any caches after successful retry
- `AttendanceMobileSheet`: Only invalidates `dashboard.overview`, not `groupAttendance`

**Parallel invalidation** (FR-2): Use `Promise.all` for independent queries:
```ts
await Promise.all([
  qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) }),
  qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, levelNumber) }),
])
```

---

## Decisions & Rationale

### Decision 1: Compute hasChanges from Results, Not State
- **Alternative**: Use `queueMicrotask` to read state after flush
- **Rejected because**: Brittle — depends on React batching timing. Computing from results array is deterministic.
- **Chosen approach**: After `handleSaveAll`, compute `hasChanges` from the `results` array (count failures). After `handleRetrySession`, use functional updater and recompute from new pending map.

### Decision 2: Extract TimeGridSelector as Separate Component
- **Alternative**: Wrap `renderTimeGrid` in `useCallback`
- **Rejected because**: `useCallback` prevents recreation but the function still returns JSX — React treats it as a render function, not a component. Extraction gives proper component identity and memoization.
- **Chosen approach**: New file `src/components/attendance/TimeGridSelector.tsx` with stable component identity.

### Decision 3: Pass IDs to AttendanceCell Instead of Closures
- **Alternative**: Use `useCallback` with stable dependency array
- **Rejected because**: Even with `useCallback`, the inline arrow `() => onToggle(studentId, sessionId)` creates a new function reference per cell per render.
- **Chosen approach**: `AttendanceCell` receives `studentId`, `sessionId`, and `onToggle(id, id)` as props — calls directly, no closure wrapper needed.

### Decision 4: Escape Key and Focus Trap for Bottom Sheet
- **Alternative**: Only dismiss on backdrop click
- **Rejected because**: Fails WCAG 2.1.2 (Keyboard) — keyboard-only users cannot dismiss the sheet.
- **Chosen approach**: Add `useEffect` with `keydown` listener for Escape. Use `focus-trap-react` or manual `Tab` key interception for focus containment.
