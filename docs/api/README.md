# Techno Terminal — API Documentation Index

Complete API reference split by domain. All endpoints require Bearer token authentication unless noted.

---

## Authentication

```http
Authorization: Bearer <access_token>
```

Get token via `POST /api/v1/auth/login`

---

## API Modules — Main Backend

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| **Academics** | `/api/v1/academics` | 16 |
| **Analytics** | `/api/v1/analytics` | 20 |
| **Attendance** | `/api/v1/attendance` | 2 |
| **Authentication** | `/api/v1/auth` | 6 |
| **CRM** | `/api/v1/crm` | 25 |
| **Competitions** | `/api/v1/competitions` | 8 |
| **Dashboard** | `/api/v1/dashboard` | 1 |
| **Enrollments** | `/api/v1/enrollments` | 4 |
| **Finance** | `/api/v1/finance` | 16 |
| **HR** | `/api/v1/hr` | 9 |
| **Notifications** | `/api/v1/notifications` | 7 |
| **Reports** | `/api/v1/notifications/reports` | 6 |
| **Tasks** | `/api/v1/tasks` | 10 |
| **Teams** | `/api/v1/teams` | 11 |
| **Health** | `/` | 1 |

**Main Backend Total: ~142 Endpoints**

### Certificates API (Separate Backend)

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| **Certificates** | `/api/v1/certificates` | 4 |

> **Note**: The certificates API runs on a separate backend (`techno-future-certs.fastapicloud.dev`) with its own `certsClient`. No Bearer token injection, no 401 refresh queue.

**Grand Total: ~146 Endpoints**

---

## Endpoints by Domain

### Authentication (`/api/v1/auth`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | User authentication |
| `/auth/refresh` | POST | Refresh JWT token |
| `/auth/logout` | POST | Logout |
| `/auth/me` | GET | Current user profile |
| `/auth/users` | POST | Create user (admin) |
| `/auth/users/{id}/reset-password` | POST | Reset password |

### Dashboard (`/api/v1/dashboard`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dashboard/daily-overview` | GET | Daily overview with groups, sessions, roster, attendance |

### Academics — Courses (`/api/v1/academics`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/academics/courses` | GET | List courses |
| `/academics/courses` | POST | Create course |
| `/academics/courses/search` | GET | Search courses |
| `/academics/courses/stats` | GET | All course stats |
| `/academics/courses/{id}` | GET | Course details |
| `/academics/courses/{id}` | PATCH | Update course |
| `/academics/courses/{id}` | DELETE | Delete course |
| `/academics/courses/{id}/stats` | GET | Single course stats |

### Academics — Groups (`/api/v1/academics`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/academics/groups` | GET | List groups |
| `/academics/groups` | POST | Create group |
| `/academics/groups/{id}` | GET | Group details |
| `/academics/groups/{id}` | PATCH | Update group |
| `/academics/groups/{id}/sessions` | GET | Group sessions |
| `/academics/groups/{id}/progress-level` | POST | Advance level |
| `/academics/groups/{id}/attendance` | GET | Group attendance by level |

### Academics — Sessions (`/api/v1/academics`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/academics/sessions` | POST | Create session |
| `/academics/sessions/{id}` | GET | Session details |
| `/academics/sessions/{id}` | PATCH | Update session |
| `/academics/sessions/{id}` | DELETE | Delete session |

### Analytics (`/api/v1/analytics`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/analytics/dashboard/summary` | GET | KPI cards |
| **Academic** | | |
| `/analytics/academics/unpaid-attendees` | GET | Unpaid alert badges |
| `/analytics/academics/groups/{id}/roster` | GET | Group roster |
| `/analytics/academics/groups/{id}/heatmap` | GET | Attendance heatmap |
| `/analytics/academics/student-progress` | GET | Student progress data |
| `/analytics/academics/course-completion` | GET | Course completion rates |
| **BI** | | |
| `/analytics/bi/enrollment-trend` | GET | Enrollment trend chart |
| `/analytics/bi/instructor-performance` | GET | Instructor stats |
| `/analytics/bi/retention` | GET | Retention metrics |
| `/analytics/bi/retention-funnel` | GET | Retention funnel |
| `/analytics/bi/instructor-value` | GET | Instructor value matrix |
| `/analytics/bi/schedule-utilization` | GET | Schedule utilization |
| `/analytics/bi/flight-risk` | GET | Flight risk students |
| `/analytics/bi/retention-analysis` | GET | Retention analysis |
| **Financial** | | |
| `/analytics/finance/revenue-by-date` | GET | Revenue trend |
| `/analytics/finance/revenue-by-method` | GET | Payment methods breakdown |
| `/analytics/finance/outstanding-by-group` | GET | Group debts |
| `/analytics/finance/top-debtors` | GET | Debtor list |
| `/analytics/finance/revenue-metrics` | GET | Revenue metrics |
| `/analytics/finance/revenue-forecast` | GET | Revenue forecast |
| **Competition** | | |
| `/analytics/competitions/fee-summary` | GET | Competition fee summary |

### Attendance (`/api/v1/attendance`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/attendance/session/{id}` | GET | Current attendance for session |
| `/attendance/session/{id}/mark` | POST | Save attendance (batch) |

### CRM — Parents (`/api/v1/crm`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/crm/parents` | GET | List/search parents |
| `/crm/parents` | POST | Register parent |
| `/crm/parents/{id}` | GET | Parent details |
| `/crm/parents/{id}` | PATCH | Update parent |
| `/crm/parents/{id}` | DELETE | Delete parent |

### CRM — Students (`/api/v1/crm`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/crm/students` | GET | List/search students |
| `/crm/students` | POST | Register student |
| `/crm/students/grouped` | GET | Students grouped by criteria |
| `/crm/students/filter` | GET | Filtered student list |
| `/crm/students/waiting-list` | GET | Waiting list |
| `/crm/students/{id}` | GET | Student details |
| `/crm/students/{id}` | PATCH | Update student |
| `/crm/students/{id}/details` | GET | Full student details |
| `/crm/students/{id}/soft` | DELETE | Soft delete |
| `/crm/students/{id}/restore` | POST | Restore deleted |
| `/crm/students/{id}/hard` | DELETE | Hard delete |
| `/crm/students/{id}/parents` | GET | Student's parents |
| `/crm/students/{id}/parents/{parentId}` | POST | Link parent |
| `/crm/students/{id}/parents/{parentId}` | DELETE | Unlink parent |
| `/crm/students/{id}/payments` | GET | Student payments |
| `/crm/students/{id}/siblings` | GET | Student siblings |
| `/crm/students/{id}/status` | PATCH | Update status |
| `/crm/students/{id}/waiting-priority` | SET | Set waiting priority |
| `/crm/students/{id}/status-history` | GET | Status history |
| `/crm/students/{id}/attendance-history` | GET | Attendance history |
| `/crm/students/{id}/history` | GET | Activity history |
| `/crm/students/{id}/activity-summary` | GET | Activity summary |
| `/crm/students/{id}/enrollment-history` | GET | Enrollment history |
| `/crm/students/{id}/log-activity` | POST | Log activity |
| `/crm/students/{id}/log-activity/{activityId}` | PATCH | Update activity |
| `/crm/students/{id}/log-activity/{activityId}` | DELETE | Delete activity |
| `/crm/students/{id}/competitions` | GET | Student competitions |
| `/crm/admin/deleted-students` | GET | Deleted students (admin) |

### Competitions (`/api/v1/competitions`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/competitions` | GET | List competitions |
| `/competitions` | POST | Create competition |
| `/competitions/{id}` | GET | Competition details |
| `/competitions/{id}/categories` | GET | List categories |
| `/competitions/{id}/categories` | POST | Add category |
| `/competitions/register` | POST | Register team |
| `/competitions/{comp_id}/categories/{cat_id}/teams` | GET | List teams |
| `/competitions/team-members/{id}/pay` | POST | Mark fee paid |

### Enrollments (`/api/v1/enrollments`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/enrollments` | POST | Enroll student |
| `/enrollments/{id}` | DELETE | Drop enrollment |
| `/enrollments/transfer` | POST | Transfer student |
| `/enrollments/student/{id}` | GET | Enrollment history |

### Finance (`/api/v1/finance`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| **Receipts** | | |
| `/finance/receipts` | POST | Create receipt |
| `/finance/receipts` | GET | Search receipts |
| `/finance/receipts/{id}` | GET | Receipt details |
| `/finance/receipts/{id}/pdf` | GET | Download PDF |
| `/finance/receipts/{id}/generate` | GET | Generate receipt text |
| `/finance/receipts/{id}/mark-sent` | POST | Mark as sent |
| `/finance/receipts/batch-generate` | POST | Batch generate receipts |
| **Refunds** | | |
| `/finance/refunds` | POST | Issue refund |
| `/finance/refunds/preview-risk` | POST | Preview refund risk |
| `/finance/risk/overpayment` | POST | Check overpayment risk |
| **Balance** | | |
| `/students/{id}/balance` | GET | Student balance |
| `/students/{id}/balance/enrollments/{eid}` | GET | Enrollment balance |
| `/students/{id}/balance/adjust` | POST | Adjust balance |
| `/balance/unpaid-enrollments` | GET | Unpaid enrollments |
| **Competition Fees** | | |
| `/finance/competition-fees` | GET | Unpaid competition fees |
| **Reporting** | | |
| `/finance/reports/daily-collections` | GET | Daily collections |
| `/finance/reports/daily-receipts` | GET | Daily receipts |

### HR (`/api/v1/hr`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/hr/employees` | GET | List employees |
| `/hr/employees` | POST | Create employee |
| `/hr/employees/{id}` | GET | Employee details |
| `/hr/employees/{id}` | PUT | Update employee |
| `/hr/employees/{id}` | DELETE | Soft delete employee |
| `/hr/employees/{id}/restore` | POST | Restore employee |
| `/hr/employees/{id}/create-account` | POST | Create staff account |
| `/hr/staff-accounts` | GET | List staff accounts |

### Notifications (`/api/v1/notifications`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/notifications/admin/settings/me` | GET | Get admin notification settings |
| `/notifications/admin/settings/me/types/{type}` | PUT | Toggle notification type |
| `/notifications/admin/settings/me/additional-recipients` | POST | Add recipient |
| `/notifications/admin/settings/me/additional-recipients/{id}` | PUT | Update recipient |
| `/notifications/admin/settings/me/additional-recipients/{id}` | DELETE | Delete recipient |
| `/notifications/logs` | GET | Notification logs |
| `/notifications/logs/{id}/retry` | POST | Retry failed notification |

### Reports (`/api/v1/notifications/reports`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/notifications/reports/daily/data` | GET | Daily report data |
| `/notifications/reports/daily` | POST | Generate/send daily report PDF |
| `/notifications/reports/weekly/data` | GET | Weekly report data |
| `/notifications/reports/weekly` | POST | Send weekly report email |
| `/notifications/reports/monthly/data` | GET | Monthly report data |
| `/notifications/reports/monthly` | POST | Send monthly report email |

### Tasks (`/api/v1/tasks`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tasks` | GET | List tasks |
| `/tasks` | POST | Create task |
| `/tasks/{id}` | GET | Task details |
| `/tasks/{id}` | PATCH | Update task |
| `/tasks/{taskId}/subtasks` | POST | Add subtask |
| `/tasks/subtasks/{subtaskId}` | PATCH | Update subtask |
| `/tasks/subtasks/{subtaskId}` | DELETE | Delete subtask |
| `/tasks/{taskId}/comments` | POST | Add comment |
| `/tasks/comments/{commentId}` | DELETE | Delete comment |
| `/tasks/{taskId}/time-logs` | POST | Add time log |

### Teams (`/api/v1/teams`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/teams` | GET | List teams |
| `/teams` | POST | Register team |
| `/teams/{id}` | GET | Team details |
| `/teams/{id}` | PATCH | Update team |
| `/teams/{id}` | DELETE | Delete team |
| `/teams/{id}/members` | GET | Team members |
| `/teams/{id}/members` | POST | Add member |
| `/teams/{id}/members/{studentId}` | DELETE | Remove member |
| `/teams/{id}/members/{studentId}/pay` | POST | Pay competition fee |
| `/teams/{id}/members/{studentId}/refund` | POST | Refund competition fee |
| `/teams/{id}/placement` | PATCH | Update placement |

### Certificates (`/api/v1/certificates`) — Separate Backend

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/certificates` | GET | List certificates |
| `/certificates` | POST | Create certificate |
| `/certificates/{id}/pdf` | GET | Download PDF |
| `/certificates/{id}/revoke` | POST | Revoke certificate |

---

## Quick Reference by Frontend Page

### Login
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | Authentication |

### Dashboard
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/dashboard/daily-overview` | GET | Groups, sessions, roster, attendance |

### Directory
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/crm/parents` | GET | List parents |
| `/api/v1/crm/students` | GET | List students |
| `/api/v1/crm/students/grouped` | GET | Grouped students |

### Group Detail
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/academics/groups/{id}` | GET | Group details |
| `/api/v1/academics/groups/{id}/sessions` | GET | Sessions |
| `/api/v1/academics/groups/{id}/attendance` | GET | Attendance by level |
| `/api/v1/analytics/academics/groups/{id}/roster` | GET | Roster |

### Attendance
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/attendance/session/{id}/mark` | POST | Save attendance |

### Student Detail
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/crm/students/{id}/details` | GET | Full profile |
| `/api/v1/crm/students/{id}/payments` | GET | Payments |
| `/api/v1/crm/students/{id}/siblings` | GET | Siblings |
| `/api/v1/crm/students/{id}/history` | GET | Activity history |
| `/api/v1/students/{id}/balance` | GET | Balance |

### Finance
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/finance/receipts` | POST | Create receipt |
| `/api/v1/finance/receipts` | GET | Search receipts |
| `/api/v1/finance/refunds` | POST | Issue refund |
| `/api/v1/balance/unpaid-enrollments` | GET | Unpaid enrollments |

### Reports
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/notifications/reports/daily/data` | GET | Daily report data |
| `/api/v1/notifications/reports/weekly/data` | GET | Weekly report data |
| `/api/v1/notifications/reports/monthly/data` | GET | Monthly report data |
| `/api/v1/analytics/finance/revenue-by-date` | GET | Revenue chart |

### Competitions
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/competitions` | GET | List competitions |
| `/api/v1/competitions/{id}` | GET | Details |
| `/api/v1/teams` | GET | List teams |

### Tasks
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/tasks` | GET | List tasks |
| `/api/v1/tasks` | POST | Create task |

### Notifications
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/notifications/admin/settings/me` | GET | Settings |
| `/api/v1/notifications/logs` | GET | Logs |

### Certificates
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/certificates` | GET | List certificates |
| `/api/v1/certificates` | POST | Create certificate |

---

## Common Response Envelopes

### Success Response (Single Item)
```json
{
  "success": true,
  "data": { ... },
  "message": null
}
```

### Success Response (Paginated List)
```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "skip": 0,
  "limit": 50
}
```

### Error Response
```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Student 123 not found"
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, PUT, DELETE |
| 201 | Created | Successful POST (new resource) |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business rule violation (e.g., duplicate enrollment) |
| 422 | Validation Error | Invalid request data |
| 500 | Server Error | Unexpected server error |
