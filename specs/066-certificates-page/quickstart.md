# Quickstart: Certificates Page Implementation

**Date**: 2026-07-29 | **Phase**: 1 — Design & Contracts

## Implementation Order

1. **API layer** — `src/api/certificates/` (types, certs API client, functions)
2. **Query keys** — Add to `src/hooks/queryKeys.ts`
3. **Hook** — `src/hooks/useCertificates.ts`
4. **Components** — `CertificatesHeader`, `CertificatesTable`, `CertificateForm`, `CertificateDetailModal`
5. **Page** — `src/pages/CertificatesPage.tsx`
6. **Routing** — Add lazy import + route in `src/App.tsx`
7. **Navigation** — Add to `Sidebar.tsx` + `MobileNavSheet.tsx`

## Key Decisions

- **Separate Axios instance** for certs API (not the shared `client` from `client.ts`)
- **No Vite proxy** needed — direct URL in the Axios instance
- **Server-side pagination** via `page` / `page_size` query params
- **Download pattern**: Blob with `window.URL.createObjectURL` (same as receipts)
- **Student auto-fill**: `getStudentWithDetails(id)` → `current_enrollment`

## Files to Create (10)

| File | Purpose |
|------|---------|
| `src/api/certificates/types.ts` | CertificateDTO, request/response types |
| `src/api/certificates/certificates.ts` | API functions + certs axios instance |
| `src/api/certificates/index.ts` | Barrel export |
| `src/hooks/useCertificates.ts` | React Query hook |
| `src/components/certificates/CertificatesHeader.tsx` | Title, search, filters, action buttons |
| `src/components/certificates/CertificatesTable.tsx` | DataTable columns + mobile cards |
| `src/components/certificates/CertificateForm.tsx` | Generate form modal |
| `src/components/certificates/CertificateDetailModal.tsx` | Certificate detail modal |
| `src/pages/CertificatesPage.tsx` | Main page component |

## Files to Modify (5)

| File | Change |
|------|--------|
| `src/hooks/queryKeys.ts` | Add `certificates` key factory |
| `src/App.tsx` | Add lazy import + `<Route path="/certificates">` |
| `src/components/layout/Sidebar.tsx` | Add `{ path: '/certificates', label: 'Certificates', icon: 'verified' }` under "Programs" section |
| `src/components/layout/MobileNavSheet.tsx` | Add `/certificates` to `MORE_ITEMS` |

## Constants

```typescript
// Track options (for filter dropdown + generate form)
const CERT_TRACKS = [
  { value: 'html', label: 'HTML — Web Structure' },
  { value: 'css', label: 'CSS — Styling & Layout' },
  { value: 'javascript', label: 'JavaScript — Interactivity' },
  { value: 'python', label: 'Python — Programming' },
  { value: 'advanced', label: 'Advanced — Web Pro' },
  { value: 'problem_solving', label: 'Problem Solving — Logic' },
  { value: 'robotics-wedo', label: 'Robotics WeDo 2.0' },
  { value: 'robotics-spike-essential', label: 'Robotics SPIKE Essential' },
  { value: 'robotics-spike-prime', label: 'Robotics SPIKE Prime' },
  { value: 'robotics-ev3', label: 'Robotics EV3' },
  { value: 'robotics-arduino', label: 'Robotics Arduino' },
  { value: 'scratch', label: 'Scratch' },
  { value: 'scratch-jr', label: 'Scratch Jr' },
]

// Level options
const CERT_LEVELS = [
  'Level 1 — Junior',
  'Level 2 — Intermediate',
  'Level 3 — Advanced',
]
```

## API Client (certsClient)

Will be created inside `src/api/certificates/certificates.ts`:

```typescript
import axios from 'axios'

const CERTS_BASE_URL = 'https://techno-future-certs.fastapicloud.dev/api/v1'

export const certsClient = axios.create({
  baseURL: CERTS_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})
```

No auth interceptor — the certs API is consumed as a public service (or handles auth independently).

## Dependencies

- `useStudentsSearch` from `src/hooks/useDirectory.ts` (for student auto-complete in generate form)
- `getStudentWithDetails` from `src/api/crm/students/core.ts` (for enrollment auto-fill)
- `DataTable` from `src/components/common/datatable/` (for table view)
- `SearchBar` from `src/components/common/SearchBar.tsx`
- `Modal` from `src/components/common/`
- `ConfirmDialog` from `src/components/common/`
- `Pagination` from `src/components/common/`
- `LoadingSpinner` from `src/components/common/`
- `useToast` from `src/components/common/Toast`
- `useAuthStore` from `src/store/authStore` (for `isInstructor` check)
