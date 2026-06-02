# Quickstart: Finance Audit Fixes

**Date**: 2026-06-02

## Scope

This feature is a pure frontend cleanup of the finance module. No backend changes, no new components, no new API endpoints. All changes modify existing source files or delete dead ones.

## Key Files to Modify

### Breaking Bug Fixes (US1)
| File | Change |
|------|--------|
| `src/components/finance/CreateReceiptPanel.tsx:308` | Replace `createError?.message` with caught `err` message |
| `src/components/finance/TodayReceiptsList.tsx:103` | Map `total_amount` from response (not hardcoded 0) |
| `src/components/finance/SearchReceiptsPanel.tsx:55` | Remove dead file (bug fixed by deletion) |
| `src/hooks/finance/useDailyMetrics.ts:24` | Fix `limit: 1000` → use API-agreed limit or paginate |

### Cache Invalidation (US2)

| File | Change |
|------|--------|
| `src/hooks/finance/useReceipts.ts` | Add `queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })` after create |
| `src/hooks/finance/useBalance.ts` | Add cache invalidation after adjustBalance |
| `src/hooks/finance/useRefunds.ts` | Add cache invalidation after issueRefund |

### Dead Code Removal (US3)
| File | Change |
|------|--------|
| `src/components/finance/SearchReceiptsPanel.tsx` | DELETE entire file |
| `src/components/finance/index.ts` | DELETE entire barrel file |

### Payment Method Labels (US4)
| File | Change |
|------|--------|
| `src/components/finance/TodayReceiptsList.tsx` | Update `METHOD_LABELS` + `METHOD_COLORS` |
| `src/components/finance/ReceiptDetailPanel.tsx` | Update `METHOD_LABELS` |

### Type Safety (US5)
| File | Change |
|------|--------|
| `src/components/finance/CreateReceiptPanel.tsx` | Add runtime validation arrays + `.includes()` checks |
| `src/components/finance/PaymentMethodPills.tsx` | Narrow `color` type to union |

### Accessibility (US6)
| File | Change |
|------|--------|
| `src/components/common/MetricsStripCards.tsx` | Add `role="tablist"`, `role="tab"`, `aria-selected`, `aria-hidden` |
| `src/pages/FinancePage.tsx` | Add `ErrorBoundary` per panel, add focus management |
| `src/components/finance/CreateReceiptPanel.tsx` | Add `htmlFor`/`id`, `aria-hidden` on icons, fix `<label>` misuse |
| `src/components/finance/ReceiptDetailPanel.tsx` | Add `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-label` on close |
| `src/components/finance/UnpaidEnrollmentCard.tsx` | Replace `title` with `aria-label`, add `aria-hidden` on icons |
| `src/components/finance/UnpaidEnrollmentsPanel.tsx` | Add `radiogroup`/`tablist` roles, `aria-hidden` on icons, remove `alert()` + `console.log()` |
| `src/components/finance/UnpaidEnrollmentsFilters.tsx` | Add `radiogroup` role, `htmlFor`/`id` |
| `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | Add `htmlFor`/`id`, `aria-hidden` on icons |
| `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` | Add `htmlFor`/`id` |
| `src/components/finance/ComingSoonPlaceholder.tsx` | Add `aria-hidden` on icon |
| `src/components/finance/PaymentMethodPills.tsx` | Add `aria-hidden` on icon |

### Cached Data Fetching (US7)
| File | Change |
|------|--------|
| `src/hooks/finance/useStudentEnrollments.ts` | Rewrite from `useState`+`useEffect` to `useQuery` |
| `src/hooks/queryKeys.ts` | Add `studentEnrollments` factory |

### Catch Clause Cleanup (Low Priority)
| File | Change |
|------|--------|
| `src/hooks/finance/useReceipts.ts` | Change `catch (err)` → `catch (err: unknown)` |
| `src/hooks/finance/useBalance.ts` | Same pattern |
| `src/hooks/finance/useRefunds.ts` | Same pattern |
| `src/hooks/finance/useStudentEnrollments.ts` | Same pattern |

## Verification

```bash
npm run build          # must pass with zero errors
npm run lint           # must pass with zero errors in finance files

# Verify no remaining console.log in finance hooks (except debug guard):
rg 'console\.' src/hooks/finance/ src/components/finance/

# Verify no remaining alert() in finance components:
rg 'alert\(' src/components/finance/

# Verify no remaining unsafe any in finance:
rg ': any' src/components/finance/ src/hooks/finance/

# Verify dead files removed:
rg 'SearchReceiptsPanel' src/ --include '*.tsx' --include '*.ts'
```
