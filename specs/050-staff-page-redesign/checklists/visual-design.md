# Checklist: Visual Design Requirements Quality

**Purpose**: Validate the completeness, clarity, and consistency of visual design requirements in the Staff Page Redesign spec.
**Created**: 2026-06-25
**Focus**: Visual design alignment — design tokens, card layout, hover states, accessibility, loading/error states

## Requirement Completeness

- [ ] CHK001 Are focus ring visual styling requirements (color, width, offset, border-radius) defined for keyboard-navigable cards? [Completeness, Spec §US1-AS4]
- [ ] CHK002 Are truncation/overflow requirements defined for long employee names, job titles, or email addresses? [Gap]
- [ ] CHK003 Are requirements defined for card layout adaptation at mobile breakpoints below `md` (single column), such as full-width content or stacked actions? [Completeness]
- [ ] CHK004 Are card mount/render animation requirements defined (e.g., fade-in, stagger) to match other card pages? [Gap]
- [ ] CHK005 Are requirements defined for the CardSkeleton → card transition (staggered or simultaneous swap)? [Gap, Spec §US2]
- [ ] CHK006 Are requirements defined for the employee avatar fallback when `full_name` produces empty initials? [Gap]

## Requirement Clarity

- [ ] CHK007 Is "visible focus ring" in US1-AS4 quantified with specific CSS properties (e.g., `ring-2 ring-cyan-400/70` matching `StudentCard`'s `focus-visible:ring-2 focus-visible:ring-cyan-400/70`)? [Clarity, Spec §US1-AS4]
- [ ] CHK008 Is "error banner appears above the empty card grid" in US2-AS2 specific about whether the ErrorState renders inside or outside the CardGrid parent? [Clarity, Spec §US2-AS2]
- [ ] CHK009 Is "matches the other card pages" in FR-003 explicitly scoped to StudentCard/GroupCard patterns (documented in the gap table at §Current State Assessment) rather than an unspecified reference? [Clarity, Spec §FR-003]
- [ ] CHK010 Is the `hover:border-secondary/30` color change consistent with the Material Design secondary token defined in `tailwind.config.js`? [Clarity, Spec §Design Token Migration, FR-006]

## Requirement Consistency

- [ ] CHK011 Do the design token migration targets (`text-on-surface`, `text-on-surface-variant`) match the actual tokens used by StudentCard/GroupCard in source code, or are tokens used differently across those components? [Consistency, Spec §Design Token Migration]
- [ ] CHK012 Is the CardSkeleton layout (3-line + 3 action icons) consistent with EmployeeCard content density (avatar + 5 info rows + footer), or will the skeleton mismatch the final card height? [Consistency, Spec §FR-001, SC-003]

## Acceptance Criteria Quality

- [ ] CHK013 Can SC-001's 6 measurable checkpoints be verified by any developer without subjective judgment, or are additional properties (font-weight, line-height, letter-spacing, border-radius values) needed to ensure parity? [Measurability, Spec §SC-001]
- [ ] CHK014 Can SC-004 ("no hardcoded text-slate-* or bg-slate-* classes remain") be verified via a grep/search to guarantee zero violations? [Measurability, Spec §SC-004]
- [ ] CHK015 Is SC-005's requirement "all three action buttons remain functional via RowActions" verifiable by checking that RowActions renders exactly 3 items with the correct onClick bindings? [Measurability, Spec §SC-005]

## Scenario Coverage

- [ ] CHK016 Are visual design requirements specified for the transition from loading skeleton (CardSkeleton) to populated card grid? [Coverage, Gap]
- [ ] CHK017 Are requirements defined for the employee card appearance when all optional fields (phone, email, job_title) are null — does the card collapse vertically or maintain consistent height? [Coverage, Spec §US1 gap table]
- [ ] CHK018 Are visual requirements specified for the empty employees state matching the directory page's empty state pattern (icon + message)? [Coverage, Spec §US2]

## Edge Case Coverage

- [ ] CHK019 Is the behavior specified when RowActions receives fewer than 3 actions (e.g., onCreateAccount not provided)? [Edge Case]
- [ ] CHK020 Are requirements defined for the employee card when `is_active` is null/undefined (currently `employee.is_active ? 'active' : 'inactive'` assumes boolean)? [Edge Case]

## Non-Functional — Accessibility

- [ ] CHK021 Are `aria-label` requirements specified for the whole-card click target (e.g., "View [full_name] details")? [A11y, Gap]
- [ ] CHK022 Are focus management requirements defined when EmployeeDetailModal opens (focus trap inside modal) and closes (return focus to triggering card)? [A11y, Gap]
- [ ] CHK023 Is `prefers-reduced-motion` considered for the `transition-all duration-300` hover animation? [A11y, Gap]

## Dependencies & Assumptions

- [ ] CHK024 Is the dependency on shared components (CardGrid, CardSkeleton, RowActions) being stable and API-compatible documented as an assumption? [Assumption]
- [ ] CHK025 Is the assumption that StudentCard/GroupCard styling is the correct canonical reference rather than an alternative like WaitingStudentCard documented? [Assumption, Spec §FR-003]
