# Quickstart: Employee Soft-Delete

**Feature**: 068-employee-soft-delete
**Prerequisites**: Backend running on `:8000`, frontend on `:5173`

---

## Test Scenarios

### Scenario 1: Delete from Row Actions (US1)

1. Navigate to Staff page (`/staff`)
2. Identify an employee card
3. Click "Delete" in row actions
4. Confirm deletion in dialog
5. **Expected**: Card vanishes from list, success toast
6. Refresh page — employee still gone
7. Verify `GET /hr/employees/{id}` returns 404 or `deleted_at` non-null

### Scenario 2: Delete from Detail Modal (US1)

1. Click "View" on an employee card → detail modal opens
2. Click "Delete Employee" in modal footer
3. Confirm deletion
4. **Expected**: Modal closes, employee removed from list

### Scenario 3: Include Deleted Toggle (US2)

1. Toggle "Include deleted" ON on staff page
2. **Expected**: Deleted employees appear with red/muted styling + "Deleted" badge
3. Toggle OFF
4. **Expected**: Deleted employees disappear again
5. Verify pagination still works correctly

### Scenario 4: Restore from List (US3)

1. Toggle "Include deleted" ON
2. Find a deleted employee card
3. Click "Restore" (replaces Edit/Create Account actions)
4. Confirm restoration
5. **Expected**: Employee disappears from deleted view
6. Toggle OFF — employee reappears in default list

### Scenario 5: Restore from Detail Modal Banner (US4)

1. Toggle "Include deleted" ON
2. Click "View" on a deleted employee → detail modal opens
3. **Expected**: Yellow warning banner at top: "Employee was soft-deleted on {date}. Restoring will NOT automatically re-enable their login."
4. Click "Restore Employee" in banner
5. **Expected**: Banner disappears, employee shows as restored (deleted_at null)

### Scenario 6: Error Handling — Restore Non-Deleted (US3)

1. Toggle OFF (default list)
2. Attempt to restore a live employee via API
3. **Expected**: 409 ConflictError "is not deleted"

### Scenario 7: Error Handling — Restore After Re-Hire (US3)

1. Soft-delete employee A
2. Create new employee with same national_id/phone/email (re-hire)
3. Attempt to restore employee A
4. **Expected**: 409 ConflictError with aggregated field conflicts

### Scenario 8: InstructorCombobox Unaffected (Regression)

1. Open a group's edit session dialog
2. Click instructor combobox
3. **Expected**: Search works, no deleted employees shown
4. Verify `include_deleted` is not passed to the combobox query

### Scenario 9: Dual Cache Invalidation (US3)

1. Delete an employee
2. Navigate to Groups page
3. Open instructor combobox
4. **Expected**: Deleted employee does NOT appear in instructor search
5. Restore the employee
6. **Expected**: Employee reappears in instructor search after cache refresh
