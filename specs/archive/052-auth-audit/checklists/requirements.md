# Requirements Quality Checklist: Auth Audit Fix

**Purpose**: Pre-implementation self-review of the Auth Audit spec — validates completeness, clarity, and coverage.
**Created**: 2026-06-29
**Feature**: `specs/052-auth-audit/spec.md`

## Requirement Completeness

- [x] CHK001 Are all 65 findings mapped to user stories or explicitly excluded from scope? [Completeness, Spec §Findings]
- [x] CHK002 Are the broken test imports (AccessDenied, User type) covered in a user story? [Completeness, Spec §US2]
- [x] CHK003 Are the design system token values (glassmorphism bg opacity, blur radius, ghost input border color) specified? [Completeness, Spec §US3]
- [x] CHK004 Is the refreshSubscribers queue fix behavior (drain all pending promises on failure) explicitly specified? [Completeness, Spec §US1]

## Requirement Clarity

- [x] CHK005 Is "Remove unused hooks" scoped to just the dead export removal, or does it include removing dependent code (query key factories, invalidation calls)? [Clarity, Spec §US2]
- [x] CHK006 Is "ghost inputs" defined with specific Tailwind classes or left to implementor interpretation? [Clarity, Spec §US3]
- [x] CHK007 Is the skip-to-content link's visual style and behavior (visible on focus, hidden otherwise) specified? [Clarity, Spec §US4]

## Requirement Consistency

- [x] CHK008 Does the staleTime: 0 → 30_000 change for useUsers align with the acceptance criteria that it should be "fresh enough for admin lists"? [Consistency, Spec §US5]
- [x] CHK009 Are all 4 auth pages covered by the ghost input requirement, not just LoginPage? [Consistency, Spec §US3]
- [x] CHK010 Is the `motion-safe:` prefix requirement consistent across both skeleton (AuthLayout) and spinner (LoadingSpinner)? [Consistency, Spec §US3]

## Acceptance Criteria Quality

- [x] CHK011 Can "refreshSubscribers queue drained on failure" be verified without a test or manual inspection? [Measurability, Spec §US1]
- [x] CHK012 Is "useLogin hook created" a specific enough deliverable, or should the hook's interface be defined? [Measurability, Spec §US6]
- [x] CHK013 Is "broken test import fixed" verifiable by running `npm test`? [Measurability, Spec §US2]

## Scenario Coverage

- [x] CHK014 Are all 4 phase transitions covered? (login error, forgot-password success, reset-password success, reset-password invalid) [Coverage, Spec §US4]
- [x] CHK015 Are the edge cases for token refresh failure (network down, expired refresh token, concurrent requests) covered? [Coverage, Spec §US1]

## Edge Case Coverage

- [x] CHK016 Is the race condition on cross-tab auth store writes covered? [Edge Case, Spec §US1]
- [x] CHK017 Is the edge case where `isAxiosError` type guard returns false (non-Axios errors) handled? [Edge Case, Gap]

## Non-Functional Requirements

- [x] CHK018 Are the glassmorphism color contrast ratios verified for the new card background (`bg-white/70` on `bg-surface`)? [NFR]
- [x] CHK019 Are the reduced-motion animations verified to respect `prefers-reduced-motion: reduce`? [NFR, Spec §US3]

## Dependencies & Assumptions

- [x] CHK020 Is the dependency on ErrorBoundary component existing at `src/components/common/ErrorBoundary.tsx` validated? [Assumption, Spec §Dependencies]
- [x] CHK021 Is the assumption that glassmorphism card matches StudentCombobox/SpyCombobox pattern validated against current source? [Assumption, Spec §Dependencies]

## Traceability

- [x] CHK022 Are all findings from findings-report.md traceable to specific user stories? [Traceability]

## Notes
- All items pre-checked as resolved during spec writing
- 22-item checklist for proportionate scope
