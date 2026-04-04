# CRM (Customer Relationship Management) API Reference

Base path: `/api/v1/crm`

---

## 🔐 Authentication
All requests MUST include a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

---

## Schemas

### ParentPublic
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

### ParentListItem
```json
{
  "id": 1,
  "full_name": "Ahmed Mohamed",
  "phone_primary": "01123456789"
}
```

### RegisterParentInput
```json
{
  "full_name": "string (required)",
  "phone_primary": "string (required, validated)",
  "phone_secondary": "string (optional)",
  "email": "string (optional)",
  "relation": "string (optional)",
  "notes": "string (optional)"
}
```

### UpdateParentDTO
```json
{
  "full_name": "string (optional)",
  "phone_primary": "string (optional)",
  "phone_secondary": "string (optional)",
  "email": "string (optional)",
  "relation": "string (optional)",
  "notes": "string (optional)"
}
```

### StudentPublic
```json
{
  "id": 1,
  "full_name": "Omar Mohamed",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "phone": "01123456789",
  "is_active": true,
  "notes": "Allergic to peanuts"
}
```

### StudentListItem
```json
{
  "id": 1,
  "full_name": "Omar Mohamed",
  "phone": "01123456789",
  "is_active": true
}
```

### RegisterStudentDTO
```json
{
  "full_name": "string (required)",
  "date_of_birth": "date (optional) - YYYY-MM-DD",
  "gender": "string (optional) - male|female",
  "phone": "string (optional)",
  "notes": "string (optional)"
}
```

### UpdateStudentDTO
```json
{
  "full_name": "string (optional)",
  "date_of_birth": "date (optional) - YYYY-MM-DD",
  "gender": "string (optional)",
  "phone": "string (optional)",
  "notes": "string (optional)",
  "is_active": "boolean (optional)"
}
```

### RegisterStudentCommandDTO
```json
{
  "student_data": {
    "full_name": "string (required)",
    "date_of_birth": "date (optional)",
    "gender": "string (optional)",
    "phone": "string (optional)",
    "notes": "string (optional)"
  },
  "parent_id": "integer (optional)",
  "relationship": "string (optional)",
  "created_by_user_id": "integer (optional)"
}
```

### FindOrCreateParentInput
```json
{
  "full_name": "string (required)",
  "phone_primary": "string (required, validated)",
  "phone_secondary": "string (optional)",
  "email": "string (optional)",
  "relation": "string (optional)",
  "notes": "string (optional)"
}
```

### FindOrCreateParentResponse
```json
{
  "data": {
    "id": 1,
    "full_name": "Ahmed Mohamed",
    "phone_primary": "01123456789",
    "phone_secondary": "01234567890",
    "email": "ahmed@example.com",
    "relation": "Father",
    "notes": "Primary contact for Omar"
  },
  "created": true,
  "message": "Parent created successfully."
}
```

### SiblingInfo
```json
{
  "student_id": 2,
  "full_name": "Ali Mohamed",
  "age": 12,
  "parent_id": 1,
  "parent_name": "Ahmed Mohamed"
}
```

### PaginatedResponse (Envelope)
```json
{
  "success": true,
  "data": [],
  "total": 0,
  "skip": 0,
  "limit": 50
}
```

### ApiResponse (Envelope)
```json
{
  "success": true,
  "data": {},
  "message": null
}
```

---

## Endpoints

### Parents

#### 1. List / search parents
**GET** `/api/v1/crm/parents`

**Query Parameters:**
- `q` - string (optional) - Search query
- `skip` - integer (optional) - Pagination offset
- `limit` - integer (optional) - Page size

**Response (200):** `PaginatedResponse<ParentListItem>`

**Error Response (422):** `HTTPValidationError`

---

#### 2. Register a new parent
**POST** `/api/v1/crm/parents`

**Request Body:** `RegisterParentInput`

**Response (201):** `ApiResponse<ParentPublic>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Phone number is validated and normalized
- Creates new parent record with audit metadata

---

#### 3. Get parent by ID
**GET** `/api/v1/crm/parents/{parent_id}`

**Path Parameters:**
- `parent_id` - integer (required)

**Response (200):** `ApiResponse<ParentPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 4. Update parent profile
**PATCH** `/api/v1/crm/parents/{parent_id}`

**Path Parameters:**
- `parent_id` - integer (required)

**Request Body:** `UpdateParentDTO`

**Response (200):** `ApiResponse<ParentPublic>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Partial update - only provided fields are updated
- Phone validation applies if `phone_primary` is provided

---

#### 5. Find or create parent
**POST** `/api/v1/crm/parents/find-or-create`

**Request Body:** `FindOrCreateParentInput`

**Response (201):** `FindOrCreateParentResponse`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Checks if parent exists by phone_primary
- Returns existing parent with `created: false` if found
- Creates new parent with `created: true` if not found
- Use for student registration workflow to prevent duplicates

---

#### 6. Get all students linked to a parent
**GET** `/api/v1/crm/parents/{parent_id}/students`

**Path Parameters:**
- `parent_id` - integer (required)

**Response (200):** `ApiResponse<list<StudentPublic>>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Returns all students linked to the parent
- Empty list if parent has no linked students

---

### Students

#### 7. List / search students
**GET** `/api/v1/crm/students`

**Query Parameters:**
- `q` - string (optional) - Search query
- `skip` - integer (optional) - Pagination offset
- `limit` - integer (optional) - Page size

**Response (200):** `PaginatedResponse<StudentListItem>`

**Error Response (422):** `HTTPValidationError`

---

#### 8. Register a new student
**POST** `/api/v1/crm/students`

**Request Body:** `RegisterStudentCommandDTO`

**Response (201):** `ApiResponse<StudentPublic>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Creates student record and optionally links to parent
- Sets audit metadata (created_by_user_id)

---

#### 9. Get student by ID
**GET** `/api/v1/crm/students/{student_id}`

**Path Parameters:**
- `student_id` - integer (required)

**Response (200):** `ApiResponse<StudentPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 10. Update student profile
**PATCH** `/api/v1/crm/students/{student_id}`

**Path Parameters:**
- `student_id` - integer (required)

**Request Body:** `UpdateStudentDTO`

**Response (200):** `ApiResponse<StudentPublic>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Partial update - only provided fields are updated
- `date_of_birth` accepts ISO date string or datetime

---

#### 11. Get all parents linked to a student
**GET** `/api/v1/crm/students/{student_id}/parents`

**Path Parameters:**
- `student_id` - integer (required)

**Response (200):** `ApiResponse<list<ParentPublic>>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Returns all parent records linked to the student
- Empty list if student has no linked parents

---

#### 12. Get all siblings of a student
**GET** `/api/v1/crm/students/{student_id}/siblings`

**Path Parameters:**
- `student_id` - integer (required)

**Response (200):** `ApiResponse<list<SiblingInfo>>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Returns all students sharing the same parent(s)
- Excludes the queried student from results
- Useful for sibling discount detection

---

#### 13. Delete student (soft delete)
**DELETE** `/api/v1/crm/students/{student_id}`

**Path Parameters:**
- `student_id` - integer (required)

**Response (200):** `ApiResponse<None>`

**Error Response (404):** Student not found

**Notes:**
- Soft delete - sets is_active to false
- Student history is preserved
- Requires admin role
