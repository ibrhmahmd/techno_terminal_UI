# Research: Combobox Feature Audit & Fix

**Date**: 2026-06-18  
**Feature**: Combobox Components  
**Branch**: `049-combobox-audit`

---

## R1: Click-Outside Handler Pattern

**Decision**: Extract to `useClickOutside` hook in `src/hooks/useClickOutside.ts`

**Rationale**: Identical click-outside handler duplicated across StudentCombobox, GroupCombobox, and InstructorCombobox. Single hook reduces code duplication and ensures consistent behavior.

**Implementation**:
```typescript
import { useEffect, type RefObject } from 'react'

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler])
}
```

**Alternatives considered**:
- Inline handler in each component (rejected: violates DRY)
- Higher-order component (rejected: adds unnecessary wrapper complexity)
- CSS-only solution (rejected: not possible for click-outside detection)

---

## R2: Dropdown Position Flip Pattern

**Decision**: Extract to `useDropdownPosition` hook in `src/hooks/useDropdownPosition.ts`

**Rationale**: Viewport flip logic (check space below, flip above if insufficient) duplicated across all 3 domain comboboxes. Centralizes the positioning logic.

**Implementation**:
```typescript
import { useState, useEffect, useRef, useCallback } from 'react'

export function useDropdownPosition(deps: unknown[]) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [dropdownAbove, setDropdownAbove] = useState(false)

  const updatePosition = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setDropdownAbove(spaceBelow < 350 && rect.top > spaceBelow)
    }
  }, [])

  useEffect(() => {
    const handle = requestAnimationFrame(() => updatePosition())
    return () => cancelAnimationFrame(handle)
  }, [updatePosition, ...deps])

  return { wrapperRef, dropdownAbove }
}
```

**Alternatives considered**:
- Floating UI library (rejected: overkill for simple flip logic)
- CSS-only positioning (rejected: needs JS to measure viewport)

---

## R3: Category Selection Pattern

**Decision**: Extract to shared utility function (not a hook, since it's pure computation)

**Rationale**: Category computation and active key selection logic duplicated across all comboboxes. Pure function is simpler than hook.

**Implementation**:
```typescript
export function computeActiveCategory<T extends { key: string }>(
  groupedData: T[],
  selectedCategoryKey: string
): string {
  if (groupedData.length === 0) return ''
  const exists = groupedData.some(g => g.key === selectedCategoryKey)
  return exists ? selectedCategoryKey : groupedData[0].key
}
```

**Alternatives considered**:
- Custom hook (rejected: no side effects, pure computation)
- Context provider (rejected: overkill for local state)

---

## R4: Debounced Search in InstructorCombobox

**Decision**: Add local `debouncedSearch` state with 300ms debounce (same pattern as GroupCombobox)

**Rationale**: InstructorCombobox passes raw search to useEmployees, firing a request on every keystroke. GroupCombobox already implements proper debouncing.

**Implementation**:
```typescript
const [debouncedSearch, setDebouncedSearch] = useState(search)
const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

useEffect(() => {
  clearTimeout(debounceRef.current)
  debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
  return () => clearTimeout(debounceRef.current)
}, [search])

const { data, isLoading } = useEmployees(debouncedSearch, 1, 50)
```

**Alternatives considered**:
- useDebounce hook from library (rejected: adds dependency for simple case)
- Debounce in useEmployees hook (rejected: moves responsibility away from caller)

---

## R5: Enabled Guard for useEmployees

**Decision**: Add `enabled: debouncedSearch.trim().length >= 2` to useEmployees query

**Rationale**: Prevents fetching entire employee list on mount with empty string. Aligns with GroupCombobox pattern where server search only fires when debouncedSearch >= 2 chars.

**Implementation**:
```typescript
export function useEmployees(search: string, page: number, pageSize: number, employmentType?: string) {
  const trimmed = search.trim()
  return useQuery({
    queryKey: staffKeys.list({ search: trimmed, page, pageSize, employment_type: employmentType }),
    queryFn: async () => {
      const result = await fetchEmployeesPaginated({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        q: trimmed || undefined,
        employment_type: employmentType
      })
      return result
    },
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}
```

**Alternatives considered**:
- Guard in InstructorCombobox (rejected: hook should own its enabling logic)
- Remove guard entirely (rejected: causes unnecessary API calls)

---

## R6: Type Assertions for Recent Items

**Decision**: Use `satisfies` operator instead of `as` assertion

**Rationale**: `as` assertion silently hides missing required fields. `satisfies` validates the shape while preserving literal types.

**Implementation**:
```typescript
const recentGroup = {
  id: Number(r.id),
  name: r.name,
  course_name: 'Recently Used',
  status: 'active',
  capacity: 0,
  current_level: 1,
  instructor_name: '', // Required field now explicit
} satisfies EnrichedGroupPublic
```

**Alternatives considered**:
- Partial type with optional fields (rejected: changes API contract)
- Remove type annotation entirely (rejected: loses documentation value)

---

## R7: Glassmorphism Pattern

**Decision**: Apply `bg-white/70 backdrop-blur-xl` to dropdown panels

**Rationale**: Design system convention requires glassmorphism for overlays. Current solid white bg breaks visual consistency.

**Implementation**:
```tsx
<div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl ...">
```

**Alternatives considered**:
- Keep solid white (rejected: breaks design system)
- Use full opacity (rejected: defeats glassmorphism purpose)

---

## R8: Focus Visible Pattern

**Decision**: Replace `focus:` with `focus-visible:` for keyboard-only focus indicators

**Rationale**: `focus:` applies ring on both click and keyboard navigation. `focus-visible:` only shows ring on keyboard navigation, which is the intended UX pattern.

**Implementation**:
```tsx
<input className="focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary focus-visible:outline-none ..." />
```

**Alternatives considered**:
- Remove focus indicator entirely (rejected: accessibility violation)
- Keep focus: (rejected: shows ring on mouse click, poor UX)

---

## R9: Semantic HTML for Result Items

**Decision**: Convert `<div role="button">` to `<button type="button">`

**Rationale**: Semantic HTML provides built-in keyboard navigation, focus management, and screen reader support without manual ARIA attributes.

**Implementation**:
```tsx
<button
  type="button"
  onClick={() => onSelect(item)}
  className="text-left w-full border border-slate-200 ..."
>
  {renderItem(item)}
</button>
```

**Alternatives considered**:
- Keep div with role=button (rejected: requires manual tabIndex and keyboard handlers)
- Use anchor tags (rejected: no navigation involved)

---

## R10: Motion Safe Animation

**Decision**: Add `motion-safe:` prefix to `animate-pulse`

**Rationale**: Users with vestibular disorders may experience discomfort from animations. `motion-safe:` respects `prefers-reduced-motion` media query.

**Implementation**:
```tsx
<div className="motion-safe:animate-pulse border border-slate-100 ...">
```

**Alternatives considered**:
- Remove animation entirely ( rejected: loses loading feedback)
- Use `motion-reduce:` (rejected: wrong direction — should default to animated)

---

## R11: React.memo Wrapping

**Decision**: Wrap all 4 combobox components in `React.memo`

**Rationale**: Components receive objects/functions as props that create new references each render. `React.memo` prevents unnecessary re-renders when props are shallowly equal.

**Implementation**:
```typescript
export const StudentCombobox = React.memo(function StudentCombobox({ ... }: StudentComboboxProps) {
  // ...
})
```

**Alternatives considered**:
- useMemo for child components (rejected: doesn't prevent parent re-renders)
- useCallback for handlers (partial solution, doesn't cover all props)

---

## R12: Set-Based Lookups for Performance

**Decision**: Replace `.some()` and `.includes()` in loops with `Set.has()`

**Rationale**: `.some()` and `.includes()` are O(n) per call. When called inside `.map()`, creates O(n×m) complexity. `Set.has()` is O(1).

**Implementation**:
```typescript
// Before: O(n×m)
{recentStudents.some(r => String(r.id) === String(s.id)) && ...}

// After: O(n+m)
const recentIdSet = useMemo(
  () => new Set(recentStudents.map(r => String(r.id))),
  [recentStudents]
)
{recentIdSet.has(String(s.id)) && ...}
```

**Alternatives considered**:
- Array.find (rejected: same O(n) complexity)
- Object as map (rejected: string keys only, less ergonomic)
