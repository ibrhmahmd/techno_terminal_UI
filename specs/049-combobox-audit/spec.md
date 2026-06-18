# Combobox Feature Audit & Fix

**Feature**: Combobox Components  
**Generated**: 2026-06-18  
**Branch**: `049-combobox-audit`

---

## Overview

Audit and remediation of the combobox feature across 4 components (StudentCombobox, GroupCombobox, InstructorCombobox, SpyCombobox) addressing runtime bugs, dead code, TypeScript violations, data fetching anti-patterns, React performance issues, accessibility violations, and UI polish gaps.

---

## User Stories

### US1: Fix Runtime Bugs (P1)

**As a** developer  
**I want** to eliminate runtime bugs in combobox components  
**So that** the application is stable and reliable

**Acceptance Criteria:**
- InstructorCombobox debounces search before firing API requests
- InstructorCombobox has `enabled` guard to prevent fetching on mount with empty string
- SpyCombobox querySelector uses CSS.escape for category IDs
- All stale-closure patterns in useEffect are resolved

---

### US2: Remove Dead Code (P2)

**As a** developer  
**I want** to remove unused code and extract shared logic  
**So that** the codebase is maintainable and DRY

**Acceptance Criteria:**
- Remove unused props (groups, isLoading, recentGroupIds) from GroupComboboxProps
- Delete unused hook `useRecentGroups.ts`
- Extract click-outside handler into shared `useClickOutside` hook
- Extract viewport flip logic into shared `useDropdownPosition` hook
- Extract category selection logic into shared utility

---

### US3: Fix TypeScript Violations (P2)

**As a** developer  
**I want** to eliminate TypeScript type safety issues  
**So that** the codebase leverages strict type checking

**Acceptance Criteria:**
- Fix `import React` to use `import type` in SpyCombobox
- Replace unsafe `as` type assertions with proper typing
- Remove redundant type assertions

---

### US4: Fix Data Fetching Anti-Patterns (P1)

**As a** developer  
**I want** to follow React Query best practices  
**So that** data fetching is efficient and cached properly

**Acceptance Criteria:**
- Add `enabled` guard to `useEmployees` hook (min 2 chars)
- All API calls go through centralized query keys
- Debounced search before server requests

---

### US5: Fix Accessibility Violations (P1)

**As a** user with disabilities  
**I want** comboboxes to be fully accessible  
**So that** I can use the application with assistive technology

**Acceptance Criteria:**
- All search inputs have `aria-label`
- All clear buttons have `aria-label`
- Category tabs have `role="tablist"`, `role="tab"`, `aria-selected`
- All decorative icons have `aria-hidden="true"`
- Sidebar items have `role="button"`, `tabIndex`, and keyboard handlers
- Result items have `role="button"` and keyboard handlers
- Dropdown panels have `role="listbox"` and `aria-label`

---

### US6: Fix React Performance Issues (P3)

**As a** developer  
**I want** comboboxes to render efficiently  
**So that** the UI remains responsive with large datasets

**Acceptance Criteria:**
- Replace `.some()` in render loops with `Set.has()` lookups
- Replace `Array.includes()` in loops with `Set` lookups
- Wrap components in `React.memo`
- Remove redundant derived state in useEffect
- Consolidate excessive useEffect hooks

---

### US7: Fix UI Polish & Design System Issues (P3)

**As a** user  
**I want** consistent, polished combobox UI  
**So that** the application feels professional and cohesive

**Acceptance Criteria:**
- Dropdown panels use glassmorphism pattern (bg-white/70 + backdrop-blur-xl)
- Search inputs use `focus-visible:` instead of `focus:` for keyboard-only indicators
- Convert clickable divs to semantic `<button>` elements
- Add `motion-safe:` guard to animate-pulse
- Fix non-standard spacing (p-3.5 → p-4)
- Replace `transition-all` with targeted `transition-colors`

---

### US8: Relocate Domain-Specific Components (P2)

**As a** developer  
**I want** common components to be truly generic  
**So that** the architecture follows domain-driven design

**Acceptance Criteria:**
- Move StudentCombobox to `src/components/student/`
- Move GroupCombobox to `src/components/groups/`
- Move InstructorCombobox to `src/components/staff/`
- Keep SpyCombobox in `src/components/common/` (truly generic)

---

## Out of Scope

- New combobox variants
- Backend API changes
- Database schema changes
- Test file updates (no tests exist currently)

---

## Assumptions

- SpyCombobox is the only truly generic common combobox (uses `<T>` generic, no domain imports)
- The 3 domain-specific comboboxes should be relocated to their respective domain directories
- Shared hooks (useClickOutside, useDropdownPosition) should be created in `src/hooks/`

---

## Success Criteria

- Zero TypeScript errors on build (`npm run build`)
- Zero ESLint errors on lint (`npm run lint`)
- All accessibility violations resolved
- All runtime bugs fixed
- All dead code removed
- Components follow domain-driven architecture

---

## Clarifications

### Session 2026-06-18

- Q: Should domain-specific comboboxes be relocated? → A: Yes, move to domain directories
- Q: Should shared hooks be extracted? → A: Yes, create useClickOutside and useDropdownPosition
- Q: Should clickable divs be converted to buttons? → A: Yes, for semantic HTML compliance
