# Research: Settings Page Audit & Fix

## Overview

This document consolidates findings from the 5-phase feature audit and resolves technical unknowns before design.

## Resolved Unknowns

### 1. Focus Trap Implementation

**Decision**: Use the existing `Modal` component from `src/components/common/Modal.tsx`, which already implements focus trapping (focus on open, return focus on close, Tab/Shift+Tab cycling). The hand-rolled modals in UsersTab (UserDetailModal, InviteModal, CreateUser, ResetPassword, delete confirm) should be refactored to use the common Modal component, or at minimum adopt its focus-trap pattern.

**Rationale**: Avoids reimplementing a11y behavior that already exists in the codebase. The Modal component handles `aria-modal`, focus trapping, Escape dismissal, and return focus — everything the hand-rolled modals are missing.

**Alternatives considered**:
- Writing a custom `useFocusTrap` hook — unnecessary duplication since `Modal` already provides this
- Using a third-party library like `focus-trap-react` — adds dependency for something the project already has

### 2. Debounce Pattern in UsersTab

**Decision**: Replace the `useCallback` faux-debounce with the project's existing `useDebounce` hook from `src/hooks/useDebounce.ts`. The hook returns a debounced value — `const debouncedSearch = useDebounce(search, 350)` — which is then passed to `useUsers`.

**Rationale**: The existing `useDebounce` hook is used elsewhere in the project (e.g., LogsTab) and is the correct pattern for debouncing search input. The current `useCallback` approach does not debounce at all — every keystroke triggers a state update and re-fetch.

**Pattern**:
```tsx
const [searchInput, setSearchInput] = useState('')
const debouncedSearch = useDebounce(searchInput, 350)

// Query uses debouncedSearch
const { data } = useUsers({ search: debouncedSearch || undefined, ... })

// Input calls setSearchInput directly
<input onChange={(e) => setSearchInput(e.target.value)} />
```

### 3. Inline `toLocaleString()` Instances

**Decision**: Replace all instances with the existing `formatDate` utility from `src/utils/formatting.ts`. Note that some instances are in components that will be deleted (SessionsTab, ActivityTab), making the fix automatic for those.

**Affected files**:
| File | Line | Status |
|------|------|--------|
| SessionsTab.tsx:115 | `toLocaleString()` | File will be deleted (dead) |
| SessionsActivityTab.tsx:118 | `toLocaleString()` | Needs fix |
| ActivityTab.tsx:58 | `toLocaleString()` | File will be deleted (dead) |
| UsersTab.tsx:165 | `toLocaleString()` | Needs fix |
| AuditLogTable.tsx:50 | `toLocaleString()` | Needs fix |

### 4. Common Modal vs Hand-Rolled Modals

**Decision**: The settings feature has 5 hand-rolled modals that do NOT use `src/components/common/Modal.tsx`. Each should be audited for whether it can be migrated to the common Modal component. The common Modal provides: `isOpen`, `onClose`, `title`, focus trapping, Escape dismissal, and `aria-modal`. Hand-rolled modals should adopt these patterns.

**Where the common Modal is missed**:
- `UserDetailModal` (UsersTab.tsx:52) — custom overlay
- InviteUser dialog (UsersTab.tsx:315-area) — custom overlay
- CreateUser dialog (UsersTab.tsx:620-area) — custom overlay
- ResetPassword dialog (UsersTab.tsx:691-area) — custom overlay
- Delete/Deactivate confirm modals — nested within UserDetailModal

## Key Findings

### Files to Modify

| Action | File | Changes |
|--------|------|---------|
| DELETE | `src/components/settings/SessionsTab.tsx` | Entire file (dead) |
| DELETE | `src/components/settings/ActivityTab.tsx` | Entire file (dead) |
| DELETE | `src/components/settings/CRMSettingsTab.tsx` | Entire file (dead) |
| DELETE | `src/components/settings/AgeBucketEditor.tsx` | Entire file (dead) |
| EDIT | `src/pages/SettingsPage.tsx` | Remove dead tab references, fix aria-labelledby |
| EDIT | `src/components/settings/ProfileTab.tsx` | Add htmlFor/id, role=alert, aria-hidden on icons |
| EDIT | `src/components/settings/SessionsActivityTab.tsx` | Add htmlFor/id, aria-hidden on icons, scope=col, toLocaleString fix |
| EDIT | `src/components/settings/UsersTab.tsx` | Fix stale closure, fix debounce, add focus trap, htmlFor/id, aria-hidden, aria-label on buttons, role=alert |
| EDIT | `src/components/settings/AuditLogTable.tsx` | Add scope=col, role=status, toLocaleString fix |
| EDIT | `src/hooks/useAuthQueries.ts` | Add onSuccess invalidation to useChangePassword |

### No External Dependencies Required

All fixes use existing project utilities and patterns. No npm packages needed.
