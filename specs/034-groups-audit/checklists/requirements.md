# Spec Quality Checklist — 034-groups-audit

## Completeness

- [x] All findings have severity, risk, file, line, before/after
- [ ] Every before/after snippet is minimal and correct (validate during implementation)
- [ ] Dead code deletions verified zero imports outside scoped feature (no cross-feature impact)
- [ ] All user-facing changes documented

## Correctness

- [ ] Status values match the actual API data model
- [ ] Import paths use `@tanstack/react-query` conventions
- [ ] Shared utilities (`formatDate`, `formatTime`) exist at expected paths
- [ ] Query keys match `src/hooks/queryKeys.ts` factory names

## Risk Assessment

- [ ] Breaking changes flagged with `risk: breaking` (Findings 1.1, 3.2, 3.3)
- [ ] All barrel deletions are safe — dead exports only
- [ ] Component deletions safe — confirmed zero imports outside tests

## Verification Coverage

- [x] Build gate (`npm run build`) listed
- [x] Lint gate (`npm run lint`) listed
- [x] Specific grep-based verification commands listed
- [ ] Manual QA steps documented for each user-facing change

## Post-Implementation Checks

### Build & Lint
```bash
npm run build
npm run lint
```

### No remaining issues
```bash
rg ': any' src/components/groups/ src/hooks/useGroup*.ts
rg 'console\.' src/components/groups/ src/hooks/useGroup*.ts
rg "queryKey: \['" src/components/groups/
```

### Accessibility
```bash
rg 'material-symbols-outlined' src/components/groups/ | rg -v 'aria-hidden'
# Expected: zero results
rg 'role="switch"' src/components/groups/
# Expected: at least 1 (AddSessionDialog toggle)
```
