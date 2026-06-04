# Implementation Plan: Edit Enrollment

**Branch**: `036-edit-enrollment` | **Date**: 2026-06-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/036-edit-enrollment/spec.md`

## Summary

Add the ability for administrators to edit the financial details (`amount_due`, `discount_applied`) and internal notes of existing active enrollments via a new `PATCH /enrollments/{enrollment_id}` backend endpoint and a frontend edit modal integrated into the existing Manage Enrollment panel. Includes audit trail logging in the `enrollment_metadata` JSONB column, payment conflict validation, and Gmail notification dispatch for financial changes.

## Technical Context

**Language/Version**: TypeScript ~5.9 (frontend), Python 3.10+ (backend)  
**Framework**: React 19 + Vite 8 (frontend), FastAPI + SQLModel (backend)  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1  
**Testing**: Vitest 4.1 + happy-dom (frontend)  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth  
**Constraints**: Frontend strict TS. Build must pass `tsc -b && vite build`. Backend follows Router → Service → Repository architecture.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Frontend-Only Scope | ⚠️ EXCEPTION | Backend changes required — this feature needs a new API endpoint. Justified: no existing endpoint supports partial enrollment updates. |
| II. Server State Discipline | ✅ PASS | All mutations go through React Query. New `useUpdateEnrollment` hook uses `useMutation` with proper cache invalidation. |
| III. Global State Minimalism | ✅ PASS | No Zustand changes. Modal state is local `useState`. |
| IV. TypeScript Strict Mode | ✅ PASS | All new types use `import type`. No `any`. |
| V. Component Naming Convention | ✅ PASS | `EditEnrollmentModal.tsx` → `components/enrollments/`. |
| Cache Keys | ✅ PASS | Uses factory functions from `queryKeys.ts`. |
| API Layer | ✅ PASS | Uses `client.patch()` through `src/api/enrollments/`. |

## Project Structure

### Documentation (this feature)

```text
specs/036-edit-enrollment/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/
│   └── patch-enrollment.md  # API contract
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code Changes

```text
# Backend (techno_data_ Copy)
app/modules/enrollments/core/
├── schemas.py              # [MODIFY] Add UpdateEnrollmentInput, UpdateEnrollmentResult
├── repository.py           # [MODIFY] Add update_enrollment_fields()
├── service.py              # [MODIFY] Add update_enrollment() method
└── interface.py            # [MODIFY] Add update_enrollment to Protocol

app/api/routers/
└── enrollments_router.py   # [MODIFY] Add PATCH endpoint

app/modules/notifications/services/
└── enrollment_notifications.py  # [MODIFY] Add notify_enrollment_updated()

# Frontend (techno_terminal_UI)
src/api/enrollments/
├── types.ts                # [MODIFY] Add UpdateEnrollmentRequest, fix amount_due type
├── enrollments.ts          # [MODIFY] Add updateEnrollment()
└── index.ts                # [MODIFY] Re-export

src/hooks/
└── useEnrollmentMutations.ts  # [NEW] useUpdateEnrollment hook

src/components/enrollments/
├── EditEnrollmentModal.tsx     # [NEW] Edit form modal
└── ManageEnrollmentPanel.tsx   # [MODIFY] Add "Edit" action to action hub
```

## Proposed Changes

### Backend: Enrollment Core Module

#### [MODIFY] [schemas.py](file:///e:/Users/ibrahim/Desktop/techno_data_%20Copy/app/modules/enrollments/core/schemas.py)

Add two new schemas:

```python
class UpdateEnrollmentInput(BaseModel):
    amount_due: Optional[float] = None
    discount_applied: Optional[float] = None
    notes: Optional[str] = None

class UpdateEnrollmentResult(BaseModel):
    enrollment: EnrollmentDTO
    warnings: list[str] = []
```

`UpdateEnrollmentInput` uses `Optional` for all fields to support partial updates. The service layer must differentiate "field not provided" from "field set to None" — this is handled by checking `body.model_fields_set`.

---

#### [MODIFY] [repository.py](file:///e:/Users/ibrahim/Desktop/techno_data_%20Copy/app/modules/enrollments/core/repository.py)

Add a new function:

```python
def update_enrollment_fields(
    session: Session, enrollment_id: int, updates: dict
) -> Enrollment | None:
    enrollment = session.get(Enrollment, enrollment_id)
    if enrollment:
        for field, value in updates.items():
            setattr(enrollment, field, value)
        apply_update_audit(enrollment)
        session.add(enrollment)
    return enrollment
```

This accepts a dict of `{field_name: new_value}` and applies them atomically.

---

#### [MODIFY] [service.py](file:///e:/Users/ibrahim/Desktop/techno_data_%20Copy/app/modules/enrollments/core/service.py)

Add a new public method `update_enrollment()`:

1. Fetch enrollment by ID — raise `NotFoundError` if missing
2. Check `status == "active"` — raise `BusinessRuleError` if not
3. Validate `amount_due >= 0` and `discount_applied >= 0` if provided
4. Check for existing payments linked to this enrollment (query finance)
5. Build audit history entry with old vs. new values
6. Append to `enrollment_metadata.edit_history` 
7. Apply field updates via `update_enrollment_fields()`
8. If financial fields changed and `notification_svc` + `background_tasks` are available, dispatch notification
9. Return `UpdateEnrollmentResult` with warnings list

---

#### [MODIFY] [interface.py](file:///e:/Users/ibrahim/Desktop/techno_data_%20Copy/app/modules/enrollments/core/interface.py)

Add the new method signature to the `EnrollmentCoreInterface` Protocol.

---

#### [MODIFY] [enrollments_router.py](file:///e:/Users/ibrahim/Desktop/techno_data_%20Copy/app/api/routers/enrollments_router.py)

Add:

```python
@router.patch(
    "/enrollments/{enrollment_id}",
    response_model=ApiResponse[EnrollmentPublic],
    summary="Update enrollment details",
)
def update_enrollment(
    enrollment_id: int,
    body: UpdateEnrollmentInput,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    svc: EnrollmentService = Depends(get_enrollment_service),
):
    result = svc.update_enrollment(
        enrollment_id, body,
        performed_by=current_user.id,
        background_tasks=background_tasks,
    )
    msg = "Enrollment updated successfully."
    if result.warnings:
        msg += " " + " ".join(result.warnings)
    return ApiResponse(
        data=EnrollmentPublic.model_validate(result.enrollment),
        message=msg
    )
```

---

### Backend: Notification Module

#### [MODIFY] [enrollment_notifications.py](file:///e:/Users/ibrahim/Desktop/techno_data_%20Copy/app/modules/notifications/services/enrollment_notifications.py)

Add `notify_enrollment_updated()` public method and `_process_updated()` private processor. Uses template name `"enrollment_updated"`. Template variables: `student_name`, `group_name`, `changes_summary`, `enrollment_id`.

---

### Frontend: API Layer

#### [MODIFY] [types.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/api/enrollments/types.ts)

1. Fix `amount_due` type from `number` to `number | null` in `Enrollment` interface
2. Add `UpdateEnrollmentRequest` interface
3. Add `UpdateEnrollmentResponse` type alias

---

#### [MODIFY] [enrollments.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/api/enrollments/enrollments.ts)

Add:

```typescript
export async function updateEnrollment(
  enrollmentId: number, 
  data: UpdateEnrollmentRequest
): Promise<Enrollment> {
  const response = await client.patch<UpdateEnrollmentResponse>(
    `/enrollments/${enrollmentId}`, data
  )
  return response.data.data
}
```

---

### Frontend: Hooks

#### [NEW] [useEnrollmentMutations.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/hooks/useEnrollmentMutations.ts)

```typescript
export function useUpdateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ enrollmentId, data }) => updateEnrollment(enrollmentId, data),
    onSuccess: (_data, variables) => {
      // Invalidate all enrollment-related caches
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'student-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    }
  })
}
```

---

### Frontend: Components

#### [NEW] [EditEnrollmentModal.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/enrollments/EditEnrollmentModal.tsx)

A modal dialog containing:
- **Amount Due** input (number, clearable → null for group default, placeholder shows group default price)
- **Discount Applied** input (number, min 0)
- **Notes** textarea
- Save / Cancel buttons
- Loading + error states
- Uses `useUpdateEnrollment` hook

Props: `enrollment: StudentEnrollmentInfo`, `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void`

---

#### [MODIFY] [ManageEnrollmentPanel.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/enrollments/ManageEnrollmentPanel.tsx)

1. Add `'edit'` to the `mode` state type: `'transfer' | 'drop' | 'edit' | null`
2. Add an "Edit" button in the action hub (Step 3) alongside Transfer and Drop
3. When `mode === 'edit'`, render the `EditEnrollmentModal`
4. On success, reset state and refresh enrollments

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Backend changes (Constitution Gate I) | No PATCH endpoint exists to update enrollment fields | Frontend-only approach impossible — the API must be extended |

## Verification Plan

### Automated Tests

1. `npm run lint` — zero errors
2. `npm run build` — `tsc -b && vite build` must succeed
3. Backend: `pytest tests/ -k enrollment -v` (if enrollment tests exist)

### Manual Verification

1. Navigate to Enrollments → Manage → Select student → Select enrollment
2. Click "Edit" → Verify modal opens with current values pre-filled
3. Modify `amount_due` → Save → Verify toast + updated values
4. Clear `amount_due` field → Save → Verify it reverts to group default
5. Modify `discount_applied` → Verify warning if payments exist
6. Edit a dropped enrollment → Verify edit button is disabled/hidden
7. Check Gmail inbox for notification after financial edit
