# Techno Terminal - Frontend API Reference

This document serves as the official API reference for the frontend integration of the Techno Terminal Web Application. It outlines the essential endpoints, expected payloads, and responses necessary for building the React frontend.

---

## 🔐 Global Authentication

Except for the login endpoint, all API requests **must** include a Bearer token in the `Authorization` header. This token is retrieved upon a successful login.

**Header Format:**
```http
Authorization: Bearer <access_token>
```

**Common Error Responses:**
- `401 Unauthorized`: Token is missing, expired, or invalid.
- `403 Forbidden`: Authenticated user does not have the required role (must be `admin` or `system_admin`).
- `422 Unprocessable Entity`: Validation error in the request body, path, or query parameters.

---

## 1. Authentication

### 1.1 Login
Authenticate a user and retrieve a JWT token.
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/login`
- **Used In**: `LoginPage`, `Dashboard`, & `Academics`
- **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "role": "admin",
        "full_name": "John Doe"
      }
    }
  }
  ```

---

## 2. Academics (Dashboard & Groups)

### 2.1 Get Daily Schedule
Retrieves the schedule for a specific date, used for populating the daily dashboard.
- **Method**: `GET`
- **Endpoint**: `/api/v1/academics/sessions/daily-schedule`
- **Used In**: `DashboardPage`
- **Query Parameters**:
  - `date` (string, required): Format `YYYY-MM-DD`
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "session_id": "uuid",
        "group_id": "uuid",
        "group_name": "Robotics A1",
        "course_name": "Lego Spike",
        "instructor_name": "Jane Smith",
        "scheduled_time": "14:00:00",
        "end_time": "16:00:00",
        "session_notes": "Room 1",
        "active_student_count": 12
      }
    ]
  }
  ```

### 2.2 List Groups
List active academic groups.
- **Method**: `GET`
- **Endpoint**: `/api/v1/academics/groups`
- **Used In**: `GroupsPage`
- **Query Parameters**:
  - `day` (string, optional): Filter by day name (e.g., `Saturday`)
- **Response** (JSON - `200 OK`):
  Array of Group list objects (wrapped in standard response).

### 2.3 Get Group Details
Retrieve detailed information for a specific group.
- **Method**: `GET`
- **Endpoint**: `/api/v1/academics/groups/{id}`
- **Used In**: `GroupDetailPage`
- **Path Parameters**:
  - `id` (uuid, required): Group ID
- **Response** (JSON - `200 OK`):
  ```json
  {
    "id": "uuid",
    "name": "Robotics A1",
    "course_name": "Lego Spike",
    "instructor_name": "Jane Smith",
    "student_count": 12,
    "level": 1,
    "schedule_time": "Saturday 14:00"
  }
  ```

### 2.4 Get Group Sessions
Retrieve a list of sessions associated with a specific group.
- **Method**: `GET`
- **Endpoint**: `/api/v1/academics/groups/{id}/sessions`
- **Used In**: `GroupDetailPage`
- **Response** (JSON - `200 OK`):
  ```json
  [
    {
      "id": "uuid",
      "group_id": "uuid",
      "date": "YYYY-MM-DD",
      "start_time": "14:00:00",
      "end_time": "16:00:00",
      "instructor_name": "Jane Smith",
      "status": "scheduled",
      "attendance_marked": false,
      "notes": ""
    }
  ]
  ```

### 2.5 Get Group Progress Level
Retrieve the current academic progression state for a group.
- **Method**: `GET`
- **Endpoint**: `/api/v1/academics/groups/{id}/progress-level`
- **Used In**: `GroupDetailPage`
- **Response** (JSON - `200 OK`):
  ```json
  {
    "current_module": "Sensors Intro",
    "description": "Learning touch and color sensors",
    "group_score": 85,
    "target_score": 100,
    "is_completed": false,
    "ready_for_next_level": false
  }
  ```

---

## 3. Attendance

### 3.1 Get Session Attendance Data
Fetch the roster of students for a particular session to record attendance.
- **Method**: `GET`
- **Endpoint**: `/api/v1/attendance/session/{id}`
- **Used In**: `AttendanceGrid`
- **Path Parameters**:
  - `id` (uuid, required): Session ID
- **Response** (JSON - `200 OK`):
  ```json
  {
    "students": [
      {
        "student_id": "uuid",
        "student_name": "Alice Johnson",
        "status": "unmarked",
        "notes": ""
      }
    ]
  }
  ```

### 3.2 Mark Session Attendance
Submit a batch of attendance records for a session.
- **Method**: `POST`
- **Endpoint**: `/api/v1/attendance/session/{id}/mark`
- **Used In**: `AttendanceGrid`
- **Path Parameters**:
  - `id` (uuid, required): Session ID
- **Request Body** (JSON):
  ```json
  [
    {
      "student_id": "uuid",
      "status": "present" 
    }
  ]
  ```
  *(Valid statuses usually include: `present`, `absent`, `late`, `excused`)*
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true
  }
  ```

---

## 4. CRM - Students Directory

### 4.1 Search / List Students
Fetch a paginated list of students or search by name.
- **Method**: `GET`
- **Endpoint**: `/api/v1/crm/students`
- **Used In**: `DirectoryPage`, `StudentList`
- **Query Parameters**:
  - `skip` (integer, default: 0)
  - `limit` (integer, default: 15)
  - `name` (string, optional): Use for search filtering
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "full_name": "Alice Johnson",
        "birth_date": "YYYY-MM-DD",
        "gender": "F",
        "phone": "+123456789",
        "is_active": true,
        "notes": ""
      }
    ]
  }
  ```

### 4.2 Get Student Details
Fetch the full profile of a student including parents, enrollments, and financial balance.
- **Method**: `GET`
- **Endpoint**: `/api/v1/crm/students/{id}`
- **Used In**: `StudentDetailPage`
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "full_name": "Alice Johnson",
      "birth_date": "YYYY-MM-DD",
      "gender": "F",
      "phone": "+123456789",
      "is_active": true,
      "notes": "",
      "parents": [],
      "enrollments": [],
      "balance": 0.00
    }
  }
  ```

### 4.3 Create Student
Create a new student profile.
- **Method**: `POST`
- **Endpoint**: `/api/v1/crm/students`
- **Used In**: `(future: Create student)`
- **Request Body** (JSON):
  ```json
  {
    "full_name": "Bob Smith",
    "birth_date": "YYYY-MM-DD",
    "gender": "M",
    "phone": "+123456789",
    "is_active": true,
    "notes": "Allergies: None"
  }
  ```
  *(Note: Optional fields are `birth_date`, `gender`, `phone`, `notes`)*
- **Response** (JSON - `201 Created` / `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "new_uuid",
      "full_name": "Bob Smith"
    }
  }
  ```

---

## 5. CRM - Parents Directory

### 5.1 Search / List Parents
Fetch a paginated list of parents or search by name.
- **Method**: `GET`
- **Endpoint**: `/api/v1/crm/parents`
- **Used In**: `DirectoryPage`, `ParentList`
- **Query Parameters**:
  - `skip` (integer, default: 0)
  - `limit` (integer, default: 15)
  - `name` (string, optional): Use for search filtering
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "full_name": "Mr. Johnson",
        "phone": "+123456789",
        "email": "parent@example.com",
        "address": "123 Main St",
        "is_active": true
      }
    ]
  }
  ```

### 5.2 Get Parent Details
- **Method**: `GET`
- **Endpoint**: `/api/v1/crm/parents/{id}`
- **Used In**: `ParentDetailPage`
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "full_name": "Mr. Johnson",
      "phone": "+123456789",
      "email": "parent@example.com",
      "address": "123 Main St",
      "is_active": true
    }
  }
  ```

### 5.3 Create Parent
- **Method**: `POST`
- **Endpoint**: `/api/v1/crm/parents`
- **Used In**: `(future: Create parent)`
- **Request Body** (JSON):
  ```json
  {
    "full_name": "Mrs. Smith",
    "phone": "+987654321",
    "email": "smith@example.com",
    "address": "456 Elm St",
    "is_active": true
  }
  ```
  *(Note: Optional fields are `phone`, `email`, `address`)*
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "new_uuid"
    }
  }
  ```

---

## 6. Enrollments (Phase 5 - Pending)

### 6.1 Get Student Enrollments
- **Method**: `GET`
- **Endpoint**: `/api/v1/enrollments/student/{id}`
- **Used In**: `StudentDetailPage`
- **Path Parameters**:
  - `id` (uuid, required): Student ID
- **Response** (JSON - `200 OK`): Returns a list array of the student's enrollments.

### 6.2 Create Enrollment
Enroll a student into a group level with tracking of financial obligations.
- **Method**: `POST`
- **Endpoint**: `/api/v1/enrollments`
- **Used In**: `EnrollmentsPage`
- **Request Body** (JSON):
  ```json
  {
    "student_id": "uuid",
    "group_id": "uuid",
    "level": 1,
    "amount_due": 150.00,
    "discount": 0.00,
    "notes": "Early bird registration"
  }
  ```
  *(Note: Optional fields are `discount`, `notes`)*
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "new_enrollment_uuid"
    }
  }
  ```

### 6.3 Transfer Enrollment
Transfer a student's active enrollment to a new group.
- **Method**: `POST`
- **Endpoint**: `/api/v1/enrollments/transfer`
- **Used In**: `EnrollmentsPage`
- **Request Body** (JSON):
  ```json
  {
    "enrollment_id": "uuid",
    "new_group_id": "uuid"
  }
  ```
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true
  }
  ```

### 6.4 Delete/Drop Enrollment
- **Method**: `DELETE`
- **Endpoint**: `/api/v1/enrollments/{id}`
- **Used In**: `EnrollmentsPage`
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true
  }
  ```

---

## 7. Finance (Phase 6 - Pending)

### 7.1 Get Student Balance
Retrieve the active financial balance (credit/debt) for a specific student. Negative values represent debt.
- **Method**: `GET`
- **Endpoint**: `/api/v1/finance/balance/student/{id}`
- **Used In**: `StudentDetailPage`
- **Response** (JSON - `200 OK`):
  ```json
  {
    "balance": -50.00
  }
  ```

### 7.2 Get Receipts List
- **Method**: `GET`
- **Endpoint**: `/api/v1/finance/receipts`
- **Used In**: `FinancePage`
- **Query Parameters**:
  - `from_date` (string, optional): `YYYY-MM-DD`
  - `to_date` (string, optional): `YYYY-MM-DD`
- **Response** (JSON - `200 OK`): Array of receipt objects.

### 7.3 Create Receipt
Process a payment and tie it to a new receipt structure.
- **Method**: `POST`
- **Endpoint**: `/api/v1/finance/receipts`
- **Used In**: `FinancePage`
- **Request Body** (JSON):
  ```json
  {
    "payer_name": "Mr. Johnson",
    "student_id": "uuid",
    "items": [
      {
         "type": "course_level",
         "amount": 100.00,
         "description": "Level 1 payment"
      }
    ]
  }
  ```
  *(Note: Optional fields are `payer_name`, `student_id`)*
- **Response** (JSON - `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "receipt_uuid"
    }
  }
  ```

### 7.4 Preview Risk
Evaluate the risk profile for a drafted receipt/payment.
- **Method**: `POST`
- **Endpoint**: `/api/v1/finance/receipts/preview-risk`
- **Used In**: `FinancePage`
- **Request Body** (JSON): Receipt data payload.
- **Response** (JSON - `200 OK`):
  Returns a risk assessment object detailing validation and financial risks.

### 7.5 Download Receipt PDF
- **Method**: `GET`
- **Endpoint**: `/api/v1/finance/receipts/{id}/pdf`
- **Used In**: `FinancePage`
- **Important Notes for Frontend Integration**: 
  - This endpoint returns an `application/pdf` binary stream, not a standard JSON object.
  - The response will include a `Content-Disposition: attachment` header.
  - Ensure your frontend HTTP client (e.g., `axios` or `fetch`) is configured to process a `blob` response type, and use a library like `file-saver` or standard browser object URLs to trigger the download prompt.
