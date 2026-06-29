# Tasks — Login Page Redesign

**Date**: 2026-06-29 | **Spec**: `spec.md` | **Plan**: `plan.md`

## Task List

### T-001 Create `AuthLayout` component
- [ ] Create `src/components/auth/AuthLayout.tsx`
- [ ] Terminal dot grid background via CSS `radial-gradient`
- [ ] Brand header: "TechnoTerminal" heading + tagline
- [ ] Props: `{ title, subtitle, children, showBranding? }`
- [ ] Skeleton mode: when no children, render placeholder blocks with pulse animation
- [ ] Mobile: full-width card below 640px
- [ ] a11y: skeleton uses `role="status"` + `aria-live="polite"`
- [ ] Build passes

### T-002 Enhance `LoginPage` with AuthLayout + UX features
- [ ] Import and wrap in `<AuthLayout>`
- [ ] Password visibility toggle (`material-symbols-outlined: visibility` / `visibility_off`)
- [ ] Auto-focus email input on mount
- [ ] Auth-check skeleton: render AuthLayout skeleton while `isAuthenticated` is undetermined
- [ ] "Remember Me" checkbox persisted to `localStorage`
- [ ] Network error distinction (FR-010)
- [ ] Rate-limit countdown in submit button text (FR-007)
- [ ] All a11y requirements (FR-011)
- [ ] Build passes

### T-003 Migrate `ForgotPasswordPage` to AuthLayout
- [ ] Wrap form in `<AuthLayout>`
- [ ] Remove manual card wrapper markup
- [ ] Both form and submitted-success states use AuthLayout
- [ ] Build passes

### T-004 Migrate `RegisterPage` to AuthLayout
- [ ] Wrap form in `<AuthLayout>`
- [ ] Remove manual card wrapper markup
- [ ] Both invalid-token and form states use AuthLayout
- [ ] Build passes

### T-005 Migrate `ResetPasswordPage` to AuthLayout
- [ ] Wrap form in `<AuthLayout>`
- [ ] Remove manual card wrapper markup
- [ ] All three phases (invalid, form, success) use AuthLayout
- [ ] Build passes

### T-006 Update existing tests
- [ ] Verify existing LoginPage tests still pass with new UI
- [ ] Update any selectors if DOM structure changed
- [ ] `npm run test -- src/tests/auth/LoginPage.test.tsx` passes
