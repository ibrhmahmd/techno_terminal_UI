# Tasks: Student Enrollment Paid Status & Balance Alignment

- `[x]` Fix Backend Balance Mapping
  - `[x]` Update `dto.amount_remaining` mapping in `app/modules/enrollments/directory/service.py`.
- `[x]` Fix Frontend Balance Mapping
  - `[x]` Update `amount_paid` mapping in `src/hooks/finance/useStudentEnrollments.ts`.
- `[x]` Verify Changes
  - `[x]` Run backend unit tests (`pytest tests/test_enrollments.py`).
  - `[x]` Run frontend build (`npm run build`).
  - `[x]` Run frontend lint (`npm run lint`).
