# CRM API - Students Router

Router source: `app/api/routers/crm/students.py`  
Mounted prefix: `/api/v1`  
Router prefix: `/crm`

---

## Authentication & Authorization

All endpoints require:

```http
Authorization: Bearer <access_token>
```

Role guards used:
- `require_any`: any authenticated active user
- `require_admin`: admin/system_admin only

---

## DTOs and Schemas

### Request DTOs

#### RegisterStudentDTO (nested under command)
```json
{
  "full_name": "Omar Mohamed",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "phone": "01123456789",
  "notes": "Allergic to peanuts"
}
```

Validation:
- `full_name` required
- other fields optional

#### RegisterStudentCommandDTO
```json
{
  "student_data": {
    "full_name": "Omar Mohamed",
    "date_of_birth": "2010-05-15",
    "gender": "male",
    "phone": "01123456789",
    "notes": "Allergic to peanuts"
  },
  "parent_id": 1,
  "relationship": "son",
  "created_by_user_id": 5
}
```

Validation:
- `student_data` required
- `parent_id`, `relationship`, `created_by_user_id` optional

#### UpdateStudentDTO
```json
{
  "full_name": "Omar Mohamed Updated",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "phone": "01123456789",
  "notes": "Updated notes",
  "is_active": true
}
```

Validation:
- all fields optional
- date parsing accepts valid date input

### Response DTOs

#### StudentPublic
```json
{
  "id": 10,
  "full_name": "Omar Mohamed",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "phone": "01123456789",
  "is_active": true,
  "notes": "Allergic to peanuts"
}
```

#### StudentListItem
```json
{
  "id": 10,
  "full_name": "Omar Mohamed",
  "phone": "01123456789",
  "is_active": true
}
```

#### ParentPublic (used by student-parents endpoint)
```json
{
  "id": 1,
  "full_name": "Ahmed Mohamed",
  "phone_primary": "01123456789",
  "phone_secondary": "01234567890",
  "email": "ahmed@example.com",
  "relation": "Father",
  "notes": "Primary contact for Omar"
}
```

#### SiblingInfo
```json
{
  "student_id": 11,
  "full_name": "Ali Mohamed",
  "age": 12,
  "parent_id": 1,
  "parent_name": "Ahmed Mohamed"
}
```

---

## Endpoints

### 1) List / search students
**GET** `/api/v1/crm/students`  
Auth: `require_any`

Query:
- `q` (optional string, default `""`; search applied only when trimmed length >= 2)
- `skip` (optional, default `0`, `>= 0`)
- `limit` (optional, default `50`, `>= 1`, `<= 200`)

Response:
- `200 OK` -> `PaginatedResponse<StudentListItem>`

Errors:
- `401`, `403`, `422`

### 2) Get student by ID
**GET** `/api/v1/crm/students/{student_id}`  
Auth: `require_any`

Path params:
- `student_id` (integer, required)

Response:
- `200 OK` -> `ApiResponse<StudentPublic>`

Errors:
- `401`, `403`, `404`, `422`

### 3) Register a new student
**POST** `/api/v1/crm/students`  
Auth: `require_admin`

Request body:
- `RegisterStudentCommandDTO`

Response:
- `201 Created` -> `ApiResponse<StudentPublic>`

Errors:
- `401`, `403`, `404`, `422`

`404` occurs if `parent_id` is provided but the parent does not exist.

### 4) Update student profile
**PATCH** `/api/v1/crm/students/{student_id}`  
Auth: `require_admin`

Path params:
- `student_id` (integer, required)

Request body:
- `UpdateStudentDTO`

Response:
- `200 OK` -> `ApiResponse<StudentPublic>`

Errors:
- `401`, `403`, `404`, `422`

### 5) Get all parents linked to a student
**GET** `/api/v1/crm/students/{student_id}/parents`  
Auth: `require_any`

Path params:
- `student_id` (integer, required)

Response:
- `200 OK` -> `ApiResponse<list<ParentPublic>>`

Errors:
- `401`, `403`, `404`, `422`

### 6) Get all siblings of a student
**GET** `/api/v1/crm/students/{student_id}/siblings`  
Auth: `require_any`

Path params:
- `student_id` (integer, required)

Response:
- `200 OK` -> `ApiResponse<list<SiblingInfo>>`

Errors:
- `401`, `403`, `404`, `422`

### 7) Delete student (soft delete)
**DELETE** `/api/v1/crm/students/{student_id}`  
Auth: `require_admin`

Path params:
- `student_id` (integer, required)

Response:
- `200 OK` -> `ApiResponse<None>`

Errors:
- `401`, `403`, `404`, `422`

Example success response:
```json
{
  "success": true,
  "data": null,
  "message": "Student deleted successfully."
}
```

---

## Router Notes

- This router exposes **7 endpoint signatures**.
- Student delete is soft-delete behavior in service (`is_active = false`).
- Siblings endpoint is declared as `SiblingInfo`, but repository output keys differ (`sibling_id`, `sibling_name`), so runtime serialization should be validated in integration tests.
