# Quickstart: Edit Enrollment Feature

**Branch**: `036-edit-enrollment`

## What This Feature Does

Adds the ability for administrators to edit the financial details (`amount_due`, `discount_applied`) and internal notes on existing active enrollments, without needing to drop and re-enroll students. Includes audit logging, payment conflict validation, and Gmail notifications for financial changes.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React SPA)                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ManageEnrollment  │  │ EditEnrollment   │  │ useUpdateEnr-  │ │
│  │ Panel.tsx         │→ │ Modal.tsx [NEW]   │→ │ ollment hook   │ │
│  │ (add Edit action) │  │ (form + validate)│  │ [NEW]          │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                    ↓             │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ API Layer: updateEnrollment() → PATCH /enrollments/{id}     ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────────┐
│  Backend (FastAPI)                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ enrollments_     │→ │ EnrollmentCore   │→ │ core/          │ │
│  │ router.py        │  │ Service          │  │ repository.py  │ │
│  │ (PATCH endpoint) │  │ (.update_enroll.)│  │ (update_fields)│ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│           ↓                     ↓                                │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ EnrollmentNotif.  │  │ enrollment_     │                     │
│  │ Service [notify]  │  │ metadata JSONB  │                     │
│  └──────────────────┘  │ (audit trail)    │                     │
│                         └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Files to Change

### Backend (techno_data_ Copy)

| File | Change |
|------|--------|
| `app/modules/enrollments/core/schemas.py` | Add `UpdateEnrollmentInput`, `UpdateEnrollmentResult` |
| `app/modules/enrollments/core/repository.py` | Add `update_enrollment_fields()` |
| `app/modules/enrollments/core/service.py` | Add `update_enrollment()` method |
| `app/modules/enrollments/core/interface.py` | Add `update_enrollment` to Protocol |
| `app/api/routers/enrollments_router.py` | Add `PATCH /enrollments/{enrollment_id}` |
| `app/modules/notifications/services/enrollment_notifications.py` | Add `notify_enrollment_updated()` |

### Frontend (techno_terminal_UI)

| File | Change |
|------|--------|
| `src/api/enrollments/types.ts` | Add `UpdateEnrollmentRequest`, fix `amount_due` type |
| `src/api/enrollments/enrollments.ts` | Add `updateEnrollment()` |
| `src/api/enrollments/index.ts` | Re-export new function |
| `src/hooks/useEnrollmentMutations.ts` | [NEW] `useUpdateEnrollment` hook |
| `src/components/enrollments/EditEnrollmentModal.tsx` | [NEW] Edit form modal |
| `src/components/enrollments/ManageEnrollmentPanel.tsx` | Add "Edit" action to action hub |

## Development Workflow

1. **Backend first**: Add schema → repo → service → router → notification
2. **Test backend**: Hit `PATCH /enrollments/{id}` via API client
3. **Frontend**: Add types → API function → hook → modal → wire into panel
4. **Verify**: End-to-end test via browser
