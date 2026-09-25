# Feature Audit Report: Comboboxes
Generated: 2026-06-18 | Phases: bug,dead-code,ts-quality,data-fetch,a11y-ux,react-perf,arch-compliance,ui-polish | Mode: standard

## Severity Heatmap
🟥 Critical: 5   🟧 High: 28   🟨 Medium: 22   🟩 Low: 22

## Breakdown by Phase
| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Bug | 0 | 2 | 4 | 1 | 7 |
| DeadCode | 0 | 2 | 4 | 3 | 9 |
| TS | 1 | 2 | 1 | 1 | 5 |
| Fetch | 0 | 1 | 1 | 0 | 2 |
| A11y | 4 | 9 | 6 | 0 | 19 |
| Perf | 0 | 3 | 4 | 7 | 14 |
| Arch | 0 | 7 | 2 | 2 | 11 |
| UI | 0 | 4 | 5 | 9 | 18 |
| **Total** | **5** | **28** | **22** | **22** | **77** |

## Top Findings (Critical & High)

### 🔴 A11y: StudentCombobox.tsx:186
**Rule**: WCAG-4.1.2-label | **Risk**: breaking
**Before**: `<input ... placeholder="Search student (min 2 chars)..." />`
**After**: `<input ... placeholder="Search student (min 2 chars)..." aria-label="Search student" />`

### 🔴 A11y: GroupCombobox.tsx:224
**Rule**: WCAG-4.1.2-label | **Risk**: breaking
**Before**: `<input ... placeholder="Search groups by name, course, or instructor..." />`
**After**: `<input ... placeholder="Search groups by name, course, or instructor..." aria-label="Search group" />`

### 🔴 A11y: InstructorCombobox.tsx:158
**Rule**: WCAG-4.1.2-label | **Risk**: breaking
**Before**: `<input ... placeholder="Search instructor by name..." />`
**After**: `<input ... placeholder="Search instructor by name..." aria-label="Search instructor" />`

### 🔴 A11y: SpyCombobox.tsx:264
**Rule**: WCAG-4.1.2-label | **Risk**: breaking
**Before**: `<input ... placeholder={placeholder} />`
**After**: `<input ... placeholder={placeholder} aria-label="Search" />`

### 🔴 TS: SpyCombobox.tsx:1
**Rule**: verbatim-module-syntax | **Risk**: breaking
**Before**: `import React, { useState, useRef, useEffect, type ReactNode } from 'react'`
**After**: `import type React from 'react'\nimport { useState, useRef, useEffect, type ReactNode } from 'react'`

### 🟧 Bug: InstructorCombobox.tsx:17
**Rule**: no-debounced-api-search | **Risk**: moderate
**Before**: `const { data, isLoading } = useEmployees(search, 1, 50)`
**After**: Add debouncedSearch state with 300ms debounce

### 🟧 Bug: InstructorCombobox.tsx:17
**Rule**: missing-enabled-guard | **Risk**: breaking
**Before**: `const { data, isLoading } = useEmployees(search, 1, 50)`
**After**: Add `enabled: debouncedSearch.length >= 2`

### 🟧 DeadCode: StudentCombobox.tsx:33
**Rule**: duplicate-implementation-pattern | **Risk**: moderate
**Finding**: Click-outside handler duplicated across 3 combobox files
**After**: Extract to `useClickOutside` hook

### 🟧 DeadCode: StudentCombobox.tsx:44
**Rule**: duplicate-implementation-pattern | **Risk**: moderate
**Finding**: Viewport flip logic duplicated across 3 combobox files
**After**: Extract to `useDropdownPosition` hook

### 🟧 Arch: StudentCombobox.tsx:2
**Rule**: cross-feature-import | **Risk**: moderate
**Before**: `import type { StudentListItem } from '../../../api/crm'`
**After**: Move to `src/components/student/`

### 🟧 Arch: GroupCombobox.tsx:2
**Rule**: cross-feature-import | **Risk**: moderate
**Before**: `import type { EnrichedGroupPublic } from '../../../api/academics'`
**After**: Move to `src/components/groups/`

### 🟧 Arch: InstructorCombobox.tsx:2
**Rule**: cross-feature-import | **Risk**: moderate
**Before**: `import { useEmployees } from '../../../hooks/useStaff'`
**After**: Move to `src/components/staff/`

### 🟧 Perf: StudentCombobox.tsx:337
**Rule**: rerender-n-squared-in-render | **Risk**: moderate
**Finding**: `.some()` inside `.map()` render loop — O(n×m)
**After**: Use `Set.has()` for O(1) lookups

### 🟧 UI: StudentCombobox.tsx:195
**Rule**: focus-indicator-removed | **Risk**: moderate
**Before**: `focus:outline-none focus:ring-2`
**After**: `focus-visible:ring-2 focus-visible:outline-none`

### 🟧 UI: StudentCombobox.tsx:306
**Rule**: semantic-div-onclick | **Risk**: safe
**Before**: `<div role="button" tabIndex={0} onClick={...}>`
**After**: `<button type="button" onClick={...}>`

## File-by-File Summary
| File | Bugs | DeadCode | TS | Fetch | A11y | Perf | Arch | UI | Score |
|------|------|----------|----|-------|------|------|------|----|-------|
| StudentCombobox.tsx | 1 | 2 | 1 | 0 | 4 | 2 | 2 | 6 | 🟧 18 |
| GroupCombobox.tsx | 1 | 2 | 1 | 0 | 4 | 2 | 2 | 6 | 🟧 18 |
| InstructorCombobox.tsx | 2 | 1 | 1 | 1 | 4 | 1 | 2 | 6 | 🟧 18 |
| SpyCombobox.tsx | 1 | 0 | 1 | 0 | 4 | 3 | 0 | 4 | 🟧 13 |
| index.ts | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 3 |
| useRecentGroups.ts | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 1 |
| useStaff.ts | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 🟩 1 |

Score legend:
- 🟩 0-2 findings — Clean
- 🟨 3-5 findings — Needs attention
- 🟧 6-10 findings — Needs significant work
- 🟥 10+ findings — Needs rewrite
