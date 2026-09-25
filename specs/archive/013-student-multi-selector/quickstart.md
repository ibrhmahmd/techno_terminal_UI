# Quickstart: Student Multi-Selector

## Prerequisites

- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm install`)
- Backend API running (proxied via Vite dev server)

## Development Setup

```bash
npm run dev
```

Navigate to `/competitions/{id}` → Categories tab → "Register First Team" or "Register Team" to test the updated modal.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/common/StudentMultiSelector.tsx` | **NEW** — reusable multi-student search + selection component |
| `src/components/competitions/TeamRegistrationModal.tsx` | **UPDATED** — replaces ID inputs with `StudentMultiSelector` |
| `src/api/crm/students/search.ts` | **REUSED** — `searchStudents()` API function |
| `src/components/common/SpyCombobox.tsx` | **REUSED** — combobox infrastructure |
| `src/components/common/combobox/StudentCombobox.tsx` | **REFERENCE** — single-select pattern |

## Component Usage

```tsx
import { StudentMultiSelector } from '../common/StudentMultiSelector'
import type { StudentListItem } from '../../api/crm'

interface StudentSelection {
  student: StudentListItem
  fee?: number
}

<StudentMultiSelector
  selected={selections}
  onChange={setSelections}
  showFeeInput={true}
/>
```

## Verification

1. Open team registration modal
2. Type 2+ characters in search field
3. Verify search results show name, phone, status badge
4. Click a student — verify it appears as a removable chip with fee input
5. Select multiple students
6. Submit — verify `student_ids` and `student_fees` are correct in the API request

## Common Pitfalls

- The `searchStudents` API requires at least 2 characters — show "Type at least 2 chars" for shorter input
- Selected students should be excluded from search results to avoid duplicate selection
- Fee inputs should use `type="number"` with `step="0.01"` and `min="0"`
- Empty fee values should NOT be included in the `student_fees` payload
