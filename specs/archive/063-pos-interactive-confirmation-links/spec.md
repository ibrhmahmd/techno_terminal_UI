# Specification: POS Interactive Confirmation, Tab Links & Checkout Summary Enrichment

---

## 1. Goal Description

Enhance the POS Create Receipt flow to be safer, more interactive, and information-rich:
1. **Readable Student Name & External Links**:
   - Enlarge the selected student name.
   - Make the student name, group name, and enrollment clickable to open details/modify tabs in new browser tabs.
2. **One-Row Payment Methods**:
   - Stack icons and labels vertically to fit payment method pills in a single 4-column row inside the sidebar.
3. **Larger Preset Suggestions**:
   - Move presets above custom input fields and enlarge them.
4. **Slide-to-Confirm Slider**:
   - Replace the simple confirm button in the checkout modal with an iPhone-style Slide-to-Confirm horizontal swipe slider.
5. **Enriched Live Checkout Summary**:
   - Display a detailed live calculation breakdown (Group/Level, Initial Remaining Balance, Paid Amount, Applied Discount, and New Balance after this payment).

---

## 2. Technical details

### 2.1 Slider Confirmation
- Create a reusable swipe slider component (`SlideToConfirm.tsx`) accepting `onConfirm` and `label`.
- It tracks drag offsets and triggers `onConfirm` when dragged to the end, springing back on premature release.

### 2.2 External Link Routing
- Student link: opens `/students/:id` in a new tab.
- Group link: opens `/groups/:id` in a new tab.
- Enrollment link: opens `/enrollments?tab=modify` in a new tab. Update `EnrollmentsPage` to route to correct tabs using `useSearchParams`.

---

## 3. Files to Change

| File | Change |
|------|--------|
| `src/components/student/StudentCombobox.tsx` | Enlarge and link selected student name. |
| `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` | Add links to group detail and enrollment modify page on cards. |
| `src/pages/EnrollmentsPage.tsx` | Add search parameter tab-routing logic. |
| `src/components/finance/PaymentMethodPills.tsx` | Adjust horizontal pill layouts to a single row grid. |
| `src/components/finance/CreateReceipt/SlideToConfirm.tsx` | [NEW] Create mouse/touch slider component. |
| `src/components/finance/CreateReceiptPanel.tsx` | Relocate presets, enrich checkout breakdown info, integrate `SlideToConfirm` modal. |
