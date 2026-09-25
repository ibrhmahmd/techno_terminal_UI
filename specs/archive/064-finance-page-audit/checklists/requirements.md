# Finance Page Audit — Requirements Checklist

## Spec Quality Checklist

- [ ] All 142 findings mapped to user stories
- [ ] Each user story has clear acceptance criteria
- [ ] Each user story lists affected files
- [ ] Non-goals explicitly stated
- [ ] Dependencies documented
- [ ] Risk assessment included

## User Story Coverage

### US-1: Migrate Finance Hooks to React Query
- [ ] useBalance.ts split into focused hooks
- [ ] useReceipts.ts split into focused hooks
- [ ] useRefunds.ts split into focused hooks
- [ ] All hooks use centralized query keys
- [ ] All mutations invalidate cache on success
- [ ] staleTime set to 5 minutes
- [ ] UnpaidEnrollmentsPanel migrated to useQuery

### US-2: Fix Confirmation Modal Accessibility
- [ ] SlideToConfirm keyboard accessible
- [ ] Confirmation modal has ARIA semantics
- [ ] All Material Symbols icons have aria-hidden
- [ ] Inputs have htmlFor/id label association
- [ ] ReceiptDetailPanel dialog has focus management
- [ ] Delete button uses aria-label

### US-3: Fix WCAG Contrast and Focus Indicators
- [ ] text-slate-400 changed to text-slate-500 on white
- [ ] Search inputs have focus indicators
- [ ] Close button has focus-visible styles
- [ ] Currency suffix uses readable contrast
- [ ] Arrow separators use readable contrast

### US-4: Add Reduced Motion Support
- [ ] Confirmation modal animations respect prefers-reduced-motion
- [ ] Draft badge pulse respects motion preference
- [ ] SlideToConfirm pulse respects motion preference
- [ ] Payment pills shake respects motion preference
- [ ] Enrollment bounce respects motion preference
- [ ] FinancePage panel fade respects motion preference

### US-5: Fix Animation Timing and Typography
- [ ] SlideToConfirm duration-75 changed to duration-100
- [ ] SlideToConfirm cubic-bezier changed to ease-out
- [ ] All headings have font-headline class
- [ ] Spacing values aligned to 4px grid
- [ ] ReceiptDetailPanel modal uses glassmorphism
- [ ] FinancePage sticky header uses glassmorphism

### US-6: Remove Dead Code and Fix Barrel Exports
- [ ] useRefunds hook removed
- [ ] refunds API module removed
- [ ] useBalance trimmed to used properties only
- [ ] Unused barrel exports removed
- [ ] Unused API barrel exports removed
- [ ] Unused type barrel exports removed
- [ ] queryKeys.finance.receipts.search removed
- [ ] Dead types removed from balance.ts
- [ ] Legacy type exports removed
- [ ] METHOD_LABELS extracted to shared constants
- [ ] Duplicate imports merged

### US-7: Fix TypeScript Quality Issues
- [ ] Session storage uses unknown + type guards
- [ ] Payment method uses type guard function
- [ ] GroupBy options use as const
- [ ] Inline query keys replaced with factory
- [ ] transaction_type union removes string fallback
- [ ] Dead interface fields removed
- [ ] Redundant enabled: true removed

### US-8: Fix React Performance Issues
- [ ] FinancePage panels use React.lazy()
- [ ] Pagination import from direct path
- [ ] Finance hooks imported from direct paths
- [ ] Search results applied via callback/ref
- [ ] RegExp hoisted to module scope
- [ ] COLOR_STYLES hoisted to module scope
- [ ] getSessionDraft parsed once
- [ ] selectedReceiptId checked with !== null
- [ ] setTimeout gets ref + cleanup
- [ ] setActiveLineItemId called outside updater

### US-9: Fix Architecture Compliance
- [ ] ComingSoonPlaceholder renamed with domain prefix
- [ ] SlideToConfirm renamed with domain prefix
- [ ] PaymentMethodPills renamed with domain prefix
- [ ] TodayReceiptsFilters imports from common/
- [ ] UnpaidEnrollmentsFilters imports from common/
- [ ] ReceiptLineItemRow imports from common/
- [ ] CreateReceiptPanel imports from hooks/finance/

### US-10: Fix Bug Anti-Patterns
- [ ] TodayReceiptsList uses formatTime()
- [ ] ReceiptDetailPanel uses formatTime()/formatDate()
- [ ] EnrollmentSelection uses formatDate()
- [ ] handleRemoveLineItem calls setActiveLineItemId outside updater
- [ ] EnrollmentSelection useEffect deps fixed
- [ ] PRESET filter uses conditional check

## Verification Commands

```bash
npm run build    # Must pass with zero errors
npm run lint     # Must pass with zero errors

# Verify no remaining issues:
rg ': any' src/components/finance/ src/hooks/finance/
rg 'console\.' src/components/finance/ src/hooks/finance/
rg 'export default' src/components/finance/
rg 'useEffect.*get' src/hooks/finance/
rg 'toLocaleTimeString|toLocaleDateString|toLocaleString' src/components/finance/
rg 'as any' src/components/finance/ src/hooks/finance/
rg "queryKey: \['" src/hooks/finance/
rg 'staleTime.*120000' src/hooks/finance/
rg 'text-slate-400' src/components/finance/
rg 'aria-hidden' src/components/finance/ # Should find all icons
rg 'font-headline' src/components/finance/ # Should find all headings
```
