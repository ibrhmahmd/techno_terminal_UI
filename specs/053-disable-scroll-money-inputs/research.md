# Research: Scroll Prevention Technique for Money Inputs

**Feature**: Disable Scroll Wheel on Money Inputs
**Date**: 2026-07-01

---

## Research Question

What technique should be used to prevent mouse wheel / trackpad scrolling from changing values on `<input type="number">` elements?

## Investigation

### Background: React Event Delegation

React uses synthetic event delegation — events are attached to the root container, not individual elements. For performance, React marks `onWheel` (and `onTouchStart`/`onTouchMove`) listeners as **passive** by default in browsers that support passive event listeners (Chrome 73+, Firefox 82+, Safari 13.1+).

**Implication**: `e.preventDefault()` inside a React `onWheel` handler is silently ignored by the browser. The default scroll behavior (changing the input value) cannot be prevented at the React synthetic event level.

### Technique Comparison

| Technique | Works React? | Keeps Focus? | Complexity | Browser Support |
|-----------|-------------|--------------|------------|-----------------|
| `onWheel` → `blur()` | Yes | No (removes focus) | 1 line per input | All browsers |
| `onWheel` → `preventDefault()` | **No** (passive listener) | N/A | N/A | N/A |
| Native `wheel` listener via ref (`{ passive: false }`) | Yes | Yes | Requires `useRef` + `useEffect` per component | Modern browsers |
| `type="text"` + `inputMode="decimal"` | Yes | Yes | Requires replacing input type + adding numeric validation | All modern browsers |

### Pattern Already in Codebase

```tsx
// src/components/enrollments/EnrollPanel.tsx:230
onWheel={(e) => (e.target as HTMLInputElement).blur()}
```

This is the only scroll prevention pattern in the codebase. It works reliably across all browsers.

### Recommendation for This Feature

Use the **`onWheel` → `blur()`** pattern already established in `EnrollPanel.tsx`:

```tsx
onWheel={(e) => (e.target as HTMLInputElement).blur()}
```

**Rationale**:
- Already proven in the codebase — no risk of unexpected behavior
- Single line of code per input — minimal diff, easy to review
- Works in all browsers — no compatibility concerns
- No dependencies, no refs, no lifecycle hooks needed
- Consistent with existing code — the `EnrollPanel.tsx` inputs already use this pattern

**Alternatives considered**:
- **Native `wheel` listener with `{ passive: false }`**: Better UX (keeps focus) but requires `useRef` + `useEffect` per component. Over-engineered for this use case — the cost of refactoring 10+ different files with useEffect boilerplate outweighs the UX benefit of keeping focus.
- **`type="text"` + `inputMode="decimal"`**: Most robust (eliminates native scroll behavior at source), but high risk of regressions — would require revalidating numeric formatting, min/max/step enforcement, and edge case behavior across every money input in the app.

### Trade-off Accepted

The `blur()` approach means the user loses focus on the input when they accidentally scroll. They must click back into the field to continue editing. This is a deliberate trade-off: the frustration of re-focusing is far lower than the risk of committing a financial error from an undetected value change.

## Decision

- **Technique**: `onWheel={(e) => (e.target as HTMLInputElement).blur()}`
- **Rationale**: React synthetic events are passive; `blur()` is the only reliable cross-browser approach without significant code restructuring
- **Consistency**: Apply the same line to all 14 unprotected inputs. Normalize the 2 existing inputs in `EnrollPanel.tsx` if they deviate (they already match this pattern — verify only).
- **No shared utility**: Apply inline per input. Creating a shared wrapper component is out of scope per spec assumptions.
