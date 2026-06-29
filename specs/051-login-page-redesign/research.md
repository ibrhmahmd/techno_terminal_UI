# Research: Login Page Redesign

## 1. Terminal/Grid Dot Pattern (CSS)

**Decision**: Pure CSS `background-image` with `radial-gradient` — no images or SVG sprites.

```css
background-image: radial-gradient(circle, rgba(var(--color-secondary), 0.08) 1px, transparent 1px);
background-size: 24px 24px;
```

- Scales proportionally on all viewport widths via `background-size`
- No HTTP request, no image file to maintain
- Color uses secondary token via `rgba()` with low opacity
- Can be toggled/removed by adding/removing the Tailwind class

**Alternatives considered**:
- SVG pattern `<defs>`: More control but requires inline SVG in the layout component
- PNG tile: Additional asset, doesn't scale well
- CSS `repeating-linear-gradient` crosses: More complex, harder to read

## 2. Password Visibility Toggle

**Decision**: Inline icon button inside the password input wrapper using relative positioning.

- Icon: `material-symbols-outlined` with `visibility` / `visibility_off`
- `aria-label` toggles between "Show password" / "Hide password"
- Input `type` toggles between `password` and `text`
- No third-party dependency — pure React state
- Focus management: toggle button keeps focus, input does not lose cursor position

## 3. Auth-Check Branded Skeleton

**Decision**: Full viewport skeleton rendered via `AuthLayout` with placeholder blocks.

- Renders immediately (no delay) — uses same layout structure as the real form
- Placeholder blocks: card outline, brand area rectangle, 2 field rectangles, button rectangle
- CSS animation: `animate-pulse` (Tailwind built-in) on each block
- Uses same AuthLayout component (identical structure, just skeleton children instead of form)
- No loading spinner library needed

## 4. Remember Me — localStorage Pattern

**Decision**: Email-only persistence in `localStorage` under key `tt_remember_email`.

- On submit success with "Remember Me" checked: `localStorage.setItem('tt_remember_email', email)`
- On submit success without "Remember Me": `localStorage.removeItem('tt_remember_email')`
- On login page mount: check localStorage, pre-fill email, check the checkbox
- Password is NEVER stored — security best practice
- Key prefixed with `tt_` to namespace for TechnoTerminal

## 5. Network Error Detection

**Decision**: Axios request that fails **without** a response object is a network error.

```typescript
if (isAxiosError(err) && !err.response) {
  // Network failure — no internet, DNS down, server unreachable
  setError('Unable to connect. Please check your internet connection and try again.')
} else if (isAxiosError(err) && err.response?.status === 429) {
  // Rate limited (existing behavior)
} else if (isAxiosError(err) && err.response?.status === 401) {
  // Invalid credentials (existing behavior)
} else {
  // Generic fallback
}
```

- `isAxiosError(err) && !err.response`: Request was sent but no response received
- This covers: network offline, DNS failure, server crash, connection refused
- Does not cover: request cancelled, timeout (Axios distinguishes these)
- Also check `err.code === 'ERR_NETWORK'` for Axios network error code

## 6. Mobile Responsive Strategy

**Decision**: Card goes full-width below 640px breakpoint using responsive utility classes.

- Desktop: `max-w-md` centered
- Mobile: `max-w-none w-full px-4` (full width with padding)
- Background pattern: Same `background-size` — pattern autoscales
- Use Tailwind `max-md:` prefix or custom `@media` queries

## 7. Accessibility Compliance (WCAG 2.1 AA)

| Checkpoint | Implementation |
|---|---|
| Error announcement | `role="alert"` on error banners (existing, confirm preserved) |
| Password toggle label | `aria-label="Show password"` / `aria-label="Hide password"` |
| Auth skeleton | `role="status"` with `aria-live="polite"` |
| Focus indicators | `focus-visible:ring-2` (existing, confirm preserved) |
| Tab order | Logical DOM order (email → password → toggle → submit → forgot link) |
| Countdown a11y | `aria-live="polite"` on the rate-limit countdown element |
| Color contrast | Confirm all token colors meet WCAG AA 4.5:1 ratio |
