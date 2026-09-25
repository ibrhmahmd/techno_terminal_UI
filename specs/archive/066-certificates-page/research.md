# Research: Certificates Page

**Date**: 2026-07-29 | **Phase**: 0 — Outline & Research

## 1. Certificates API Client Strategy

**Decision**: Create a dedicated Axios instance for the certificates microservice.

**Rationale**: The certificates API (`https://techno-future-certs.fastapicloud.dev/api/v1`) runs on a separate domain from the main app backend. A dedicated instance avoids adding proxy entries in `vite.config.ts` and `vercel.json`, and keeps the certificates API interaction self-contained.

**Implementation**: A new `createCertsClient()` factory in `src/api/certificates/certificates.ts` with:
- `baseURL` set to the full certs API URL
- No Bearer token injection (the certs service is public or uses its own auth)
- `Content-Type: application/json` header
- No 401 refresh interceptor (not part of the main auth flow)

**Alternatives considered**:
- Adding a Vite proxy entry (`/certs-api` → certs domain) — rejected because it requires config changes in both `vite.config.ts` and `vercel.json` for production
- Reusing the main `client` from `client.ts` — rejected because it has JWT auth and 401 refresh logic meant for the main backend

## 2. Student Enrollment Data for Auto-Fill

**Decision**: Use `getStudentWithDetails(studentId)` from `src/api/crm/students/core.ts`.

**Rationale**: This endpoint returns `StudentWithDetails` which includes `current_enrollment: CurrentEnrollmentInfo | null`. When the user selects a student in the generate form, we call this endpoint and auto-fill:
- `student_name` → from the search result (already available)
- `branch` → from the user's context or student's group branch (not in current_enrollment — will be a manual field or pre-filled from student's group)
- `course_track` → from `current_enrollment.course_name` (mapped to track key)
- `level` → from `current_enrollment.level_number` (formatted to "Level N — Junior/Intermediate/Advanced")

**API endpoint**: `GET /api/v1/crm/students/{id}/details` → `ApiResponse<StudentWithDetails>`
- `StudentWithDetails.current_enrollment`: `CurrentEnrollmentInfo` with `group_name`, `course_name`, `level_number`, `instructor_name`

**Fallback**: If `current_enrollment` is null (student has no active enrollment), only `student_name` is auto-filled. Track, level, and branch remain empty for manual entry.

## 3. Download Mechanism

**Decision**: Reuse the established blob-download pattern.

**Rationale**: Every PDF download in the codebase follows the same pattern — Axios with `responseType: 'blob'`, createObjectURL, anchor click, URL.revokeObjectURL. This pattern is proven across 4 consumer files.

**Implementation**:
```typescript
// API layer
export async function downloadCertificatePdf(certId: string): Promise<Blob> {
  const response = await certsClient.get(`/certificates/${certId}/pdf`, {
    responseType: 'blob'
  })
  return response.data
}

// Consumer (component)
const handleDownloadPdf = async (cert: CertificateDTO) => {
  try {
    const blob = await downloadCertificatePdf(cert.cert_id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${cert.student_name}_${cert.course_name}_${cert.issue_date.replace(/-/g, '')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch {
    showToast('Failed to download PDF', 'error')
  }
}
```

**Alternatives considered**: Using `window.open()` — rejected because it doesn't handle auth headers for blob downloads, and the anchor-click pattern is already standard.

## 4. Track Filter Values

**Decision**: Hardcode the track list from the API specification in a constants file or within the component.

**Rationale**: The API spec defines 13 fixed track keys with display names. These are unlikely to change frequently and are needed in multiple places (filter dropdown, generate form track selector).

**Track list**:
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

## 5. Level Values

**Decision**: Hardcode the three level options.

**Values**:
- `Level 1 — Junior`
- `Level 2 — Intermediate`
- `Level 3 — Advanced`

When auto-filling from enrollment data, `level_number` (1, 2, 3) maps to the corresponding level string.

## 6. Pagination Strategy

**Decision**: Server-side pagination using the API's `page` and `page_size` parameters.

**Rationale**: The API natively supports `?page=N&page_size=M` params (max page_size 100). Server-side pagination is essential for maintaining performance as the certificate count grows.

**Implementation**: React Query hook with page, pageSize, search, track, includeRevoked as query params. Each filter change resets to page 1.

## 7. UI Component Choices

- **Table**: Use `DataTable` from `src/components/common/datatable/` with `DataTableColumn` definitions — matches the CoursesPage/GroupsPage pattern
- **Search**: Use `SearchBar` from `src/components/common/SearchBar.tsx` with debounce
- **Track filter**: Native `<select>` or custom dropdown styled per design system
- **Modals**: Use `Modal` from `src/components/common/` for generate form and detail view
- **Confirm dialog**: Use `ConfirmDialog` for revoke confirmation
- **Pagination**: Use `Pagination` from `src/components/common/`
- **Toast**: Use `useToast()` hook
