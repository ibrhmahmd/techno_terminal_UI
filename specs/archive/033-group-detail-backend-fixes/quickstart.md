# Quickstart: Group Detail Page Fixes

**Spec**: `033-group-detail-backend-fixes`

## Prerequisites

- Backend server running (`python run_api.py`)
- Frontend dev server running (`npm run dev`)
- A group with ≥2 levels (at least 1 completed + 1 active)

## Fix Order

### 1. Backend: Session Commit (BUG-3)
```bash
# File: app/modules/academics/session/service.py
# Add session.commit() after repo.create_session() in add_extra_session()
# Test: POST /academics/groups/{id}/sessions → verify session persists after refresh
```

### 2. Backend: All Levels Response (BUG-1)
```bash
# File: app/modules/academics/group/details/service.py
# Replace get_current_group_level() with list_group_levels(include_inactive=True)
# Test: GET /academics/groups/{id}/levels/detailed → verify multiple levels in response
```

### 3. Backend: Unpaid Count (BUG-2)
```bash
# File: app/modules/academics/group/details/service.py
# Replace total_students from payment records with enrollment COUNT query
# Test: GET /finance/groups/{id}/payments → verify unpaid_count > 0
```

### 4. Frontend: Notes Loop (BUG-4)
```bash
# File: src/components/groups/detail/GroupInfoCard.tsx
# Replace dual useEffect with lastSavedRef pattern
# Test: Type note → verify exactly 1 PATCH in Network tab
```

### 5. Frontend: Time Format (BUG-5)
```bash
# File: src/components/groups/detail/GroupInfoCard.tsx
# Import formatTime from utils/formatting.ts, remove inline function
# Test: Verify schedule shows "2:00 PM - 4:00 PM" format
```

## Verification Checklist

- [ ] `npm run build` passes (frontend)
- [ ] `python run_api.py` starts without errors (backend)
- [ ] Group with 2+ levels shows all levels in Attendance/Levels/Students tabs
- [ ] Payments tab shows correct unpaid count
- [ ] Adding session persists after page refresh
- [ ] Notes save triggers exactly 1 API call
- [ ] Schedule time displays in 12h format
