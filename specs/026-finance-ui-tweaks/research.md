# Research: Finance UI Tweaks

**Date**: 2026-06-02
**Source**: Spec clarifications session

## Summary

All unknowns were resolved during the `/speckit.clarify` session. No additional research needed.

## Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Tab labels | Verbatim panel names: "Today's Receipts", "Create Receipt", "Unpaid", "Refunds" | User confirmed descriptive labels |
| Pill colors | Cash=green, E-Wallet=red, instaPay=purple, Other=grey | User specified directly |
| Pill icons | Material Symbols defaults (e.g., `payments`, `account_balance_wallet`, `bolt`, `more_horiz`) | Follows existing icon convention in the project |
| Payment gateway | E-Wallet and instaPay are UI-only labels | No backend integration required — same behavior as Cash |
| Refunds tab | Keep "Coming Soon" placeholder | Not in scope for this feature |
| Mobile tabs | Horizontal scroll (overflow-x-auto) | Preserves single-row layout on small screens |
| Line item layout | Two-column: Student+Enrollment left, Amount+Discount+Payment Type right | User selected Option A |

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Implement E-Wallet/instaPay as real payment gateways | Out of scope — requires backend integration |
| Stack tabs vertically on mobile | User preferred horizontal scroll |
| Remove Advanced Search from Today's Receipts | Not requested — assumed to stay |
| Implement actual refunds panel | User confirmed to keep placeholder |
