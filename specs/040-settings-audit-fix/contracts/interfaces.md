# Contracts: Settings Page Audit & Fix

This feature introduces no new interfaces, API endpoints, or external contracts. All changes are internal UI fixes and refactors within existing component boundaries.

## No Contract Changes

- **No new API endpoints**: All data fetching uses existing hooks (`useAuthQueries.ts`).
- **No new component props**: Existing component interfaces remain unchanged. Focus trap and a11y fixes are internal to components.
- **No new Zustand stores**: Existing `useGroupingSettingsStore` and `useAuthStore` are used as-is.
- **No new URL routes**: The settings page route (`/settings`) is unchanged.

## Existing Contracts Referenced

| Contract | File | Usage |
|----------|------|-------|
| `Modal` component props | `src/components/common/Modal.tsx` | Hand-rolled modals should adopt this pattern |
| `useDebounce` hook | `src/hooks/useDebounce.ts` | Replaces faux-debounce in UsersTab |
| `formatDate` utility | `src/utils/formatting.ts` | Replaces inline `toLocaleString()` calls |
