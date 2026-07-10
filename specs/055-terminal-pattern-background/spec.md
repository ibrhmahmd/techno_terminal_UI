# Spec: Reusable Terminal Pattern Background

**Spec ID**: 055  
**Date**: 2026-07-10  
**Status**: Draft  
**Author**: Product

---

## 1. Problem Statement

The repeating terminal symbol matrix background was successfully introduced in the login page redesign (`AuthLayout.tsx`). The client requested that this branding pattern be unified across the rest of the website without compromising the readability of data-heavy tables and grids.

---

## 2. User Story

> As a user, I want to see the brand's terminal symbol matrix background subtly incorporated in headers and empty states throughout the application so that the design feels unified and premium, while keeping core data lists flat and highly legible.

---

## 3. Acceptance Criteria

| # | Criteria |
|---|----------|
| AC-1 | Extract the inline terminal pattern SVG from `AuthLayout.tsx` into a reusable component `TerminalPattern.tsx`. |
| AC-2 | Deduplicate `AuthLayout.tsx` by replacing the inline SVGs with the new `TerminalPattern` component. |
| AC-3 | Integrate `TerminalPattern` into the `PageHeader` component with a low opacity watermark (`opacity={0.04}`) to prevent visual noise. |
| AC-4 | Integrate `TerminalPattern` into the `EmptyState` component with a low opacity watermark (`opacity={0.03}`). |
| AC-5 | Ensure that the terminal pattern is non-interactive (`pointer-events-none`) and accessible (`aria-hidden="true"`). |
| AC-6 | Ensure all modified components compile cleanly and satisfy ESLint rules. |

---

## 4. Technical Design

### 4.1 Reusable Component

Create `src/components/common/TerminalPattern.tsx`:
```tsx
interface TerminalPatternProps {
  className?: string
  opacity?: number
  id?: string
}

export function TerminalPattern({ 
  className = '', 
  opacity = 0.12, 
  id = 'terminal-pattern' 
}: TerminalPatternProps) { ... }
```

### 4.2 Integration Areas

- **AuthLayout.tsx**:
  - Replace the outer SVG pattern with `<TerminalPattern id="auth-pattern" opacity={0.12} />`.
  - Replace the inner card SVG pattern with `<TerminalPattern id="card-pattern" opacity={1} className="opacity-[0.04]" />`.
- **PageHeader.tsx**:
  - Add relative styling and `<TerminalPattern opacity={0.04} id="header-pattern" />`.
  - Wrap existing header content in a relative container with `z-10`.
- **EmptyState.tsx**:
  - Add relative styling and `<TerminalPattern opacity={0.03} id="empty-state-pattern" />`.
  - Wrap content in `relative z-10`.

---

## 5. Visual Specifications

- Opacities must remain extremely low:
  - Headers: `4%` (`0.04`)
  - Empty States: `3%` (`0.03`)
- Patterns must have unique IDs to prevent SVG definition collisions.
- Positioning must be `absolute inset-0` with `overflow-hidden` on parent containers.
