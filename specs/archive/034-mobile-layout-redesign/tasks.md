# Tasks: Mobile Layout Redesign (034)

**Input**: Design documents from `specs/034-mobile-layout-redesign/`  
**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md)

**Organization**: Tasks grouped by user story — each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Fix the existing bug and create the shared hook that everything depends on.

- [x] T001 Fix dead `onClose` reference in `src/components/layout/Sidebar.tsx` — remove the `<button onClick={onClose}>` block (lines ~89–94) from the brand header section; the `SidebarProps` interface is empty `{}` so this is a TypeScript error
- [x] T002 Create `src/hooks/useIsMobile.ts` — reactive `window.matchMedia('(max-width: 1023px)')` hook returning `boolean`, with `addEventListener('change')` and cleanup on unmount

**Checkpoint**: Run `npm run build` — must pass with zero errors before proceeding.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Components shared across multiple user stories that must exist before story work begins.

- [x] T003 [P] Create `src/components/layout/MobileTopBar.tsx` — sticky dark header (`h-14 bg-slate-950 border-b border-slate-800 lg:hidden`) with app name ("TechnoTerminal" in `font-headline text-white font-bold`) on the left and `title` prop in `text-teal-400 text-sm font-medium` on the right
- [x] T004 [P] Audit `src/components/layout/BottomNav.tsx` — verify `lg:hidden`, touch targets (`h-16` per tab meets 44px), active teal accent line, and "More" active state when on a non-primary route. Fix any issues found.
- [x] T005 [P] Audit `src/components/layout/MobileNavSheet.tsx` — verify backdrop dismissal, Escape key close, route-change close, role filtering, and `pb-20` on the user row. Fix any issues found.

**Checkpoint**: Foundation ready. User story phases can now proceed.

---

## Phase 3: User Story 1 — Mobile Navigation via Bottom Tab Bar (Priority: P1) 🎯 MVP

**Goal**: On mobile, the sidebar is hidden and the bottom tab bar + More sheet handle all navigation.

**Independent Test**: Resize browser to 390px wide. Sidebar invisible. Bottom nav appears. Tap "Groups" → navigates to `/groups` with that tab active. Tap "More" → sheet slides up with icon grid. Tap "Reports" → navigates to `/reports`, sheet closes.

### Implementation for User Story 1

- [x] T006 [US1] Verify `src/components/layout/AppLayout.tsx` has correct breakpoint classes — `ml-0 lg:ml-64` on main, `pb-16 lg:pb-0` on main, `<BottomNav />` rendered after `<main>`. No changes needed if already correct; document confirmation.
- [x] T007 [US1] Verify `src/components/layout/Sidebar.tsx` has `hidden lg:flex` on the `<aside>` — confirms sidebar is invisible on mobile after T001 fix.

**Checkpoint**: US1 complete — mobile navigation fully functional without touching any page content.

---

## Phase 4: User Story 2 — Agenda-Style Dashboard Feed (Priority: P1)

**Goal**: On mobile, the dashboard renders a clean agenda feed: mobile top bar → sticky day selector → instructor filter pills → scrollable group summary cards → FAB.

**Independent Test**: On 390px viewport, load `/dashboard`. Verify: (1) `MobileTopBar` shows "TechnoTerminal" + "Dashboard", (2) day selector scrolls horizontally, (3) each scheduled group renders as a `MobileGroupCard` (no attendance table visible), (4) FAB is visible above the bottom nav, (5) no horizontal page-body overflow. On 1280px desktop, verify nothing changed.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/components/dashboard/MobileGroupCard.tsx` — card component with props: `groupId`, `groupName`, `courseName`, `instructorName`, `sessionCount`, `studentCount`, `todaySession`, `onOpenAttendance`. Renders: left teal accent bar, group name (`font-headline font-bold`), course name (`text-slate-500 text-sm`), instructor row with `person` icon, bottom info row with session count badge and student count. Full card is tappable (`button` element, min-h `80px`, touch-safe). Active press state: `active:bg-slate-50`. Navigates to group detail via `→` icon (secondary action), opens attendance sheet via full card tap.
- [x] T009 [P] [US2] Create `src/components/dashboard/MobileDashboardFAB.tsx` — fixed FAB (`fixed bottom-20 right-4 z-40`). Closed state: circular `bg-secondary` button with `add` icon. Open state: 2 action pills slide up with `translate-y` + `opacity` CSS transition — "Quick Register" (person_add icon) and "Create Payment" (payment icon). "Quick Register" opens `StudentForm` modal (reuse pattern from `QuickActionsGrid`). "Create Payment" calls `navigate('/finance')`. Tap outside or re-tap FAB collapses. Local `useState(isOpen)`.
- [x] T010 [US2] Modify `src/pages/DashboardPage.tsx` — add `const isMobile = useIsMobile()` at top of component. Add `const [openGroupId, setOpenGroupId] = useState<number | null>(null)` for sheet control. Wrap existing JSX in a desktop `else` branch (identical to current, zero changes). Add mobile branch with: `<MobileTopBar title="Dashboard" />` (outside the `<main>` padding), existing `<DaySelectorBar>` and `<InstructorSelectorBar>` (unchanged), `filteredScheduleItems.map()` rendering `<MobileGroupCard>` instead of `<GroupSessionCard>`, `<MobileDashboardFAB>`. The `<QuickActionsGrid>` is desktop-only (inside the `else` branch).

**Checkpoint**: US2 complete — mobile dashboard agenda feed fully functional. Desktop identical to before.

---

## Phase 5: User Story 3 — Session-First Attendance Marking (Priority: P1)

**Goal**: Tapping a group card on mobile opens a bottom sheet. Step 1 shows the session list. Step 2 shows the student list. Tapping a student toggles their status. Save persists changes.

**Independent Test**: On mobile dashboard, tap any group card with ≥1 session and ≥2 students. Sheet slides up. Session list shows each session's number, date, time, status badge. Tap a scheduled session → student list appears. Tap a student → status cycles (null→present→absent→cancelled→null). Tap Save → toast "Saved successfully", sheet returns to session list. Refresh dashboard → attendance persisted.

### Implementation for User Story 3

- [x] T011 [US3] Create `src/components/attendance/AttendanceMobileSheet.tsx` — full implementation per plan.md Phase D3:
  - Props: `isOpen`, `groupId`, `groupName`, `instructorName`, `sessions`, `roster`, `selectedDate`, `onClose`
  - Local state: `activeStep: 'sessions' | 'students'`, `selectedSession`, `localAttendance: Map<string, AttendanceStatus>`, `pendingEntries: AttendanceEntry[]`, `isSaving`
  - Sheet UX: `fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-white rounded-t-2xl` with backdrop, drag handle, slide-up transition (`translate-y` + `duration-300`)
  - **Step 1 — Session list**: List `sessions` prop. Each row: session number badge (dark square), date, `formatTime(time_start)`, instructor name, status badge. Cancelled rows: dim + strikethrough, not tappable for attendance. Tap row → `setActiveStep('students')` + `setSelectedSession(session)`.
  - **Step 2 — Student list**: Back chevron → `setActiveStep('sessions')`. Session summary row at top. `roster` rendered as rows: gender icon (M/F), full name, billing badge (amber dot if `due`), status pill (green=present, red=absent, slate=cancelled, outline=unmarked). Tap row → cycle `localAttendance` Map entry, push to `pendingEntries`.
  - Save button: disabled when `pendingEntries.length === 0` or `isSaving`. On tap: call `markAttendance(selectedSession.session_id, pendingEntries)` from `src/api/attendance/`, then `qc.invalidateQueries({ queryKey: dashboardKeys.overview(selectedDate) })`, show success toast, reset `pendingEntries`, return to step 1.
  - Error handling: on save failure show error toast, keep `pendingEntries` so user can retry.
- [x] T012 [US3] Wire `AttendanceMobileSheet` into `src/pages/DashboardPage.tsx` — render it inside the mobile branch: `<AttendanceMobileSheet isOpen={openGroupId !== null} groupId={openGroupId ?? 0} sessions={openGroupId ? getGroupData(openGroupId).sessions : []} roster={openGroupId ? getGroupData(openGroupId).roster : []} groupName={openGroupId ? groups[openGroupId]?.name ?? '' : ''} instructorName={...} selectedDate={selectedDate} onClose={() => setOpenGroupId(null)} />`. Ensure `MobileGroupCard.onOpenAttendance` calls `setOpenGroupId(item.group_id)`.

**Checkpoint**: US3 complete — full attendance marking flow works on mobile. No changes visible on desktop.

---

## Phase 6: User Story 4 — Mobile-Adapted Data Tables on List Pages (Priority: P2)

**Goal**: List pages (starting with Directory) render as card stacks on mobile instead of wide tables.

**Independent Test**: On 390px viewport, load `/directory`. Student/parent records render as cards (name, grade/status, contact). No horizontal page-body overflow. Tap a card → navigates to detail. On 1280px desktop, original table renders unchanged.

> **Note**: Per research.md decision, this phase targets the Directory page first as the highest-priority list. Groups page to follow. Finance page deferred (already has partial mobile handling).

### Implementation for User Story 4

- [x] T013 [P] [US4] Create `src/components/crm/StudentMobileCard.tsx` — horizontal layout, left: avatar (M/F icon in circular `bg-blue-50`/`bg-pink-50`), middle: name + grade + billing status dot, right: chevron.
- [x] T014 [P] [US4] Create `src/components/crm/ParentMobileCard.tsx` — similar to student but uses `family_restroom` icon and shows phone + student count instead of grade.
- [x] T015 [US4] Modify `src/pages/DirectoryPage.tsx` — add `const isMobile = useIsMobile()`. In the grid map functions for students and parents (flat and grouped), ternary render: `isMobile ? <StudentMobileCard ... /> : <StudentCard ... />`. No changes to the filtering/grouping UI itself (this leverages the robust foundation built previously).

**Checkpoint**: US4 complete — Directory fully usable on mobile as card feed. Desktop identical.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, edge cases, and accessibility pass.

- [x] T016 [P] Manual test — desktop regression check at 1280px: sidebar visible, bottom nav hidden, full attendance grids render in dashboard, all existing pages look unchanged
- [x] T017 [P] Manual test — mobile smoke test at 390px: no horizontal body overflow on any page, all bottom nav tabs navigate correctly, More sheet opens/closes, group card → attendance sheet flow completes, FAB quick actions work
- [x] T018 [P] Touch target audit — verify all tappable elements in new mobile components are ≥44×44px (group cards min-h-[80px] ✓, FAB ≥44×44 ✓, student rows min-h-[56px], session rows min-h-[60px], bottom nav tabs h-16 ✓)
- [x] T019 Run `npm run lint` — zero errors
- [x] T020 Run `npm run build` — `tsc -b && vite build` must pass with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **blocks Phase 3+**
- **Phase 3 (US1 — Navigation)**: Depends on Phase 2
- **Phase 4 (US2 — Dashboard Feed)**: Depends on Phase 2; benefits from Phase 3 being done
- **Phase 5 (US3 — Attendance Sheet)**: Depends on Phase 4 (needs `DashboardPage` mobile branch wired)
- **Phase 6 (US4 — List Pages)**: Depends on Phase 2 only — can be worked in parallel with Phases 3–5
- **Phase 7 (Polish)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1 (Navigation)**: Start after Phase 2 — independent
- **US2 (Dashboard Feed)**: Start after Phase 2 — independent of US1 at component level, but US1 should be visually verified first
- **US3 (Attendance Sheet)**: Depends on US2 (DashboardPage mobile branch must exist)
- **US4 (List Pages)**: Start after Phase 2 — fully independent of US1–US3

### Parallel Opportunities

- T003, T004, T005 (Phase 2) — all different files, run in parallel
- T008, T009 (Phase 4) — different component files, run in parallel
- T013, T014 (Phase 6) — different card components, run in parallel
- T016, T017, T018, T019 (Phase 7) — all independent checks, run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 — Core mobile experience)

1. Complete Phase 1: Fix Sidebar bug + create `useIsMobile`
2. Complete Phase 2: MobileTopBar + nav audit
3. Complete Phase 3: Verify navigation (US1)
4. Complete Phase 4: Mobile dashboard feed (US2)
5. Complete Phase 5: Attendance sheet (US3)
6. **STOP and VALIDATE**: Full mobile daily-ops flow works end-to-end
7. Run Phase 7 polish

### Add Later (US4)

- Phase 6 (Directory card view) can be done as a follow-on PR

### Total Task Count

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1 Setup | 2 | — |
| Phase 2 Foundational | 3 | — |
| Phase 3 | 2 | US1 |
| Phase 4 | 3 | US2 |
| Phase 5 | 2 | US3 |
| Phase 6 | 3 | US4 |
| Phase 7 Polish | 5 | — |
| **Total** | **20** | |

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- Story labels map to `spec.md` user stories
- Desktop layout must be regression-tested after every phase
- `useIsMobile` is the single source of truth for all conditional mobile rendering — do not use CSS-only hiding for content that is heavy to mount (e.g., AttendanceGrid)
- All new components follow naming convention from constitution: `*Card.tsx` → `components/{domain}/`, `*Sheet.tsx` → `components/{domain}/`
