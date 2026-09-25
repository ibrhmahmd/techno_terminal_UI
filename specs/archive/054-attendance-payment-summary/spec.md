# Spec: Attendance Payment Summary in Group Card Header

**Spec ID**: 054  
**Date**: 2026-07-10  
**Status**: Draft  
**Author**: Product (via /grill-me interview)

---

## 1. Problem Statement

The attendance grid already shows a PAID / DUE badge per student, but there is no high-level financial summary for the group as a whole. The client needs to see at a glance, while marking attendance, how many students have paid, how many still owe, and what the total outstanding balance is for the group's current enrollment level.

---

## 2. User Story

> As an admin or instructor viewing the attendance grid, I want to see a payment summary in the group card header so that I can immediately know the financial health of the group's current enrollment without leaving the attendance screen.

---

## 3. Acceptance Criteria

| # | Criteria |
|---|----------|
| AC-1 | A payment summary strip is displayed inline in the group card header, on the right side (next to the instructor info) |
| AC-2 | The summary shows: X paid / Y due (student counts) |
| AC-3 | The summary shows: total remaining balance in EGP (sum of all positive balance values in the roster) |
| AC-4 | The summary is computed purely on the frontend from roster data already in memory — zero additional API calls |
| AC-5 | The feature renders in both the Dashboard (GroupSessionCard) and the Group Detail page (LevelsTab) |
| AC-6 | On the Group Detail page, the transformRoster utility currently sets balance = -1 for due students (a placeholder). This must be fixed to sentinel-detect and hide the EGP figure when balance data is unavailable. |
| AC-7 | When the roster is empty, the summary is not rendered |
| AC-8 | The component handles the partial billing status (only present in the academics API roster) by treating it as due for the count |

---

## 4. Data Flow Analysis

### 4.1 Dashboard path (already correct)

GET /dashboard/daily-overview returns ScheduledGroupDTO.roster: StudentRosterDTO[] which includes:
- student_id, student_name, gender
- billing_status: 'paid' | 'due'  (backend-computed)
- balance: float  (amount_due - discount - total_paid)

The dashboard StudentRosterDTO already includes balance. Summary can be derived directly.

### 4.2 Group detail page path (needs a fix)

GET /groups/{id}/attendance/{level} returns AttendanceLevelResponse.roster: AttendanceRosterDTO[] which includes:
- student_id, student_name, enrollment_id
- billing_status: 'paid' | 'due' | 'partial'
- joined_at: string
- NO balance field exposed

AttendanceRosterDTO (from the academics API) does not contain balance. The transformRoster utility in attendanceTransforms.ts currently hard-codes balance = -1 for due students as a known placeholder.

Decision (from grill session): Display X paid / Y due - Z EGP remaining where Z uses the balance field from the dashboard path. For the group detail page, since balance is unavailable (sentinel value -1), hide the EGP figure and show counts only.

Open Item: Confirm with backend team whether adding balance: float to AttendanceRosterDTO is a quick win. If yes, update transformRoster to pass it through and the EGP figure will appear on the group detail page too.

---

## 5. Derived Summary Logic (frontend)

Given roster: StudentRosterDTO[], the component computes:
- paidCount = roster.filter(r => r.billing_status === 'paid').length
- dueCount  = roster.filter(r => r.billing_status !== 'paid').length
- totalRemaining = roster.reduce((sum, r) => sum + Math.max(0, r.balance), 0)
  (balance === -1 sentinel means balance unknown — omit EGP display)

---

## 6. UI Specification

### 6.1 Location
Inline inside the existing group card header, positioned after the instructor block and before the Add Session button, separated by the existing vertical divider.

### 6.2 Visual Design

- Paid count: green chip — "X paid"
- Due count: amber/red chip — "Y due" 
- Balance: muted text — "1,750 EGP remaining" (only when balance > 0 and data is available)
- If all paid: show only green chip, omit balance text
- Separated from instructor block by existing h-8 w-px bg-slate-300 divider

### 6.3 New Component

Create src/components/attendance/PaymentSummaryStrip.tsx with:

  interface PaymentSummaryStripProps {
    roster: StudentRosterDTO[]
  }

The component derives counts and balance internally — no pre-computed props passed in.

---

## 7. Files to Change

| File | Change |
|------|--------|
| src/components/attendance/PaymentSummaryStrip.tsx | NEW — the summary chip component |
| src/components/attendance/AttendanceGrid.tsx | Insert PaymentSummaryStrip in the header between instructor and Add Session button |
| src/utils/attendanceTransforms.ts | Sentinel-guard: when balance === -1 in StudentRosterDTO, PaymentSummaryStrip omits EGP display |

---

## 8. Out of Scope

- No backend schema changes in the happy path
- No changes to the student-level PAID/DUE badge in StudentInfo.tsx
- No mobile bottom-sheet changes (AttendanceMobileSheet deferred)
- No additional API endpoints

---

## 9. Constitution Check

| Principle | Status |
|-----------|--------|
| I. Frontend-Only Scope | PASS - All changes in src/. Zero backend code touched. |
| II. Server State Discipline | PASS - No new API calls. Uses roster prop already in memory. |
| III. Global State Minimalism | PASS - Pure derived computation, no new state. |
| IV. TypeScript Strict Mode | PASS - No any, typed props via existing StudentRosterDTO. |
| V. Component Naming Convention | PASS - New component named PaymentSummaryStrip.tsx in components/attendance/. |

---

## 10. Open Items

1. Backend gap: Does AttendanceRosterDTO (group detail attendance endpoint) need balance added? Confirm with backend team.
2. Mobile sheet: AttendanceMobileSheet renders its own header — payment summary there is deferred.
3. partial status: The academics-API roster has 'partial' as a third billing status. Treat as due for count purposes.
