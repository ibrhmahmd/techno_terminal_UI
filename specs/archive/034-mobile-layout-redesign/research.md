# Research: Mobile Layout Redesign (034)

**Date**: 2026-06-04  
**Feature**: `specs/034-mobile-layout-redesign`

---

## 1. Existing Mobile Foundation Audit

### Decision: Extend existing components rather than rebuild

**Rationale**: The previous conversation already scaffolded the core mobile shell. The following are already implemented and partially working:

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| AppLayout | `src/components/layout/AppLayout.tsx` | ✅ Ready | `ml-0 lg:ml-64`, `pb-16 lg:pb-0` — correct breakpoints |
| BottomNav | `src/components/layout/BottomNav.tsx` | ✅ Ready | 4 tabs + More, teal active indicator, `lg:hidden` |
| MobileNavSheet | `src/components/layout/MobileNavSheet.tsx` | ✅ Ready | Slide-up sheet, 3-col icon grid, role-filtering, user info + logout |
| Sidebar | `src/components/layout/Sidebar.tsx` | ⚠️ Bug | References `onClose` prop that doesn't exist in its interface (line 90) — dead code from a refactor. Must fix. |

**Alternatives considered**: Rebuilding from scratch — rejected because the scaffold is correct and solid.

---

## 2. Breakpoint Strategy

### Decision: `lg` (1024px) as the single mobile/desktop breakpoint

**Rationale**: The existing codebase already uses `lg:` consistently (`hidden lg:flex`, `lg:ml-64`, `lg:hidden`, `lg:pb-0`). No new breakpoint needed.

- `< 1024px` → mobile (BottomNav, mobile dashboard)
- `≥ 1024px` → desktop (Sidebar, full AttendanceGrid)

**Alternatives considered**: `md` (768px) — rejected because Tailwind's `md` is 768px which would affect iPad landscape incorrectly. `lg` matches the existing pattern.

---

## 3. Dashboard Agenda Feed

### Decision: Conditional render in `DashboardPage` using a `useIsMobile` hook

**Rationale**: The cleanest approach is to detect screen width via a `useIsMobile()` hook (using `window.matchMedia('(max-width: 1023px)')` with a `resize` listener) and conditionally render either:
- `<MobileGroupCard>` feed + FAB (mobile)  
- `<GroupSessionCard>` (AttendanceGrid table) (desktop — unchanged)

This keeps `DashboardPage.tsx` as the single source of truth without duplicating routing.

**Alternatives considered**:
1. CSS-only hiding — rejected because it would mount the full AttendanceGrid on mobile (performance cost, DOM weight)
2. Separate mobile route — rejected because it duplicates React Query hooks and state

---

## 4. MobileGroupCard Design

### Decision: Summary card with session count, student count, and tap-to-open sheet

Data available from the existing `useDashboard` hook (no new API calls needed):
- `GroupInfoDTO.name`, `course_name`, `student_count` — from `groups` lookup
- `InstructorInfoDTO.name` — from `instructors` lookup  
- `ScheduledGroupDTO.current_level.sessions.length` — session count for selected date
- `ScheduledGroupDTO.today_session` — the specific scheduled session for today

**Alternatives considered**: Fetching group data fresh on mobile — rejected because the dashboard hook already provides everything.

---

## 5. AttendanceMobileSheet

### Decision: Full-screen bottom sheet with 2-step session-first flow

**Step 1 — Session List**: Shows `sessions` array from `ScheduledGroupDTO.current_level.sessions`. Each row shows session number, date, time, instructor, status badge. Cancelled sessions are non-tappable (dim + strikethrough).

**Step 2 — Student List**: Shows `roster` from `ScheduledGroupDTO.roster`. Each row has student name, gender icon, billing status badge, and a toggleable attendance status pill cycling: `null → present → absent → cancelled → null`.

**Save mechanism**: Reuses existing `markAttendance(sessionId, entries)` from `src/api/attendance/`. Same API call as the desktop grid. No new backend endpoints needed.

**Alternatives considered**: Auto-save on each toggle — rejected because the existing desktop model uses explicit batch-save, and consistency avoids confusion.

---

## 6. FAB (Floating Action Button)

### Decision: Single FAB with expand-on-tap mini menu — mobile only

The FAB is positioned `fixed bottom-20 right-4 z-40` (above the bottom nav bar). It contains:
- "Quick Register" → opens existing `StudentForm` modal
- "Create Payment" → navigates to `/finance`

It reuses all existing modal logic from `QuickActionsGrid`. The FAB replaces the `QuickActionsGrid` widget row on mobile; on desktop the grid remains unchanged.

**Alternatives considered**: Move quick actions to the More sheet — rejected because it buries the most common actions too deep.

---

## 7. Mobile Top Bar

### Decision: New `MobileTopBar` component — `lg:hidden`

Shows:
- Left: App name "TechnoTerminal" (bold, `font-headline`)
- Right: Current page title (passed as prop)

The existing `TopNavbar` (breadcrumbs + "New Enrollment" button) stays for desktop. On mobile, `DashboardPage` will conditionally render `MobileTopBar` instead of `TopNavbar`.

**Alternatives considered**: Modify `TopNavbar` to be responsive — rejected because it would add complexity to a component that also serves non-dashboard pages.

---

## 8. Sidebar `onClose` Bug

### Decision: Remove dead `onClose` reference in `Sidebar.tsx`

Line 90 in `Sidebar.tsx` references `onClose` prop but the component interface `SidebarProps {}` is empty. This is a TypeScript error waiting to be flagged. Fix: remove the `<button onClick={onClose}>` (it's `lg:hidden` anyway — never rendered in the current app).

---

## 9. Mobile List Pages (Phase 2 — Directory, Groups)

### Decision: Defer card-view for list pages to a follow-on task

**Rationale**: The spec prioritizes Dashboard and navigation. List pages (`DirectoryPage`, `GroupsPage`) already have some mobile handling (overflow-x-auto, responsive grids). Full card-view transformation is a separate concern that will be its own implementation batch to avoid scope creep.

**Planned approach when implemented**: Add a `useIsMobile()` conditional inside each list page to render a `*MobileCard` component instead of the `DataTable`.
