# Spec: Staff Page Pagination Alignment

**Feature**: Replace ad-hoc `PaginationControls` with the canonical `Pagination` component used across the app
**Source**: StaffPage uses `PaginationControls` (minimal Previous/Next only); 5 other pages use `Pagination` (full-featured with page-size selector, numbered pages, total info)

---

## User Story

### US1 — Align Staff Pagination with App Standard (P1)

**As an** admin
**I want** the staff page to use the same pagination controls as other pages (Directory, Groups, Certificates)
**So that** the UX is consistent and I can change page size, jump to specific pages, and see total records

**Acceptance Criteria**:
- StaffPage uses `<Pagination>` from `src/components/common/Pagination.tsx` instead of `PaginationControls`
- Props passed: `currentPage`, `totalPages`, `onPageChange`, `totalRecords`, `showTotalInfo={true}`
- Page-size selector included with options `[10, 20, 50, 100]` and default 20
- "Showing X-Y of Z records, Page N of M" text visible
- Page resets to 1 when page size changes
- Page resets to 1 when search or toggle changes (already implemented)
- `PaginationControls.tsx` can be deleted if no other consumers exist

**Independent Test**: Navigate to staff page → see full pagination with page-size selector, numbered pages, and total count → change page size → page resets to 1 → jump to page 3 → controls update

---

## Scope Boundaries

### In Scope
- Replace `PaginationControls` with `Pagination` in StaffPage
- Add page-size state and handler
- Pass correct props to `Pagination`

### Out of Scope
- Changes to the `Pagination` component itself
- Server-side page-size support (backend already accepts `page_size` param)
- Other pages' pagination (already correct)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/StaffPage.tsx` | Import `Pagination`, add `pageSize` state + handler, replace `PaginationControls` |
| `src/components/common/PaginationControls.tsx` | Delete (only consumer is StaffPage) |
