# Specification: POS Layout Revamp & Info Richness

---

## 1. Goal Description

Revamp the Create Receipt panel layout to follow a professional, two-column Point of Sale (POS) design. In addition, enrich the selected student and enrollment views with more contextual metadata, make level numbers highly prominent, and scale up the suggested payment buttons for touch-friendly cashier operations.

---

## 2. Layout revamps

### 2.1 POS Two-Column Grid
The Create Receipt layout is transformed into a `grid grid-cols-1 lg:grid-cols-3 gap-6 items-start`:
- **Left Column** (`lg:col-span-2 space-y-6`): Holds form steps:
  1. Student Select (Step 1)
  2. Enrollment Grid (Step 2)
  3. Amount & Discount details (Step 3)
  4. Optional Details — Payer Name & General Notes (Step 5)
- **Right Column** (`lg:col-span-1 space-y-6 lg:sticky lg:top-6`): Holds:
  1. Payment Method (Step 4 — rendered as a vertical list of tall, touch-friendly option cards).
  2. Total Breakdown Card & Checkout Action button.

---

## 3. Data Richness & Prominence

### 3.1 Student Selection Metadata
When a student is selected, `StudentCombobox` displays:
- Name (bold)
- Phone
- Status Badge (Active/Inactive/Waitlisted)
- Student ID: `#ID: {student.id}` (new)
- Date of Birth / Grade (new, if present)
- Current Group: `Current Group: {student.current_group_name}` (new, if present)

### 3.2 Enrollment Card Enhancements
- **Circular Level Badge**: Renders a large high-contrast circle `L{level}` on the left side of the card with level-specific background coloring.
- **Group and Enrollment Metadata**:
  - Group name (bold text-sm)
  - Course name
  - Instructor name
  - Joined date: `Joined: {formatDate(enrolled_at)}` (new)
  - Status badge (Active/Completed/Dropped) using colored tag pills (new)
  - Notes: if enrollment notes exist, render them as a subtle indicator at the bottom (new)

### 3.3 Suggested Payment Cards
Enlarge suggestion options under the Amount field into full-sized cards:
- Height and font-weight are boosted (`px-3.5 py-2 text-sm font-bold`).
- Suggestion header label: `Suggestions:`.

---

## 4. Files to Change

| File | Change |
|------|--------|
| `src/hooks/finance/useStudentEnrollments.ts` | MODIFY — Add `status` and `enrolled_at` properties to `StudentEnrollmentInfo` schema and mapping logic. |
| `src/components/student/StudentCombobox.tsx` | MODIFY — Render additional student metadata (ID, DOB/Grade, Current Group) in selected state. |
| `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` | MODIFY — Redesign card layout with large circular Level badge, show Joined date, Status badge, and Notes. |
| `src/components/finance/PaymentMethodPills.tsx` | MODIFY — Add `layout?: 'horizontal' | 'vertical'` support for vertically stacked list styling. |
| `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | MODIFY — Enlarge suggestion buttons to full-size touch-friendly cards. |
| `src/components/finance/CreateReceiptPanel.tsx` | MODIFY — Rearrange wrapper JSX to POS two-column split, sticky sidebar, and vertical payment method. |

---

## 5. Verification Plan

### Automated Verification
- Compile workspace: `npm run build`.
- Lint files: `npm run lint`.

### Manual Verification
- Select student and verify they display all metadata (ID, DOB/Grade, Current Group).
- Verify enrollment cards render Level as a circle on the left, show Joined date and Status pill.
- Verify suggestions display as prominent button cards.
- Verify payment method is vertically stacked in the right sidebar.
