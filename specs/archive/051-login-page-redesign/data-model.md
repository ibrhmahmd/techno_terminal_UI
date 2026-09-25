# Data Model: Login Page Redesign

## AuthLayout Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | — | Page heading (e.g., "Sign In", "Reset Password") |
| `subtitle` | `string` | Yes | — | Page description below heading |
| `children` | `ReactNode` | Yes | — | Form content rendered inside the card |
| `showBranding` | `boolean` | No | `true` | Show/hide the "TechnoTerminal" brand header |
| `showSkeleton` | `boolean` | No | `false` | Show skeleton placeholder instead of children |

## localStorage Schema

Used by Remember Me feature only. No backend persistence.

| Key | Value | Type | Max Length | Description |
|-----|-------|------|------------|-------------|
| `tt_remember_email` | Email string | `string` | 254 chars | Last remembered email, empty string means no saved email |

## State (component-local, no global store)

| State | Type | Owner | Description |
|-------|------|-------|-------------|
| `showPassword` | `boolean` | `LoginPage` | Controls password field visibility toggle |
| `rememberMe` | `boolean` | `LoginPage` | Checkbox state for Remember Me |
| `isCheckingAuth` | `boolean` | `LoginPage` | True while AuthLayout skeleton is shown (before redirect) |

## Error States

| Error Type | Detection | HTTP Status | Message |
|-----------|-----------|-------------|---------|
| Invalid credentials | `err.response?.status === 401` | 401 | "Invalid email or password." |
| Rate limited | `err.response?.status === 429` | 429 | "Too many attempts. Try again in {N}s." |
| Network failure | `isAxiosError && !err.response` | N/A | "Unable to connect. Please check your internet connection and try again." |
| Generic | Fallback | Any | "An unexpected error occurred." |
