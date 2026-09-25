- [x] Update backend schema AttendanceRosterStudentDTO in pp/modules/academics/group/details/schemas.py to include alance: float.
- [x] Update backend service GroupDetailsService in pp/modules/academics/group/details/service.py to map the alance field.
- [x] Verify backend tests pass with pytest tests/test_finance.py tests/test_crm.py -v.
- [x] Update frontend schema AttendanceRosterDTO in src/api/academics/groups/newEndpoints.ts to include alance: number.
- [x] Update frontend utility 	ransformRoster in src/utils/attendanceTransforms.ts to forward alance.
- [x] Create PaymentSummaryStrip.tsx in src/components/attendance/PaymentSummaryStrip.tsx.
- [x] Modify src/components/attendance/AttendanceGrid.tsx to insert the new component next to the instructor info.
- [x] Modify src/components/attendance/AttendanceMobileSheet.tsx to display the summary strip in mobile view under the header.
- [x] Run 
pm run build and 
pm run lint to ensure no lint/build issues.
