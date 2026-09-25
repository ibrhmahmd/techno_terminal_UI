# Quickstart: Attendance Grid Audit Fix

Instructions for running, verifying, and testing the attendance grid audit fix.

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *Proxies `/api` → `http://0.0.0.0:8000` (backend).*

3. Open `http://localhost:5173/` and log in.

---

## Verification Checklist

### Phase 1: Critical Bug Fixes

**Stale closure — save clears footer**:
1. Navigate to a group's attendance tab
2. Toggle 2-3 student attendance cells
3. Add a session note
4. Click "Save Changes"
5. ✅ Footer hides after save completes (previously stayed visible)

**Stale closure — retry clears footer**:
1. Simulate a failed save (disconnect network, toggle a cell, save)
2. Reconnect network
3. Click the retry button for the failed session
4. ✅ Footer hides after retry succeeds (previously stayed visible)

**Cache invalidation — retry updates views**:
1. Save attendance, note a failed session
2. Retry the failed session
3. Navigate to the dashboard
4. ✅ Dashboard shows updated attendance data (previously showed stale data)

**Cache invalidation — mobile saves both caches**:
1. Open a group on mobile viewport
2. Tap a session, mark attendance, tap "Save"
3. Switch to desktop view
4. ✅ Group detail page shows updated data (previously only dashboard updated)

---

### Phase 2: Accessibility

**Icon aria-hidden**:
1. Run axe-core browser extension on the attendance grid page
2. ✅ Zero "icon-no-hidden" violations (previously 20+)

**Button labels**:
1. Tab to the back and close buttons on the mobile attendance sheet
2. ✅ Screen reader announces "Back to sessions" and "Close attendance sheet" (previously "button")

**Toggle switch**:
1. Tab to the substitute instructor toggle in Edit Session popup
2. ✅ Screen reader announces "Substitute Instructor, switch, on/off" (previously just "button")

**Escape key on bottom sheet**:
1. Open mobile attendance sheet
2. Press Escape
3. ✅ Sheet closes (previously no keyboard dismiss)

**Focus-visible**:
1. Tab through all form inputs and buttons in the attendance grid
2. ✅ Focus ring visible on keyboard navigation
3. Click any input with mouse
4. ✅ No focus ring on mouse click (previously showed on both)

**Reduced motion**:
1. Enable `prefers-reduced-motion: reduce` in browser dev tools
2. Navigate through attendance pages
3. ✅ All animations disabled — no spinners, no fade-ins, no blur effects

---

### Phase 3: React Performance

**Memoization**:
1. Open React DevTools Profiler
2. Record a session while toggling one attendance cell
3. ✅ Only the toggled cell re-renders (previously all 300+ cells re-rendered)

**Callback stability**:
1. Add `console.log` to `handleToggle`
2. Toggle a cell
3. ✅ Callback identity stable — no new function reference on toggle

---

### Phase 4: Architecture & TypeScript

**Build passes**:
```bash
npm run build
```
✅ `tsc -b && vite build` succeeds with zero errors

**Lint passes**:
```bash
npm run lint
```
✅ Zero warnings for attendance files

**No cross-feature imports**:
1. Check `EditSessionPopup.tsx` imports
2. ✅ No direct imports from `api/hr/` — uses `useEmployees` hook

**No inline query keys**:
1. Grep attendance files for `\[.*'`.*\]` pattern
2. ✅ All query keys use `queryKeys` factory

**Dead code removed**:
1. Grep for `isLoading` in `AttendanceGridProps`
2. Grep for `hasError` in `AttendanceFooterProps`
3. Grep for `attendanceTimeoutRef`, `fetchCycleRef`
4. ✅ All removed

---

### Phase 5: UI Polish

**Contrast**:
1. Check loading/empty state text color
2. ✅ Uses `text-on-surface-variant` (previously `text-outline-variant`)

**Backdrop**:
1. Open mobile attendance sheet
2. ✅ Backdrop is `bg-black/60` (previously `bg-slate-900/60`)

**Table borders**:
1. Inspect attendance grid table borders
2. ✅ Borders use `border-outline-variant/20` (previously `border-2 border-slate-400`)

---

## Build Commands

```bash
npm run build          # Must pass — tsc -b && vite build
npm run lint           # Must pass — zero errors
npm run test           # Run existing tests (attendance has no tests yet)
npm run dev            # Start dev server for manual testing
```
