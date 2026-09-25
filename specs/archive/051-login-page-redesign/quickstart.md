# Quickstart: Login Page Redesign

## Branch

```bash
git checkout 051-login-page-redesign
npm install  # already up to date
```

## Files to create

| File | Purpose |
|------|---------|
| `src/components/auth/AuthLayout.tsx` | Shared layout wrapper for all auth pages |
| `src/components/auth/AuthLayoutSkeleton.tsx` | Branded card skeleton for auth check loading |

## Files to modify

| File | Changes |
|------|---------|
| `src/pages/LoginPage.tsx` | Use AuthLayout, password toggle, remember-me, network error handling, auto-focus |
| `src/pages/ForgotPasswordPage.tsx` | Use AuthLayout (extract card wrapper) |
| `src/pages/RegisterPage.tsx` | Use AuthLayout (extract card wrapper) |
| `src/pages/ResetPasswordPage.tsx` | Use AuthLayout (extract card wrapper) |

## Build & test

```bash
npm run lint          # zero errors
npm run build         # tsc -b && vite build
npm run test          # existing LoginPage tests pass
```

## Visual design

Use the Pencil CLI to generate a login page mockup before implementing:

```bash
npx pencil --out designs/login.pen --prompt "..." --export designs/login.png --export-scale 2
```

## Key decisions

- Terminal/grid dot pattern via CSS `radial-gradient` (no images)
- Password toggle uses `aria-label="Show password"` / `"Hide password"`
- Remember Me stores email only in localStorage (`tt_remember_email` key)
- Auth skeleton uses same AuthLayout component with `showSkeleton` prop
- Network errors detected via `isAxiosError(err) && !err.response`
- Mobile: card full-width at <640px with 16px padding
