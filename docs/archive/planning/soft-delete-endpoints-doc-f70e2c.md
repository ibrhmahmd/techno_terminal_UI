# Soft Delete Endpoints Documentation

Create a dedicated API documentation file for the 4 new soft-delete endpoints added to the students router.

## Scope

Document the following endpoints:

1. **DELETE** `/crm/students/{student_id}/soft` - Soft delete a student
2. **POST** `/crm/students/{student_id}/restore` - Restore a soft-deleted student  
3. **DELETE** `/crm/students/{student_id}/hard` - Permanently delete a student
4. **GET** `/crm/admin/deleted-students` - List all soft-deleted students

## Format

Follow the existing documentation style from `docs/api/crm/students.md`:
- Title and base path header
- Quick reference table with endpoints
- Individual endpoint sections with:
  - Authentication requirements
  - Path parameters
  - Response schemas with JSON examples
  - Error codes
- Include authentication notes (`require_admin` for all soft-delete endpoints)

## Deliverable

New file: `docs/api/crm/students-soft-delete.md`
