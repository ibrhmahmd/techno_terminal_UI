# Quickstart: Fix Enrollment Issues

## Prerequisites
- `npm install` completed
- Running on branch `009-fix-enrollment-issues`

## Implementation Order

1. **US1: Default price to zero** — `src/components/enrollments/EnrollPanel.tsx`
   - Change `const [amount, setAmount] = useState(150)` → `useState(0)` (line 35)
   - Change 4 `setAmount(150)` calls to `setAmount(0)` (lines 60, 86, 96, 130)

2. **US2: Prevent scroll on number inputs** — `src/components/enrollments/EnrollPanel.tsx`
   - Add `onWheel={(e) => e.currentTarget.blur()}` to the Course Fee `<input type="number">`
   - Add `onWheel={(e) => e.currentTarget.blur()}` to the Discount `<input type="number">`

3. **US3: API review** — `src/api/enrollments/enrollments.ts` + `docs/api/enrollments.md`
   - Research task only (no code changes)

## Verifying Changes
- `npm run build` must pass
- `npm run lint` must pass
- Manual test: Open Enrollments → New Enrollment → verify fee starts at 0, scroll doesn't change value
