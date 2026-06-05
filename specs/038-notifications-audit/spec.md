# Feature Specification: Notifications Feature Audit & Fix

**Feature Branch**: `038-notifications-audit`  
**Created**: 2026-06-05  
**Status**: Draft  
**Input**: Audit of the notifications feature (page, 4 tabs, 7 hooks, 6 API modules, types)

## User Scenarios & Testing

### User Story 1 — Fix Runtime Bugs (Priority: P1)

As an administrator, I want the notifications pages to not crash when the API returns null fields, so that the UI is always stable.

**Acceptance Scenarios**:
1. **Given** the templates tab, **When** a template has `variables: null`, **Then** the UI renders "(0) variables" instead of crashing.
2. **Given** the Test Modal, **When** a template has required variables like `{{student_name}}`, **Then** the modal provides inputs for each variable so they can be filled before testing.

### User Story 2 — Remove Dead Code (Priority: P1)

As a developer, I want unused components, hooks, types, and query keys removed so the codebase is maintainable.

**Acceptance Scenarios**:
1. **Given** the codebase, **When** searching for imports of `TemplatesTab`, **Then** zero references exist (removed).
2. **Given** the hooks barrel, **When** checking each exported hook, **Then** every export has at least one consumer (14 unused hooks removed).
3. **Given** the types file, **When** checking `LogStatus`, **Then** it is removed (unreferenced).
4. **Given** the query keys file, **When** checking `notificationKeys.bulk.jobs()`, **Then** it is removed (unused).

### User Story 3 — Fix TypeScript Violations (Priority: P2)

As a developer, I want unsafe type casts and dead props eliminated so the code passes strict TS checks.

**Acceptance Scenarios**:
1. **Given** `TemplatesTab.tsx`, **When** calling `createTemplate.mutate(data as CreateTemplateRequest)`, **Then** the cast is replaced with validated data.
2. **Given** `NotificationsPage.tsx`, **When** casting `searchParams.get('tab') as TabId`, **Then** a proper runtime check guards the cast.
3. **Given** `TestModalProps`, **When** checking the `templateId` prop, **Then** it is either used or removed.

### User Story 4 — Fix Data Fetching Anti-Patterns (Priority: P2)

As a developer, I want the notifications feature to follow React Query conventions and avoid duplicate API calls.

**Acceptance Scenarios**:
1. **Given** `AdminSettingsTab.tsx`, **When** loading settings, **Then** only one API call is made (remove duplicate `useAdditionalRecipients` call since data already comes from `useAdminSettings`).
2. **Given** `AdminSettingsTab.tsx`, **When** toggling a notification, **Then** the existing `useToggleNotification` mutation hook is used instead of calling `toggleNotification` directly.
3. **Given** the query keys, **When** checking imports, **Then** notification keys are imported from the centralized `src/hooks/queryKeys.ts`.
4. **Given** `useNotificationSetting`, **When** `notificationType` is undefined, **Then** the query is disabled via `enabled: !!notificationType`.

### User Story 5 — Fix Accessibility Gaps (Priority: P2)

As a screen reader user, I want the notifications pages to be navigable and all controls labeled.

**Acceptance Scenarios**:
1. **Given** icon-only buttons (edit, delete), **When** inspecting the DOM, **Then** each has `aria-label`.
2. **Given** decorative `material-symbols-outlined` icons, **When** inspecting, **Then** each has `aria-hidden="true"`.
3. **Given** form inputs (Logs filters, Recipient form, Template form), **When** checking labels, **Then** each `<label>` has `htmlFor` matching the `<input>` `id`.
4. **Given** the tab panel structure, **When** inspecting, **Then** each tab content area has `role="tabpanel"` and `aria-labelledby`.
5. **Given** the Logs error state, **When** displayed, **Then** a retry button is provided.
6. **Given** each tab panel, **When** a crash occurs, **Then** `<ErrorBoundary>` catches it without taking down other tabs.

## Requirements

### Functional Requirements

- **FR-001**: Null-guard `template.variables?.length` in TemplatesTab.
- **FR-002**: Remove the unused `TemplatesTab` component (413 lines).
- **FR-003**: Remove 14 unused hooks from `hooks/notifications/` barrel.
- **FR-004**: Remove unused `LogStatus` type from `api/notifications/types.ts`.
- **FR-005**: Remove unused `notificationKeys.bulk.jobs()` query key.
- **FR-006**: Fix unsafe `data as CreateTemplateRequest` cast with proper validation.
- **FR-007**: Fix unsafe `searchParams.get('tab') as TabId` with runtime guard.
- **FR-008**: Remove or use the dead `templateId` prop in `TestModalProps`.
- **FR-009**: Eliminate duplicate `useAdditionalRecipients` call — use `settings.additional_recipients` instead.
- **FR-010**: Use `useToggleNotification` mutation hook instead of direct API call in AdminSettingsTab.
- **FR-011**: Migrate notification query keys to centralized `src/hooks/queryKeys.ts`.
- **FR-012**: Add `enabled: !!notificationType` guard to `useNotificationSetting`.
- **FR-013**: Add `aria-label` to all icon-only buttons.
- **FR-014**: Add `aria-hidden="true"` to all decorative `material-symbols-outlined` icons.
- **FR-015**: Wire `<label htmlFor>` to `<input id>` for all form controls.
- **FR-016**: Add `role="tabpanel"` + `aria-labelledby` to tab content panels.
- **FR-017**: Wrap each tab panel in `<ErrorBoundary>`.
- **FR-018**: Add retry button to LogsTab error state.

### Key Entities

- **NotificationSetting**: Admin toggle for each notification type.
- **NotificationTemplate**: Email template with key, subject, HTML/plain body, variables.
- **NotificationLog**: Dispatch history entry with status, channel, recipients.
- **AdditionalRecipient**: Extra email recipients for admin notifications.
- **BulkMessageRequest**: Bulk messaging request with filters, template, and content.

## Success Criteria

- **SC-001**: `npm run build` passes with zero errors.
- **SC-002**: `npm run lint` passes with zero errors.
- **SC-003**: Zero `console.*` statements in production notification code.
- **SC-004**: Zero `: any` or `as any` in notification files.
- **SC-005**: All 14 unused hooks removed with no missing imports across the codebase.
- **SC-006**: VoiceOver/NVDA can navigate all notification controls with labeled buttons and inputs.

## Assumptions

- The `TemplatesTab` can be safely removed since nothing imports it.
- Removing unused hooks will not break anything since they have zero consumers.
- The `useAdditionalRecipients` data is identical to `settings.additional_recipients` from `useAdminSettings`.
- All changes are frontend-only.
