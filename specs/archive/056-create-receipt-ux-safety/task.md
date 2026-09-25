# Tasks: Create Receipt UX & Layout Optimization

- `[x]` Update `EnrollmentSelection.tsx`
  - `[x]` Change the enrollment cards grid to a responsive horizontal layout (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5`).
- `[x]` Update `ReceiptLineItemRow.tsx`
  - `[x]` Remove the Left/Right split columns and stack elements vertically in a linear flow.
  - `[x]` Enlarge Amount and Discount fields (`py-3 px-4 text-lg font-bold`).
- `[x]` Update `CreateReceiptPanel.tsx`
  - `[x]` Reorder form fields: Line Items (Student/Enrollments/Amount) first → Payment Method selector → Payer Name & Notes.
- `[x]` Verify implementation
  - `[x]` Run `npm run build`
  - `[x]` Run `npm run lint`
  - `[x]` Verify changes manually in dev environment
