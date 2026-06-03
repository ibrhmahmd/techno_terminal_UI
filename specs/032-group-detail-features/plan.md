# Implementation Plan: Group Detail Page — Feature Completions

**Branch**: `030-groups-ui-redesign` | **Date**: 2026-06-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/032-group-detail-features/spec.md`

## Summary

Complete four missing features on the Group Detail page using **existing backend APIs only** (frontend-only scope):

1. **History tab** — replace placeholder stub with enrollment-history + instructor-history views (2 new API wiring functions, 1 new hook, 1 new tab component)
2. **Session management** — add per-level session list with add/delete/cancel/reactivate actions in the Levels tab (1 new hook, 2 new UI components)
3. **Student actions** — fix View (navigate to profile), replace Edit with Transfer (1 new dialog, mutations in existing hook)
4. **Level number edit** — disabled "Coming Soon" button in level cards (inline, ~10 LOC)

Total: ~8 new files, ~4 modified files, 0 new backend endpoints.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`  
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

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ Pass | No backend code. All APIs already exist. |
| II. Server State via React Query | ✅ Pass | All new data fetching uses `useQuery`/`useMutation` with `queryKeys.ts` factories. No raw `fetch()` or direct `useEffect` API calls. |
| III. Global State Minimalism | ✅ Pass | No new Zustand stores. All state is React Query cache or local `useState`. |
| IV. TypeScript Strict Mode | ✅ Pass | All new code uses `import type` for type-only imports. No `any` usage. |
| V. Component Naming Convention | ✅ Pass | `HistoryTab.tsx` → `components/groups/`, `TransferDialog.tsx` → `components/groups/`, `SessionListPanel.tsx` → `components/groups/detail/`, `AddSessionDialog.tsx` → `components/groups/detail/`. |
| Cache Keys via queryKeys.ts | ✅ Pass | New keys (`groupEnrollmentHistory`, `groupInstructorHistory`) added to centralized `queryKeys.ts`. |
| Build Gates | ✅ Pass | Will verify with `npm run lint && npm run build`. |

**No violations. No complexity tracking needed.**

## Project Structure

### Documentation (this feature)

```text
specs/032-group-detail-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code — Files to Create/Modify

```text
src/
├── api/academics/groups/
│   └── newEndpoints.ts            # [MODIFY] Add getEnrollmentHistory(), getInstructorHistory()
├── hooks/
│   ├── queryKeys.ts               # [MODIFY] Add groupEnrollmentHistory, groupInstructorHistory keys
│   ├── useGroupHistory.ts         # [NEW] History tab data hook
│   └── useSessionMutations.ts     # [NEW] Session add/delete/cancel/reactivate mutations
├── components/groups/
│   ├── HistoryTab.tsx             # [NEW] History tab with enrollment + instructor sections
│   ├── StudentsTab.tsx            # [MODIFY] Fix View nav, replace Edit with Transfer
│   ├── LevelsTab.tsx              # [MODIFY] Add session list + "Coming Soon" button
│   └── detail/
│       ├── TransferDialog.tsx     # [NEW] Transfer student dialog
│       ├── SessionListPanel.tsx   # [NEW] Session list per level with actions
│       └── AddSessionDialog.tsx   # [NEW] Add extra session date-picker dialog
└── pages/
    └── GroupDetailPage.tsx         # [MODIFY] Wire HistoryTab, pass session/transfer props
```

---

## Detailed Design

### Feature 1: History Tab (P1)

#### API Layer

Two new functions in `src/api/academics/groups/newEndpoints.ts`:

```typescript
// GET /academics/groups/{group_id}/enrollment-history
export async function getEnrollmentHistory(groupId: number, status?: string)
  → EnrollmentHistoryResponse

// GET /academics/groups/{group_id}/instructor-history  
export async function getInstructorHistory(groupId: number)
  → InstructorHistoryResponse
```

**Backend response shapes** (from `group_lifecycle_router.py`):

- `EnrollmentHistoryResponse`: `{ group_id, group_name, total_enrollments, active_enrollments, completed_enrollments, dropped_enrollments, enrollments: EnrollmentHistoryItem[] }`
- `InstructorHistoryResponse`: `{ group_id, group_name, total_instructors, current_instructor, instructors: InstructorHistoryItem[] }`

#### Hook: `useGroupHistory(groupId, enabled)`

- Two `useQuery` calls, both with `enabled: enabled && groupId > 0`
- `staleTime: 5 * 60 * 1000` (5 min) per spec requirement SC-002
- Uses new query keys: `queryKeys.groupEnrollmentHistory(groupId)`, `queryKeys.groupInstructorHistory(groupId)`

#### Component: `HistoryTab`

Two visual sections stacked vertically:

1. **Enrollment History** — Summary stats row (total / active / completed / dropped) + filterable data table
   - Client-side status filter via `PillSelector` (All / Active / Completed / Dropped)
   - Columns: Student Name, Phone, Level, Enrolled At, Status (badge), Balance

2. **Instructor History** — Card list showing each instructor with levels-taught count, date range, and "Current" badge

**Empty states**: Separate messages for zero enrollments and zero instructors.

#### API Call Budget: 2 calls (lazy, cached 5 min)

---

### Feature 2: Session Management in Levels Tab (P2)

#### Hook: `useSessionMutations(groupId)`

Wraps four existing API functions as `useMutation` calls:

| Mutation | API Function | Endpoint |
|----------|-------------|----------|
| `addSession` | `addExtraSession()` | `POST /groups/{id}/sessions` |
| `deleteSession` | `deleteSession()` | `DELETE /sessions/{id}` |
| `cancelSession` | `cancelSession()` | `POST /sessions/{id}/cancel` |
| `reactivateSession` | `reactivateSession()` | `POST /sessions/{id}/reactivate` |

All four invalidate `queryKeys.groupSessions(groupId)` and `queryKeys.groupLevels(groupId)` on success.

#### Component: `SessionListPanel`

Rendered inside `LevelsTab` when a level card is expanded (replaces current payment-only expanded view). Shows:

- Session table: `#`, Date, Time, Status badge, Actions column
- Actions per status:
  - `scheduled` → Cancel, Delete buttons
  - `cancelled` → Reactivate, Delete buttons
  - `completed` → Delete only (with backend 409 protection)
- Delete triggers `ConfirmDialog` (existing component)
- "Add Session" button at bottom → opens `AddSessionDialog`

#### Component: `AddSessionDialog`

Simple modal with:
- `DateInput` (existing component from `common/DateInput.tsx`)
- Optional notes textarea
- Submit calls `addExtraSession({ group_id, level_number, extra_date, notes })`
- `level_number` comes from the expanded level's data
- Dialog stays open on error (inline error display)

#### Data source

Sessions are **already in `LevelDetailDTO.sessions`** (type `LevelSessionDTO[]`) — fetched by `useGroupDetail` → `getDetailedLevels()`. No additional API call needed to list sessions. Mutations invalidate the levels cache which triggers a refetch.

#### API Call Budget: 0 extra queries (data already in levels response), 1 mutation per action

---

### Feature 3: Student Actions — View & Transfer (P2)

#### View Action Fix

In `StudentsTab.tsx`, replace:
```typescript
view: (student) => showToast(`View student ${student.student_name}`, 'info')
```
with:
```typescript
view: (student) => navigate(`/students/${student.student_id}`)
```

Requires adding `useNavigate` import. **2-line change.**

#### Transfer Action

Replace `edit` action with `transfer`:
```typescript
edit: (student) => { setTransferStudent(student); setIsTransferDialogOpen(true) }
```

#### Component: `TransferDialog`

- Props: `isOpen`, `student` (enrollment data), `groupId` (source, to exclude), `transferOptions` (from `useGroupEnrollments.transferOptions`), `onClose`, `onSuccess`
- Uses existing `GroupCombobox` from `src/components/common/combobox/GroupCombobox.tsx`
- Confirm button disabled until target group selected and target ≠ source
- Calls `transferEnrollment({ from_enrollment_id, to_group_id })` (already in `src/api/enrollments/enrollments.ts`)
- On success: invalidate `queryKeys.groupEnrollments(groupId)`, show toast, close dialog

#### Data Source

`transfer_options` is already returned by `useGroupEnrollments` (comes from `GET /groups/{id}/enrollments/all`). The `GroupCombobox` can use these pre-fetched options directly. **0 extra API calls for group list.**

#### API Call Budget: 0 extra queries, 1 mutation per transfer

---

### Feature 4: Level Number Edit — "Coming Soon" (P3)

In `LevelsTab.tsx` expanded view, add a single disabled button with tooltip:

```tsx
<button
  disabled
  title="Coming soon — level renumbering requires a database migration"
  className="... opacity-50 cursor-not-allowed"
>
  <Edit3 className="w-3.5 h-3.5" /> Edit Level Number
  <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full ml-1">
    Coming Soon
  </span>
</button>
```

**0 API calls. ~10 LOC inline.**

---

## API Call Analysis

| Tab/Action | Current Calls | After Change | Delta |
|------------|:------------:|:------------:|:-----:|
| Group Detail load | 3 (group + levels + sessions) | 3 | 0 |
| History tab (first visit) | 0 | +2 (enrollment-history + instructor-history) | +2 |
| History tab (revisit <5min) | 0 | 0 (cache hit) | 0 |
| Session add/delete/cancel | 0 | 1 per action (mutation) | +1 |
| Student transfer | 0 | 1 per transfer (mutation) | +1 |
| Student view | 0 | 0 (client navigation) | 0 |
| Level edit "Coming Soon" | 0 | 0 | 0 |

**Total worst case**: +2 lazy queries + 1 mutation per user action. No performance regression on page load.

---

## Verification Plan

### Build Gate
```bash
npm run lint && npm run build
```
Must pass with zero errors.

### Manual Verification

1. **History tab**: Navigate to group → History → verify enrollment table loads with data, instructor section renders, status filter works, tab switch cache hits
2. **Session management**: Levels tab → expand level → session list visible → Add Session → verify new session appears → Delete session → verify removal → Cancel → verify status change → Reactivate
3. **Student transfer**: Students tab → View → verify navigation → Transfer → select group → confirm → verify enrollment updates
4. **Coming Soon**: Levels tab → expand → verify disabled button with tooltip, verify 0 network calls in DevTools
