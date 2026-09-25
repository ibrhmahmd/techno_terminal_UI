# Quickstart: Combobox Feature Audit & Fix

**Date**: 2026-06-18  
**Feature**: Combobox Components  
**Branch**: `049-combobox-audit`

---

## Overview

This guide covers the implementation of the Combobox Feature Audit & Fix across 8 user stories. The work involves fixing 77 findings across 4 combobox components.

---

## Prerequisites

- Node.js 18+ installed
- Git on branch `049-combobox-audit`
- Dependencies installed (`npm install`)

---

## Implementation Order

### Phase 1: Shared Hooks (Foundation)

Create shared hooks that all comboboxes will use:

```bash
# Create useClickOutside hook
touch src/hooks/useClickOutside.ts

# Create useDropdownPosition hook
touch src/hooks/useDropdownPosition.ts
```

### Phase 2: Relocate Components (Architecture)

Move domain-specific comboboxes to their domain directories:

```bash
# StudentCombobox
mv src/components/common/combobox/StudentCombobox.tsx src/components/student/

# GroupCombobox
mv src/components/common/combobox/GroupCombobox.tsx src/components/groups/

# InstructorCombobox
mv src/components/common/combobox/InstructorCombobox.tsx src/components/staff/

# Update barrel file to only export SpyCombobox
# src/components/common/combobox/index.ts
```

### Phase 3: Fix TypeScript Issues

Address type safety issues:

1. Fix `import React` in SpyCombobox (verbatimModuleSyntax)
2. Replace `as` assertions with `satisfies`
3. Remove redundant type annotations

### Phase 4: Fix Runtime Bugs

Address critical bugs:

1. Add debounce to InstructorCombobox search
2. Add enabled guard to useEmployees hook
3. Fix CSS.escape in SpyCombobox querySelector
4. Fix stale-closure patterns in useEffect

### Phase 5: Fix Accessibility

Add missing ARIA attributes:

1. Add `aria-label` to all search inputs
2. Add `aria-label` to clear buttons
3. Add `role="tablist"` and `role="tab"` to category tabs
4. Add `aria-hidden="true"` to decorative icons
5. Add `role="button"` and keyboard handlers to sidebar items
6. Add `role="listbox"` to dropdown panels

### Phase 6: Fix Performance

Optimize rendering:

1. Replace `.some()` with `Set.has()` in render loops
2. Replace `Array.includes()` with `Set` lookups
3. Wrap components in `React.memo`
4. Remove redundant derived state in useEffect
5. Consolidate excessive useEffect hooks

### Phase 7: Fix UI Polish

Apply design system patterns:

1. Apply glassmorphism to dropdown panels
2. Replace `focus:` with `focus-visible:`
3. Convert clickable divs to semantic buttons
4. Add `motion-safe:` to animate-pulse
5. Fix spacing (p-3.5 → p-4)
6. Replace `transition-all` with `transition-colors`

### Phase 8: Clean Up Dead Code

Remove unused code:

1. Remove unused props from GroupComboboxProps
2. Delete `useRecentGroups.ts` hook
3. Remove barrel file type exports (if unused)

---

## Verification

After implementation, run:

```bash
# Type check
npm run build

# Lint check
npm run lint

# Verify no remaining issues
rg ': any' src/components/student/StudentCombobox.tsx
rg ': any' src/components/groups/GroupCombobox.tsx
rg ': any' src/components/staff/InstructorCombobox.tsx
rg ': any' src/components/common/SpyCombobox.tsx
rg 'console\.' src/components/student/StudentCombobox.tsx
rg 'console\.' src/components/groups/GroupCombobox.tsx
rg 'console\.' src/components/staff/InstructorCombobox.tsx
rg 'console\.' src/components/common/SpyCombobox.tsx
```

---

## File Changes Summary

### New Files
- `src/hooks/useClickOutside.ts`
- `src/hooks/useDropdownPosition.ts`

### Moved Files
- `src/components/common/combobox/StudentCombobox.tsx` → `src/components/student/`
- `src/components/common/combobox/GroupCombobox.tsx` → `src/components/groups/`
- `src/components/common/combobox/InstructorCombobox.tsx` → `src/components/staff/`

### Modified Files
- `src/components/common/SpyCombobox.tsx`
- `src/components/common/combobox/index.ts`
- `src/hooks/useStaff.ts` (add enabled guard)

### Deleted Files
- `src/hooks/useRecentGroups.ts`

### Updated Imports (in consumers)
- `src/pages/TeamDetailPage.tsx`
- `src/components/enrollments/ModifyEnrollmentPanel.tsx`
- `src/components/enrollments/EnrollPanel.tsx`
- `src/components/enrollments/DropEnrollmentPanel.tsx`
- `src/components/teams/TeamEditModal.tsx`
- `src/components/competitions/TeamRegistrationModal.tsx`
- `src/components/student/EnrollmentsTab.tsx`
- `src/components/common/StudentMultiSelector.tsx`
- `src/components/settings/UsersTab.tsx`
- `src/components/finance/UnpaidEnrollmentsFilters.tsx`
- `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx`
