# Research: Fix Enrollment Issues

**Phase 0** — All three items are well-defined with no NEEDS CLARIFICATION markers.

## US1: Default Price to Zero

**Decision**: Change all `useState(150)` and `setAmount(150)` to `0` in `src/components/enrollments/EnrollPanel.tsx`
**Rationale**: Hardcoded 150 EGP is a placeholder that doesn't reflect actual course prices. Zero forces conscious entry.
**Locations**: 5 occurrences:
- Line 35: `const [amount, setAmount] = useState(150)` → `useState(0)`
- Line 60: `setAmount(150)` on group select
- Line 86: `setAmount(150)` on student change
- Line 96: `setAmount(150)` on group clear
- Line 130: `setAmount(150)` on form reset

## US2: Prevent Scroll on Number Inputs

**Decision**: Add `onWheel` handler to both `<input type="number">` fields (Course Fee + Discount) that calls `(e) => e.currentTarget.blur()` to remove focus during scrolling.
**Rationale**: Standard browser behavior for `<input type="number">` changes the value on scroll wheel. Blurring on wheel events prevents this while keeping normal typing/arrow-key behavior.
**Alternatives considered**: 
- `e.preventDefault()` inside `onWheel` — works but doesn't stop value change
- `inputMode="decimal"` with type="text" — loses native number validation
- CSS `::-webkit-inner-spin-button` hiding — doesn't prevent scroll
- **Chosen**: blur on wheel is the simplest proven pattern

## US3: Enrollment Edit API Review

**Decision**: No PATCH/PUT endpoint exists for enrollments. Only: GET (list), POST (create), POST (transfer), DELETE (remove), POST (discount).
**Fields not editable after creation**: `amount_due`, `discount`, `notes`
**Recommendation**: A `PATCH /enrollments/{id}` endpoint should be added to the backend to allow updating `amount_due`, `discount`, and `notes`. This is out of scope for this feature (backend work).
**Workaround without backend change**: Drop enrollment + re-enroll with correct values (poor UX, data loss).
