# Data Model: Certificates Page

**Date**: 2026-07-29 | **Phase**: 1 — Design & Contracts

## Entity: Certificate

A course completion record managed by the external certificates microservice.

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `id` | `number` | ✅ | API | Internal DB ID |
| `cert_id` | `string` | ✅ | API | Public ID, e.g. `TKTF-HTM-20260728-ABCD` |
| `student_name` | `string` | ✅ | API | Full name |
| `course_name` | `string` | ✅ | API | Resolved display name, e.g. "HTML — Web Structure" |
| `course_track` | `string` | ✅ | API | Track key, e.g. `html` |
| `level` | `string` | ✅ | API | e.g. "Level 1 — Junior" |
| `issue_date` | `string` (date) | ✅ | API | YYYY-MM-DD |
| `branch` | `string` | ✅ | API | e.g. "Heliopolis" |
| `instructor` | `string \| null` | ❌ | API | Optional |
| `director` | `string \| null` | ❌ | API | Optional |
| `custom_color` | `string (hex) \| null` | ❌ | API | Optional hex override |
| `revoked_at` | `string (datetime) \| null` | ❌ | API | Null = Active |
| `revoked_reason` | `string \| null` | ❌ | API | Null unless revoked |
| `created_at` | `string (datetime)` | ✅ | API | Server timestamp |

### Derived/Computed Fields (frontend)

| Field | Type | Logic |
|-------|------|-------|
| `status` | `'Active' \| 'Revoked'` | `revoked_at === null ? 'Active' : 'Revoked'` |

### State Transitions

```
[Generate] → Active → [Revoke] → Revoked (permanent)
```

No other transitions. No re-activation. No re-issuance.

## Entity: CreateCertificateInput (Form Payload)

| Field | Type | Required | Source |
|-------|------|----------|--------|
| `student_name` | `string` | ✅ | Student search selection or manual |
| `course_track` | `string` | ✅ | Track dropdown (13 options) |
| `level` | `string` | ✅ | Level dropdown (3 options) |
| `issue_date` | `string` (date) | ✅ | Date picker, defaults to today |
| `branch` | `string` | ✅ | Auto-filled from student enrollment or manual |
| `instructor` | `string \| null` | ❌ | Optional text input |
| `director` | `string \| null` | ❌ | Optional text input |
| `custom_color` | `string (hex) \| null` | ❌ | Optional color picker |

## Entity: CertificateVerifyResponse (Public Verify)

| Field | Type | Notes |
|-------|------|-------|
| `cert_id` | `string` | |
| `student_name` | `string` | |
| `course_name` | `string` | |
| `level` | `string` | |
| `issue_date` | `string` (date) | |
| `branch` | `string` | |
| `instructor` | `string \| null` | |
| `director` | `string \| null` | |
| `revoked` | `boolean` | True if revoked |
| `revoked_reason` | `string \| null` | |

## API Response Envelopes (from certs microservice)

### List Response
```typescript
interface CertificatesListResponse {
  success: boolean
  data: CertificateDTO[]
  total: number
  skip: number
  limit: number
}
```

### Single Response
```typescript
interface CertificateResponse {
  success: boolean
  data: CertificateDTO
  message: string | null
}
```

### Create Response
```typescript
interface CreateCertificateResponse {
  success: boolean
  data: CertificateDTO
  message: string  // "Certificate generated successfully"
}
```

### Revoke Response
```typescript
interface RevokeCertificateResponse {
  success: boolean
  data: {
    id: number
    cert_id: string
    revoked_at: string
    revoked_reason: string
  }
  message: string
}
```

## React Query Cache Keys

```typescript
// In queryKeys.ts
certificates: {
  all: ['certificates'] as const,
  list: (params?: CertificatesQueryParams) => ['certificates', 'list', params] as const,
  detail: (certId: string) => ['certificates', certId] as const,
}

// Query params type
interface CertificatesQueryParams {
  page?: number
  page_size?: number
  search?: string
  track?: string
  include_revoked?: boolean
}
```

## Component State (local useState)

| Component | State | Type |
|-----------|-------|------|
| `CertificatesPage` | `isGenerateOpen` | `boolean` |
| `CertificatesPage` | `isDetailOpen` | `boolean` |
| `CertificatesPage` | `selectedCertId` | `string \| null` |
| `CertificatesPage` | `isRevokeOpen` | `boolean` |
| `CertificatesPage` | `revokeTarget` | `CertificateDTO \| null` |
| `useCertificates` | pagination, search, filters | URL params or query args |

## Role-Based UI Mapping

| Action | Admin | Instructor |
|--------|-------|------------|
| View list | ✅ | ✅ |
| Search/filter | ✅ | ✅ |
| Download PDF | ✅ | ✅ |
| Download HTML | ✅ | ✅ |
| View detail modal | ✅ | ✅ |
| Generate certificate | ✅ | ❌ hidden |
| Revoke certificate | ✅ | ❌ hidden |
| Export CSV | ✅ | ❌ hidden |
