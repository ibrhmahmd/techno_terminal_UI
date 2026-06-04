# Implementation Plan: Mobile Layout Redesign

**Branch**: `main` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/034-mobile-layout-redesign/spec.md`

---

## Summary

Implement a mobile-first responsive layer for the TechnoTerminal CRM UI. The desktop layout (≥1024px) remains **pixel-for-pixel unchanged**. On mobile (<1024px), the app replaces the sidebar with a bottom tab bar, transforms the dashboard into a clean agenda feed with a FAB for quick actions, and introduces a session-first attendance bottom sheet. All changes are additive — no existing components are deleted, only extended or conditionally hidden.

---

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4  
**Styling**: Tailwind CSS v3.4 — breakpoints: `lg` = 1024px (single mobile/desktop boundary)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`  
**Target Platform**: Browser (Chrome/Firefox/Safari/Edge on phone, tablet, desktop)  
**Icons**: Material Symbols (`material-symbols-outlined`)  
**Fonts**: Space Grotesk (`font-headline`), Inter (`font-body`)  
**Constraints**: Frontend-only. Strict TS. Build must pass `tsc -b && vite build`. No new API endpoints. Desktop layout must not regress.

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/`. No backend. |
| II. Server State Discipline | ✅ PASS | Mobile components consume data from existing `useDashboard` hook. `markAttendance` mutation uses existing API layer with query invalidation. |
| III. Global State Minimalism | ✅ PASS | `useIsMobile` is a local reactive hook (matchMedia), not Zustand. Sheet open/close state is component-local `useState`. |
| IV. TypeScript Strict Mode | ✅ PASS | All new components typed. `Sidebar.tsx` `onClose` bug fixed. No `any`. |
| V. Naming Conventions | ✅ PASS | `MobileGroupCard` → `components/dashboard/`, `AttendanceMobileSheet` → `components/attendance/`, `MobileTopBar` → `components/layout/`, `MobileDashboardFAB` → `components/dashboard/` |

**Gate result: PASS — proceed to implementation.**

---

## Complexity Tracking

*No constitution violations.*

---

## Project Structure

### Documentation (this feature)

```text
specs/034-mobile-layout-redesign/
├── plan.md          ← this file
├── spec.md
├── research.md
├── data-model.md
└── checklists/
    └── requirements.md
```

### New Source Files

```text
src/
├── hooks/
│   └── useIsMobile.ts                        [NEW]
├── components/
│   ├── layout/
│   │   └── MobileTopBar.tsx                  [NEW]
│   ├── dashboard/
│   │   ├── MobileGroupCard.tsx               [NEW]
│   │   └── MobileDashboardFAB.tsx            [NEW]
│   └── attendance/
│       └── AttendanceMobileSheet.tsx         [NEW]
```

### Modified Source Files

```text
src/
├── components/layout/
│   └── Sidebar.tsx                           [MODIFY] — remove dead onClose ref
├── pages/
│   └── DashboardPage.tsx                     [MODIFY] — conditional mobile/desktop render
```

---

## Implementation Phases

---

### Phase A: Foundation (Prerequisite for everything)

#### A1 — Fix `Sidebar.tsx` `onClose` Bug

**File**: `src/components/layout/Sidebar.tsx`  
**Change**: Remove line 90 — the `<button onClick={onClose}>` inside the brand header. The `SidebarProps` interface is empty `{}` so `onClose` is undefined. This button is `lg:hidden` and never rendered on desktop, but it is a TypeScript error.

```diff
-        <button
-          onClick={onClose}
-          className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors"
-        >
-          <span className="material-symbols-outlined text-xl">close</span>
-        </button>
```

**Verification**: `npm run build` must pass after this change.

---

#### A2 — Create `useIsMobile` Hook

**File**: `src/hooks/useIsMobile.ts` [NEW]  
**Purpose**: Reactive breakpoint detection. Returns `true` when viewport < 1024px.

```typescript
// src/hooks/useIsMobile.ts
import { useState, useEffect } from 'react'

const MOBILE_QUERY = '(max-width: 1023px)'

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}
```

**Why not CSS-only**: Conditional rendering prevents mounting the heavy `AttendanceGrid` table on mobile (900+ line component). CSS-only hiding would still render it.

---

### Phase B: Mobile Navigation Polish

The `BottomNav` and `MobileNavSheet` are already built and working. This phase ensures they are production-quality.

#### B1 — Audit `BottomNav.tsx`

Review and confirm:
- [ ] `lg:hidden` is correct — disappears at ≥1024px ✅
- [ ] Active state uses teal accent line + teal text ✅
- [ ] Touch targets: each tab is `h-16` flex column — meets 44px requirement ✅
- [ ] "More" active state when on a "More" route ✅

**No code changes needed** unless audit reveals issues.

#### B2 — Audit `MobileNavSheet.tsx`

Review and confirm:
- [ ] Sheet slides up from bottom with `translate-y` transition ✅
- [ ] Backdrop dismissal works ✅
- [ ] Escape key closes sheet ✅
- [ ] Route change auto-closes sheet ✅
- [ ] Role filtering matches desktop sidebar ✅
- [ ] `pb-20` on user row ensures content clears the bottom nav ✅

**No code changes needed** unless audit reveals issues.

---

### Phase C: Mobile Top Bar

#### C1 — Create `MobileTopBar` Component

**File**: `src/components/layout/MobileTopBar.tsx` [NEW]

```
Props: { title: string }
Renders:
  - Sticky header (h-14, bg-slate-950, border-b border-slate-800)
  - Left: "TechnoTerminal" in font-headline, white, bold
  - Right: page title in teal-400, font-medium text-sm
  - Only shown on mobile (lg:hidden)
```

Design rationale: Dark header (matching bottom nav) creates a cohesive mobile chrome. The app name grounds the user; the page title provides context without breadcrumbs.

---

### Phase D: Mobile Dashboard

This is the most significant change. `DashboardPage.tsx` gains a conditional mobile render path.

#### D1 — Create `MobileGroupCard` Component

**File**: `src/components/dashboard/MobileGroupCard.tsx` [NEW]

```
Props:
  groupId:          number
  groupName:        string
  courseName:       string
  instructorName:   string
  sessionCount:     number
  studentCount:     number
  todaySession:     TodaySessionDTO | null
  onOpenAttendance: () => void

Renders (single card):
  ┌─────────────────────────────────────────┐
  │ ● Group Name              [→]           │
  │   Course Name                           │
  │   👤 Instructor Name                    │
  │   ─────────────────────────────         │
  │   📅 3 sessions    👥 12 students        │
  └─────────────────────────────────────────┘

Styles:
  - bg-white, rounded-xl, border border-slate-200, shadow-sm
  - Left accent bar (4px, bg-secondary/teal)
  - Tap arrow (→) in teal-400
  - Session/student count row in slate-500 text-sm
  - Active state: border-teal-400 shadow-teal-100 on press
  - Touch target: full card is tappable (min-h-[80px])
```

#### D2 — Create `MobileDashboardFAB` Component

**File**: `src/components/dashboard/MobileDashboardFAB.tsx` [NEW]

```
Props: { todaySessionCount: number }

Renders:
  - Fixed position: bottom-20 right-4 z-40 (above BottomNav)
  - Collapsed state: circular button with "+" icon, bg-secondary (teal)
  - Expanded state: 2 mini action pills slide up:
      [person_add  Quick Register]
      [payment     Create Payment]
  - Tap outside or tap FAB again collapses

State: local useState(isOpen)

Action wiring:
  - Quick Register → opens StudentForm modal (same as QuickActionsGrid)
  - Create Payment → navigate('/finance')

Animation: scale + opacity transition on expand/collapse (CSS transitions, no library)
```

#### D3 — Create `AttendanceMobileSheet` Component

**File**: `src/components/attendance/AttendanceMobileSheet.tsx` [NEW]

This is the largest new component. It implements the session-first attendance flow.

```
Props:
  isOpen:         boolean
  groupId:        number
  groupName:      string
  instructorName: string
  sessions:       SessionWithAttendanceDTO[]
  roster:         StudentRosterDTO[]
  selectedDate:   string
  onClose:        () => void

Internal state:
  activeStep:        'sessions' | 'students'
  selectedSession:   SessionWithAttendanceDTO | null
  localAttendance:   Map<string, AttendanceStatus>   (student_id → status)
  pendingEntries:    AttendanceEntry[]
  isSaving:          boolean

Step 1 — Session List:
  - Full-screen bottom sheet (slides up from bottom, covers ~85% of screen)
  - Header: group name, "X" close button, "View Group →" link
  - List of sessions:
      [01]  Jun 4  9:00 AM   Ahmed     [scheduled ●]   →
      [02]  Jun 2  9:00 AM   Ahmed     [completed ✓]   →  (dim, link to group)
      [03]  cancelled                  [cancelled ✗]      (non-tappable, dim)
  - Only sessions matching selectedDate are tappable for attendance

Step 2 — Student List:
  - Back button returns to Step 1
  - Session summary row at top (session #, time, instructor)
  - Scrollable student list:
      ┌─────────────────────────────────────┐
      │ [M] Ahmed Samy          [present ✓] │
      │ [F] Sara Ali            [absent  ✗] │
      │ [M] Omar Hassan         [—      ○] │
      └─────────────────────────────────────┘
  - Tap student row → cycles status: null→present→absent→cancelled→null
  - Color coding: present=green, absent=red, cancelled=slate, null=outline
  - Billing badge: due=amber dot, paid=hidden
  - Save button: fixed at bottom of sheet
    - Disabled if no pending changes
    - Shows spinner during save
    - Calls markAttendance(sessionId, entries) from existing API
    - On success: invalidates dashboard cache, shows toast, returns to Step 1

Sheet UX:
  - Backdrop tap closes sheet (same as MobileNavSheet pattern)
  - Sheet itself: fixed inset-x-0 bottom-0 z-50, rounded-t-2xl, bg-white
  - Max height: 90vh with overflow-y-auto on content
  - Drag handle at top (same as MobileNavSheet)
```

#### D4 — Modify `DashboardPage.tsx`

**Change**: Add `useIsMobile()` conditional to render either mobile or desktop view.

```typescript
// At top of DashboardPage component:
const isMobile = useIsMobile()

// State for sheet:
const [openGroupId, setOpenGroupId] = useState<number | null>(null)

// Mobile render path (instead of current GroupSessionCard loop):
{isMobile ? (
  <>
    <MobileTopBar title="Dashboard" />
    {/* DaySelectorBar + InstructorSelectorBar remain unchanged */}
    {filteredScheduleItems.map(item => (
      <MobileGroupCard
        key={item.group_id}
        groupId={item.group_id}
        groupName={groups[item.group_id]?.name}
        ...
        onOpenAttendance={() => setOpenGroupId(item.group_id)}
      />
    ))}
    <MobileDashboardFAB todaySessionCount={scheduleItems.length} />
    {openGroupId !== null && (
      <AttendanceMobileSheet
        isOpen={true}
        groupId={openGroupId}
        sessions={getGroupData(openGroupId).sessions}
        roster={getGroupData(openGroupId).roster}
        ...
        onClose={() => setOpenGroupId(null)}
      />
    )}
  </>
) : (
  // EXISTING desktop render — unchanged
  <>
    <TopNavbar activePage="Dashboard" />
    <main className="p-10 flex-1 space-y-8">
      <QuickActionsGrid ... />
      ...
    </main>
  </>
)}
```

**Critical constraint**: The desktop `else` branch must be byte-for-byte identical to the current render output. No structural changes.

---

### Phase E: Build Verification

```bash
npm run lint          # must be zero errors
npm run build         # tsc -b && vite build must pass
```

Manual verification checklist:
- [ ] Desktop at 1280px: sidebar visible, bottom nav hidden, full attendance grids render
- [ ] Mobile at 390px: sidebar hidden, bottom nav visible, agenda feed renders
- [ ] Tab navigation works on mobile
- [ ] More sheet opens and closes correctly
- [ ] Group card opens attendance sheet
- [ ] Session → student list flow works
- [ ] Attendance save persists and refreshes
- [ ] FAB expands/collapses, Quick Register modal opens
- [ ] Day selector and instructor filter work on mobile
- [ ] No horizontal overflow on page body at 390px

---

## File Change Summary

| File | Action | Scope |
|------|--------|-------|
| `src/components/layout/Sidebar.tsx` | MODIFY | Remove dead `onClose` button (2 lines) |
| `src/hooks/useIsMobile.ts` | NEW | ~20 lines |
| `src/components/layout/MobileTopBar.tsx` | NEW | ~30 lines |
| `src/components/dashboard/MobileGroupCard.tsx` | NEW | ~80 lines |
| `src/components/dashboard/MobileDashboardFAB.tsx` | NEW | ~90 lines |
| `src/components/attendance/AttendanceMobileSheet.tsx` | NEW | ~200 lines |
| `src/pages/DashboardPage.tsx` | MODIFY | Add `isMobile` branch (~40 lines added) |

**Total estimated**: ~460 new lines, ~40 modified lines. Zero deleted functional code.
