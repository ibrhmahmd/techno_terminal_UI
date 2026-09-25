# Feature Specification: Settings Page Audit & Fix

**Feature Branch**: `040-settings-audit-fix`
**Created**: 2026-06-05
**Status**: Draft
**Input**: Audit findings from /audit-feature settings

## User Scenarios & Testing

### User Story 1 - Fix Runtime Bugs That Break Settings Inputs (Priority: P1)

Admin managing age-bucket configurations for student grouping cannot create a bucket with a minimum age of 0 because the "Add" button stays disabled. The falsy-`0` check also makes input fields appear blank when a valid 0 value is stored. These bugs prevent correct configuration of age-based student grouping.

**Why this priority**: These bugs directly prevent admins from completing essential configuration tasks, causing data integrity issues and frustration.

**Independent Test**: Can be fully tested by opening the CRM Settings section (Age Bucket Editor), entering min=0 and max=2, clicking "Add" — the bucket should be created and displayed correctly.

**Acceptance Scenarios**:

1. **Given** the Age Bucket Editor is open, **When** an admin enters a minimum age of 0 and a maximum age of 2 with a valid label, **Then** the "Add" button is enabled and clicking it creates the bucket.
2. **Given** an existing bucket with min=0, **When** the editor loads, **Then** the min field displays "0" rather than appearing blank.
3. **Given** an existing bucket with max=0, **When** the editor loads, **Then** the max field displays "0" rather than appearing blank.

---

### User Story 2 - Fix Stale Closure and Inconsistent Query Parameters (Priority: P1)

Admins managing users on the settings page encounter a stale closure bug in the User Detail modal: after dismissing a delete-confirmation dialog, pressing Escape closes the parent modal unexpectedly instead of doing nothing. Additionally, the audit failed-attempts section sends inconsistent query parameters compared to the other audit sections.

**Why this priority**: The stale closure bug creates a confusing UX where Escape behavior changes after certain interactions. The inconsistent query parameter risks cache mismatches and data fetching errors.

**Independent Test**: Open User Detail modal, open Delete Confirmation, dismiss it, press Escape — the parent modal should not close.

**Acceptance Scenarios**:

1. **Given** a User Detail modal is open and a delete confirmation dialog is visible, **When** the admin dismisses the confirmation dialog and presses Escape, **Then** the parent User Detail modal remains open.
2. **Given** the Audit Failed Attempts section is loaded, **When** the date-from filter is cleared, **Then** the query parameter is sent as `undefined` (not empty string), matching the behavior of the Login and Password Change audit sections.

---

### User Story 3 - Remove Dead Components and Consolidate Duplicates (Priority: P1)

Four components in the settings feature are never rendered: `SessionsTab`, `ActivityTab`, `CRMSettingsTab`, and `AgeBucketEditor`. The first two are duplicates of functionality already provided by `SessionsActivityTab`. The CRMSettingsTab only wraps the AgeBucketEditor, which itself is only consumed by the dead wrapper.

**Why this priority**: Dead code adds maintenance burden, increases bundle size, and creates confusion for developers about which component to use.

**Independent Test**: Verify `npm run build` succeeds and grep for imports of each dead component yields zero results (excluding test files and the component's own definition).

**Acceptance Scenarios**:

1. **Given** the build pipeline, **When** running `tsc -b` and `vite build`, **Then** no errors related to removed files occur.
2. **Given** the codebase, **When** grepping for `SessionsTab`, `ActivityTab`, `CRMSettingsTab`, **Then** no import references are found outside test files and the component's own definition file.

---

### User Story 4 - Fix Data Fetching Anti-Patterns (Priority: P2)

The Users tab's search function claims to be debounced but uses `useCallback` instead of the project's `useDebounce` hook, causing a new API call on every keystroke instead of waiting for the user to pause typing. Additionally, the password change mutation omits `onSuccess` cache invalidation that every other mutation in the same file includes, risking stale data.

**Why this priority**: Unnecessary API calls waste server resources and degrade UX for admins searching through users. Missing cache invalidation is an inconsistency that could cause subtle bugs if auth data is later extended.

**Independent Test**: Type a search term in the Users tab — API calls should only fire after a brief pause (debounce), not on every keystroke.

**Acceptance Scenarios**:

1. **Given** the Users tab is open, **When** an admin types a search term, **Then** API calls are debounced by 350ms (only firing after the user stops typing).
2. **Given** a password change is completed, **Then** the relevant auth query cache is invalidated so subsequent reads fetch fresh data.

---

### User Story 5 - Add ARIA and Keyboard Accessibility to All Settings Controls (Priority: P2)

The settings feature has systematic accessibility gaps: 5 modals lack focus traps, 20+ label/input pairs lack programmatic association via `htmlFor`/`id`, 26 decorative icons lack `aria-hidden`, icon-only buttons lack `aria-label`, 3 tables lack `scope="col"` on headers, empty states lack `role="status"`, and dynamic success/error messages lack `role="alert"`. These gaps make the settings page difficult or impossible to use with screen readers.

**Why this priority**: Accessibility is a legal and ethical requirement. The systematic nature of these gaps indicates a pattern that must be addressed holistically.

**Independent Test**: Navigate the entire settings page using VoiceOver/NVDA. All buttons have distinct labels, all icons are hidden from screen readers, all form controls have associated labels, modals trap focus, and dynamic messages are announced.

**Acceptance Scenarios**:

1. **Given** any modal (User Detail, Invite, Create User, Reset Password, Delete Confirm), **When** it opens, **Then** focus moves to the modal and is trapped within it (Tab cycles through modal elements, Escape closes the modal).
2. **Given** any form input in Profile, Users, or Audit Log sections, **When** inspected by a screen reader, **Then** the label is programmatically associated via `htmlFor`/`id` attributes.
3. **Given** any icon-only button (Add bucket, Remove bucket, Close modals), **When** inspected by a screen reader, **Then** it has a meaningful `aria-label` and the icon element has `aria-hidden="true"`.
4. **Given** any table in the settings feature, **When** inspected by a screen reader, **Then** all column headers have `scope="col"`.
5. **Given** an empty search result or data list, **When** the empty state appears, **Then** it is announced via `role="status"`.
6. **Given** a success or error message appears after a mutation (save profile, invite user, etc.), **When** the message appears, **Then** it is announced via `role="alert"`.
7. **Given** the Settings page tabs, **When** inspected by a screen reader, **Then** each tabpanel has a correct `aria-label` that maps to the visible tab label.

---

### Edge Cases

- What happens when an admin enters a non-numeric value in Age Bucket min/max fields? Form should validate for numbers.
- What happens when the audit failed-attempts date-from filter is set and then cleared? Query should fall back to no filter (undefined), not empty string.
- What happens when a User Detail modal is closed during an active delete confirmation? The confirmation should be dismissed cleanly.
- How does the system handle rapid toggling between settings tabs? Focus should move to the active tabpanel.
- What happens if a screen reader user opens a modal with no focusable elements? Focus should be placed on the modal container itself.

## Requirements

### Functional Requirements

- **FR-001**: Add button in Age Bucket Editor MUST enable correctly when min=0 or max=0 is entered.
- **FR-002**: Age Bucket input fields MUST display stored value "0" instead of appearing blank.
- **FR-003**: User Detail Modal Escape key handler MUST respect the `showDeleteConfirm` state to prevent premature closing.
- **FR-004**: Audit Failed Attempts section MUST send `undefined` (not empty string) for cleared date-from filters, matching sibling audit sections.
- **FR-005**: Dead components (SessionsTab, ActivityTab, CRMSettingsTab) MUST be removed without breaking the build.
- **FR-006**: Transitively dead AgeBucketEditor component MUST be removed, but its underlying store and config must remain intact for the directory feature.
- **FR-007**: Users tab search MUST debounce API calls by at least 300ms using the project's `useDebounce` hook.
- **FR-008**: Password change mutation MUST invalidate relevant auth cache on success, consistent with other mutations in the same file.
- **FR-009**: All modals MUST trap keyboard focus when open (focus stays within modal, Tab cycles modal elements, Escape closes).
- **FR-010**: All form label/input pairs MUST be programmatically associated via `htmlFor` and `id`.
- **FR-011**: All icon-only buttons MUST have a meaningful `aria-label`.
- **FR-012**: All decorative icon spans using `material-symbols-outlined` MUST have `aria-hidden="true"`.
- **FR-013**: All table column headers MUST have `scope="col"`.
- **FR-014**: Empty state text MUST have `role="status"` for screen reader announcement.
- **FR-015**: Dynamic success/error messages after mutations MUST have `role="alert"`.

### Key Entities

- **Admin User**: Person managing system settings (profile, sessions, users, audit logs, CRM configuration)
- **Age Bucket**: Configuration for segmenting students by age range (min, max, label), used by the directory feature
- **User Account**: Managed user within the system (create, edit, invite, deactivate, delete)
- **Audit Log**: Record of security events (logins, password changes, failed attempts) for review
- **Active Session**: Currently authenticated device/browser sessions that can be viewed and revoked

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admins can create age buckets with age 0 as minimum value in under 3 clicks, without workarounds.
- **SC-002**: User Detail modal Escape key behavior is consistent across all states (no unexpected modal closures).
- **SC-003**: Build output size decreases measurably after removing 4 dead components (fewer bundled bytes).
- **SC-004**: Users tab search API calls are reduced by at least 80% during rapid typing (debounce prevents per-keystroke requests).
- **SC-005**: 100% of interactive controls (buttons, inputs, links) on the Settings page are accessible via keyboard and announced correctly by screen readers.
- **SC-006**: Zero accessibility violations for the Settings page when tested with standard automated accessibility audit tools (axe, Lighthouse).

## Assumptions

- The `useDebounce` hook at `src/hooks/useDebounce.ts` is suitable for the Users tab search and does not require modification.
- The underlying store (`useGroupingSettingsStore`) and config (`studentGrouping`) used by AgeBucketEditor must remain intact — only the component itself is removed.
- All modals in the settings feature follow the same structure (fixed overlay + inner container) and can share a consistent focus-trap implementation.
- The project's existing `formatDate` utility from `src/utils/formatting.ts` is already used elsewhere and is adequate for replacing inline `toLocaleString()` calls.
- No backend changes are required — all fixes are frontend-only.
- The five inline `toLocaleString()` instances across ProfileTab, SessionsActivityTab, SessionsTab, ActivityTab, UsersTab, and AuditLogTable are addressed as part of the bug-fix or dead-code-removal stories (components being removed make some instances moot).
