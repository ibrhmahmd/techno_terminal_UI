# Enrollment Edit API — Review

**Date**: 2026-05-16  
**Source files**: `src/api/enrollments/enrollments.ts`, `docs/api/enrollments.md`

## Existing Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/enrollments` | GET | List all enrollments |
| `/enrollments` | POST | Create new enrollment |
| `/enrollments/transfer` | POST | Transfer student to another group |
| `/enrollments/{id}` | DELETE | Soft-delete (drop) enrollment |
| `/enrollments/{id}/discount` | POST | Apply discount to enrollment |
| `/enrollments/group/{id}/students-summary` | GET | Summary per group |
| `/enrollments/student/{id}` | GET | Student's enrollment history |

## Missing: Edit/Update Endpoint

There is **no** `PUT` or `PATCH` endpoint for enrollment editing. Once created, the following fields cannot be modified:

- `amount_due`
- `discount_applied`
- `notes`

The only way to change financial data is via `POST /enrollments/{id}/discount` (discount only), which is limited.

## Recommendation

Add a `PATCH /enrollments/{id}` endpoint to the backend that accepts partial updates for:

- `amount_due` (number)
- `discount` (number)
- `notes` (string)

This is a **backend task** and requires coordination with the FastAPI team. The current workaround (drop + re-enroll) is not acceptable for production use.
