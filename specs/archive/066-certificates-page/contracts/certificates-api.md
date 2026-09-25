# Certificates API Contract

**Service**: `https://techno-future-certs.fastapicloud.dev/api/v1`
**Base**: `https://techno-future-certs.fastapicloud.dev/api/v1`

## Endpoints

### List Certificates

```
GET /certificates
```

**Query Parameters**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number (≥ 1) |
| `page_size` | int | 20 | Items per page (1–100) |
| `search` | string | — | Search by student name or cert ID |
| `track` | string | — | Filter by track key |
| `include_revoked` | bool | false | Include revoked certificates |

**Response `200`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cert_id": "TKTF-HTM-20260728-ABCD",
      "student_name": "Ahmed Mohamed",
      "course_name": "HTML — Web Structure",
      "course_track": "html",
      "level": "Level 1 — Junior",
      "issue_date": "2026-07-28",
      "branch": "Heliopolis",
      "instructor": "Sara Ali",
      "director": "Khaled Hassan",
      "custom_color": null,
      "revoked_at": null,
      "revoked_reason": null,
      "created_at": "2026-07-28T12:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

**TypeScript**:
```typescript
interface CertificateDTO {
  id: number
  cert_id: string
  student_name: string
  course_name: string
  course_track: string
  level: string
  issue_date: string       // YYYY-MM-DD
  branch: string
  instructor: string | null
  director: string | null
  custom_color: string | null
  revoked_at: string | null  // ISO datetime or null
  revoked_reason: string | null
  created_at: string         // ISO datetime
}

interface CertificatesListResponse {
  success: boolean
  data: CertificateDTO[]
  total: number
  skip: number
  limit: number
}
```

---

### Generate Certificate

```
POST /certificates
```

**Request Body**:
```json
{
  "student_name": "Ahmed Mohamed",
  "course_track": "html",
  "level": "Level 1 — Junior",
  "issue_date": "2026-07-28",
  "branch": "Heliopolis",
  "instructor": "Sara Ali",
  "director": "Khaled Hassan",
  "custom_color": "#FF0000"
}
```

| Field | Type | Required |
|-------|------|----------|
| `student_name` | string | yes |
| `course_track` | string | yes |
| `level` | string | yes |
| `issue_date` | string (date) | yes |
| `branch` | string | yes |
| `instructor` | string | no |
| `director` | string | no |
| `custom_color` | string (hex) | no |

**Response `201`**: `CertificateResponse` with success message.

**Error `409`**: Duplicate certificate exists.

**Error `422`**: Validation error.

```typescript
interface CreateCertificateInput {
  student_name: string
  course_track: string
  level: string
  issue_date: string      // YYYY-MM-DD
  branch: string
  instructor?: string
  director?: string
  custom_color?: string   // hex, e.g. #FF0000
}

interface CertificateResponse {
  success: boolean
  data: CertificateDTO
  message: string | null
}
```

---

### Get / Verify Certificate (Public)

```
GET /certificates/{cert_id}
```

No auth required.

**Response `200`**:
```json
{
  "success": true,
  "data": {
    "cert_id": "TKTF-HTM-20260728-ABCD",
    "student_name": "Ahmed Mohamed",
    "course_name": "HTML — Web Structure",
    "level": "Level 1 — Junior",
    "issue_date": "2026-07-28",
    "branch": "Heliopolis",
    "instructor": "Sara Ali",
    "director": "Khaled Hassan",
    "revoked": false,
    "revoked_reason": null
  },
  "message": "Certificate verified"
}
```

**Response `404`**: Certificate not found.

---

### Download Certificate PDF

```
GET /certificates/{cert_id}/pdf
```

**Response `200`**: `Content-Type: application/pdf`, `Content-Disposition: attachment`

Filename: `{StudentName}_{CourseName}_{YYYYMMDD}.pdf`

---

### Download Certificate HTML

```
GET /certificates/{cert_id}/html
```

**Response `200`**: `Content-Type: text/html`, `Content-Disposition: attachment`

Filename: `{StudentName}_{CourseName}_{YYYYMMDD}.html`

---

### Revoke Certificate

```
POST /certificates/{cert_id}/revoke
```

**Request Body**:
```json
{
  "reason": "Issued in error — duplicate entry"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | yes |

**Response `200`**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cert_id": "TKTF-HTM-20260728-ABCD",
    "revoked_at": "2026-07-28T13:00:00Z",
    "revoked_reason": "Issued in error — duplicate entry"
  },
  "message": "Certificate revoked successfully"
}
```

**Error `409`**: Already revoked.

```typescript
interface RevokeCertificateInput {
  reason: string
}
```

---

### Export Certificates as CSV

```
GET /certificates/export
```

**Query Parameters**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `track` | string | — | Filter by track key |
| `search` | string | — | Search by student name or cert ID |
| `include_revoked` | bool | false | Include revoked |

**Response `200`**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename=certificates.csv`

---

## Track Keys

| Key | Display Name |
|-----|-------------|
| `html` | HTML — Web Structure |
| `css` | CSS — Styling & Layout |
| `javascript` | JavaScript — Interactivity |
| `python` | Python — Programming |
| `advanced` | Advanced — Web Pro |
| `problem_solving` | Problem Solving — Logic |
| `robotics-wedo` | Robotics WeDo 2.0 |
| `robotics-spike-essential` | Robotics SPIKE Essential |
| `robotics-spike-prime` | Robotics SPIKE Prime |
| `robotics-ev3` | Robotics EV3 |
| `robotics-arduino` | Robotics Arduino |
| `scratch` | Scratch |
| `scratch-jr` | Scratch Jr |

## Level Strings

- `Level 1 — Junior`
- `Level 2 — Intermediate`
- `Level 3 — Advanced`

## Cert ID Format

```
TKTF-{TRACK_PREFIX}-{YYYYMMDD}-{XXXX}
```

| Part | Description |
|------|-------------|
| `TKTF` | Static prefix |
| `HTM` / `CSS` / `PYT` etc. | Track abbreviation |
| `20260728` | Issue date (YYYYMMDD) |
| `ABCD` | Random 4-char hex suffix |
