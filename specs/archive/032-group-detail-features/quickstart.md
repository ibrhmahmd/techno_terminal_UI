# Quickstart: Group Detail Page — Feature Completions

**Date**: 2026-06-03  
**Feature**: `032-group-detail-features`

## Setup

No additional setup needed. All backend APIs are already deployed. The dev server is running.

```bash
# Dev server (already running)
npm run dev
```

## Development Order

Follow this sequence to minimize cross-dependencies:

### Step 1: API + Query Keys (foundation)
1. Add history types to `src/api/academics/groups/newEndpoints.ts`
2. Add `getEnrollmentHistory()` and `getInstructorHistory()` API functions
3. Add cache keys to `src/hooks/queryKeys.ts`

### Step 2: History Tab (P1, self-contained)
1. Create `src/hooks/useGroupHistory.ts`
2. Create `src/components/groups/HistoryTab.tsx`
3. Wire into `GroupDetailPage.tsx` (replace placeholder)

### Step 3: Session Management (P2, depends on Step 1 keys)
1. Create `src/hooks/useSessionMutations.ts`
2. Create `src/components/groups/detail/SessionListPanel.tsx`
3. Create `src/components/groups/detail/AddSessionDialog.tsx`
4. Modify `src/components/groups/LevelsTab.tsx` (add session panel + coming soon)

### Step 4: Student Actions (P2, independent)
1. Create `src/components/groups/detail/TransferDialog.tsx`
2. Modify `src/components/groups/StudentsTab.tsx` (fix View, add Transfer)

### Step 5: Verify
```bash
npm run lint
npm run build
```

## Test Page

Navigate to any group detail page to test:
```
http://localhost:5173/groups/1
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/api/academics/sessions/core.ts` | Session API (add, delete, cancel, reactivate) — already exists |
| `src/api/enrollments/enrollments.ts` | Transfer API — already exists |
| `src/hooks/useGroupEnrollments.ts` | Returns `transferOptions` — already exists |
| `src/components/common/combobox/GroupCombobox.tsx` | Group selector — already exists |
| `src/components/common/DateInput.tsx` | Date picker — already exists |
| `src/components/common/ConfirmDialog.tsx` | Confirmation dialogs — already exists |
