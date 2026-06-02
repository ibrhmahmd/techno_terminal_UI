# Research: Finance Audit Fixes

**Created**: 2026-06-02
**Status**: Complete — no NEEDS CLARIFICATION markers exist in spec

## Overview

All findings from the comprehensive finance feature audit (Phase 0 of /speckit.plan) are already documented in the audit output. This research.md consolidates technical decisions needed for Phase 1 design.

## Research Summary

### 1. Error Boundary Pattern (from codebase exploration)

**Decision**: Reuse `src/components/common/ErrorBoundary.tsx` — a class-based component with optional `fallback` prop and default error UI.

**Pattern** (used across ReportsPage, GroupsPage, StudentDetailPage, etc.):
```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary'

<ErrorBoundary>
  <SomePanel />
</ErrorBoundary>
```

**Applied to FinancePage**: Each of the 4 panels (CreateReceiptPanel, TodayReceiptsList, UnpaidEnrollmentsPanel, ComingSoonPlaceholder) will be wrapped individually, following the same pattern as ReportsPage.

### 2. React Query Hook Patterns (finance hooks already using useQuery)

**Decision**: Follow `useDailyMetrics.ts` and `useDailyReceipts.ts` patterns for migrating `useStudentEnrollments`:
- `staleTime`: 2 minutes (finance convention)
- Query key factory from `src/hooks/queryKeys.ts`
- Return pattern: `data ?? []`, `isLoading: query.isLoading`, `error` with `instanceof Error` guard

### 3. Query Keys Factory

Existing finance keys in `src/hooks/queryKeys.ts`:
```typescript
finance: {
  metrics: (date: string) => ['finance', 'metrics', date] as const,
  dailyReceipts: (date: string) => ['finance', 'daily-receipts', date] as const,
  receipts: {
    search: (params: Record<string, unknown>) => ['finance', 'receipts', 'search', params] as const,
    detail: (id: number) => ['finance', 'receipts', id] as const,
  },
},
```

**Decision**: Add `studentEnrollments: (id: number) => ['finance', 'student-enrollments', id] as const` for the migrated hook. Also add a helper for invalidating all finance metrics caches.

### 4. Dead Code Verification

**Decision**: `SearchReceiptsPanel.tsx` and `finance/index.ts` are confirmed dead — zero imports outside their own definitions. Safe to delete.

### 5. Cache Invalidation Targets

After creating a receipt, adjusting a balance, or issuing a refund, invalidate:
- `['finance', 'metrics']` — wildcard matches all metrics queries
- `['finance', 'daily-receipts']` — wildcard matches all daily receipt queries

### 6. Accessibility Fixes — Technical Approach

| Fix | Approach |
|-----|----------|
| `aria-hidden="true"` on icons | Add attribute to all `<span className="material-symbols-outlined">` instances in finance components |
| Tab roles on metrics cards | Add `role="tablist"` to container, `role="tab"` + `aria-selected={isActive}` to each card button |
| htmlFor/id on form labels | Add `id` to inputs and `htmlFor` to labels |
| Error boundary per panel | Wrap each panel div section |
| Dialog role on modal | Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Radio group roles | Add `role="radiogroup"`, `role="radio"`, `aria-checked` |
| Focus management | Add `ref` + `tabIndex={-1}` + `.focus()` on panel container after switch |
| Close button label | Add `aria-label` to icon-only buttons |

### 7. Type-Assertion Safe Guards

For runtime-safe narrowing of payment method and type values:
- Define const arrays of valid values
- Use `.includes()` check with fallback to default
- Keep `as` assertion but only after runtime validation

## Alternatives Considered

- **Keeping `SearchReceiptsPanel.tsx`**: Rejected — it's dead code with no consumers and duplicate search logic already in `TodayReceiptsList`
- **Using external accessibility audit tools**: Not needed — all fixes are mechanical (add attributes)
- **New Zustand store for panel error state**: Rejected — ErrorBoundary handles this with React's built-in error boundary mechanism
