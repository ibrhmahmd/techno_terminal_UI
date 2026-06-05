# Tasks: Notifications Feature Audit & Fix

**Input**: Design documents from `/specs/038-notifications-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (No shared infrastructure needed)

**Purpose**: This is an audit/fix feature — all work is edits to existing files. No setup phase needed.

---

## Phase 2: User Story 1 — Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Ensure the notifications pages never crash due to null API responses or broken component state.

**Independent Test**: Open the notifications page at `/notifications`. Navigate through Admin Settings, Logs tabs. No crashes.

- [X] T001 [US1] Fix null guard on `template.variables.length` in `src/components/notifications/tabs/TemplatesTab.tsx:82` — change `{template.variables.length}` to `{(template.variables?.length ?? 0)}`
- [X] T002 [US1] Fix TestModal variables setter in `src/components/notifications/tabs/TemplatesTab.tsx:361` — change `const [variables] = useState(...)` to `const variables: Record<string, string> = {}`
- [X] T003 [P] [US1] Replace `console.error` with toast/error state in `src/components/notifications/tabs/AdminSettingsTab.tsx:93` — remove `console.error('Failed to toggle notification:', error)` and set an inline error state instead

**Checkpoint**: All runtime crashes prevented. LogsTab error state has retry button if included in scope.

---

## Phase 3: User Story 2 — Remove Dead Code (Priority: P1)

**Goal**: Eliminate unreachable code — 1 dead component, 14 dead hooks, 1 unused type, 1 unused query key, and associated dead API functions.

**Independent Test**: `npm run build` passes with zero errors. `npm run lint` passes. Grep for any removed identifiers yields only their definition/removal references.

### Step 3a — Remove dead TemplatesTab component

- [ ] T004 [US2] Delete unreachable component `src/components/notifications/tabs/TemplatesTab.tsx` (413 lines, zero imports)

### Step 3b — Remove dead hooks from hook definition files

- [ ] T005 [US2] Remove dead exports from `src/hooks/notifications/useAdminSettings.ts`: remove `useNotificationSetting` (line 29), `useUpdateAdminSettings` (line 40), `useToggleNotification` (line 55), `useBatchToggleNotifications` (line 71) — keep only `useAdminSettings`
- [ ] T006 [US2] Remove dead `useToggleRecipientStatus` export from `src/hooks/notifications/useAdditionalRecipients.ts:73` — keep `useAdditionalRecipients`, `useAddRecipient`, `useUpdateRecipient`, `useDeleteRecipient`
- [ ] T007 [US2] Delete entire file `src/hooks/notifications/useNotificationTemplates.ts` — all 5 exports (`useNotificationTemplates`, `useNotificationTemplate`, `useCreateTemplate`, `useUpdateTemplate`, `useDeleteTemplate`, `useTestTemplate`) are only consumed by dead TemplatesTab
- [ ] T008 [US2] Remove dead exports from `src/hooks/notifications/useNotificationLogs.ts`: remove `useNotificationLog` (line 28), `useLogRecipients` (line 40), `useRetryFailed` (line 52) — keep only `useNotificationLogs`
- [ ] T009 [US2] Delete entire file `src/hooks/notifications/useBulkMessaging.ts` — all 5 exports (`usePreviewRecipients`, `useSendBulkMessage`, `useBulkJobStatus`, `useCancelBulkJob`, `useActiveBulkJobs`) have zero consumers

### Step 3c — Update barrel export

- [ ] T010 [US2] Update `src/hooks/notifications/index.ts` to keep only: `notificationKeys`, `useAdminSettings`, `useAdditionalRecipients`, `useAddRecipient`, `useUpdateRecipient`, `useDeleteRecipient`, `useNotificationLogs`. Remove all dead re-exports.

### Step 3d — Remove dead API functions

- [ ] T011 [P] [US2] Delete entire file `src/api/notifications/templates.ts` — all 6 functions (`getTemplates`, `getTemplate`, `createTemplate`, `updateTemplate`, `deleteTemplate`, `testTemplate`) are only consumed by dead code
- [ ] T012 [P] [US2] Delete entire file `src/api/notifications/bulk.ts` — all 5 functions (`previewRecipients`, `sendBulkMessage`, `getJobStatus`, `cancelJob`, `getActiveJobs`) have zero consumers
- [ ] T013 [US2] Remove dead exports from `src/api/notifications/logs.ts`: remove `getLog` (line 39), `getLogRecipients` (line 48), `retryFailed` (line 59) — keep only `getLogs`
- [ ] T014 [P] [US2] Remove dead exports from `src/api/notifications/admin.ts`: remove `updateAdminSettings` (line 31), `getNotificationSetting` (line 42) — keep `getAdminSettings`, `toggleNotification`, `getAdditionalRecipients`, `addRecipient`, `updateRecipient`, `deleteRecipient`

### Step 3e — Update API barrel

- [ ] T015 [US2] Update `src/api/notifications/index.ts` — remove `export * from './templates'` and `export * from './bulk'`

### Step 3f — Remove unused types and query keys

- [ ] T016 [P] [US2] Remove unused `LogStatus` type from `src/api/notifications/types.ts:123`
- [ ] T017 [US2] Remove unused `notificationKeys.bulk.jobs()` query key factory from `src/hooks/notifications/queryKeys.ts:32`

**Checkpoint**: All dead code removed. `npm run build` passes.

---

## Phase 4: User Story 3 — Fix TypeScript Violations (Priority: P2)

**Goal**: Eliminate unsafe type casts.

**Independent Test**: `npm run build` passes with zero TS errors.

- [ ] T018 [US3] Fix unsafe `as TabId` cast in `src/pages/NotificationsPage.tsx:19` — add runtime guard: `const tabFromUrl = searchParams.get('tab'); const activeTab = tabFromUrl && tabs.some(t => t.id === tabFromUrl) ? tabFromUrl as TabId : 'admin'`

**Note**: Two other TS violations (`data as CreateTemplateRequest` and unused `templateId` prop) are in the now-deleted `TemplatesTab.tsx` — automatically resolved.

**Checkpoint**: TypeScript strict mode passes clean.

---

## Phase 5: User Story 4 — Fix Data Fetching Anti-Patterns (Priority: P2)

**Goal**: Eliminate duplicate API calls, centralize query keys, fix the direct API call bypass.

**Independent Test**: Notifications page loads with only one settings API call (`GET /notifications/admin/settings/me`). Query keys are in centralized factory.

- [ ] T019 [US4] Eliminate duplicate `useAdditionalRecipients` call in `src/components/notifications/tabs/AdminSettingsTab.tsx:67-68` — remove `useAdditionalRecipients()` import and call; read `settings?.additional_recipients` instead (already present in `AdminSettingsResponse`)
- [ ] T020 [US4] Refactor the `handleToggle` function in `src/components/notifications/tabs/AdminSettingsTab.tsx:87-97` — wrap `toggleNotification` API call in `useMutation` inline or extract to a local mutation, ensuring `queryClient.invalidateQueries` is called on success and errors are surfaced via toast (remove `console.error`)
- [ ] T021 [US4] Add `notifications` domain to centralized query keys in `src/hooks/queryKeys.ts` — add: `notifications: { admin: { all, setting }, templates: { all, detail }, logs: { list, detail, recipients }, bulk: { all, job } }`
- [ ] T022 [US4] Update import in `src/components/notifications/tabs/AdminSettingsTab.tsx` to import `notificationKeys` from `../../hooks/queryKeys` instead of `../../hooks/notifications/queryKeys`
- [ ] T023 [P] [US4] Update import in `src/hooks/notifications/useAdminSettings.ts` to import `notificationKeys` from `../queryKeys` instead of `./queryKeys`
- [ ] T024 [P] [US4] Update import in `src/hooks/notifications/useNotificationLogs.ts` to import `notificationKeys` from `../queryKeys` instead of `./queryKeys`
- [ ] T025 [US4] Delete the now-unused local `src/hooks/notifications/queryKeys.ts`

**Checkpoint**: Data fetching follows project conventions. No duplicate API calls.

---

## Phase 6: User Story 5 — Fix Accessibility Gaps (Priority: P2)

**Goal**: All interactive controls are properly labeled, decorative icons are hidden from screen readers, tab panels have correct ARIA roles, error states provide retry actions.

**Independent Test**: Navigate `/notifications` with screen reader (VoiceOver/NVDA). All buttons have distinct labels. Icons don't announce. Tab panels are announced correctly.

- [ ] T026 [P] [US5] Add `aria-label` to icon-only edit button in `src/components/notifications/tabs/AdminSettingsTab.tsx:228` — add `aria-label="Edit recipient"` and `aria-hidden="true"` on icon
- [ ] T027 [P] [US5] Add `aria-label` to icon-only delete button in `src/components/notifications/tabs/AdminSettingsTab.tsx:237` — add `aria-label="Delete recipient"` and `aria-hidden="true"` on icon
- [ ] T028 [P] [US5] Add `aria-hidden="true"` to decorative section header icons in `src/components/notifications/tabs/AdminSettingsTab.tsx:110, 123, 167, 201`
- [ ] T029 [P] [US5] Add `aria-hidden="true"` to decorative icon in `src/components/notifications/tabs/BulkMessagingTab.tsx:8`
- [ ] T030 [P] [US5] Add `aria-hidden="true"` to decorative/empty-state icons in `src/components/notifications/tabs/LogsTab.tsx:158, 174, 263`
- [ ] T031 [US5] Wire `<label htmlFor>` to `<input id>` for logs search in `src/components/notifications/tabs/LogsTab.tsx:61`
- [ ] T032 [US5] Wire `<label htmlFor>` to `<select id>` for logs status, channel, recipient type filters in `src/components/notifications/tabs/LogsTab.tsx:74, 89, 104`
- [ ] T033 [US5] Wire `<label htmlFor>` to `<input id>` for recipient email and label in `src/components/notifications/tabs/AdminSettingsTab.tsx:326, 338`
- [ ] T034 [US5] Add `role="tabpanel"` and `aria-labelledby` to tab content panels in `src/pages/NotificationsPage.tsx:79` — wrap each tab condition in `<div role="tabpanel" id="panel-{id}" aria-labelledby="tab-{id}">`
- [ ] T035 [US5] Wrap each tab panel in `<ErrorBoundary>` in `src/pages/NotificationsPage.tsx:79` — import `ErrorBoundary` from `../components/common/ErrorBoundary` and wrap `AdminSettingsTab`, `LogsTab`, `BulkMessagingTab`
- [ ] T036 [US5] Add retry button to LogsTab error state in `src/components/notifications/tabs/LogsTab.tsx:136` — add `<button onClick={() => refetch()}>Retry</button>` inside the error div

**Checkpoint**: Accessibility review passes. No icon-only buttons without labels. All form controls have associated labels.

---

## Phase 7: Polish & Verification

**Purpose**: Final verification that all changes compile and lint cleanly.

**Independent Test**: Build and lint commands succeed.

- [ ] T037 Run `npm run build` and fix any compilation errors
- [ ] T038 Run `npm run lint` and fix any lint errors
- [ ] T039 Verify zero `console.*` statements remain in notification feature files
- [ ] T040 Clean up any leftover imports or references to removed files

**Checkpoint**: Feature is production-ready.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 2)**: No dependencies — can start immediately
- **User Story 2 (Phase 3)**: No dependencies — can run after US1 or in parallel
- **User Story 3 (Phase 4)**: Depends on US2 — TemplatesTab removal makes 2 of 3 TS violations moot
- **User Story 4 (Phase 5)**: No direct dependencies — can run after US2 removes dead hooks
- **User Story 5 (Phase 6)**: No dependencies — can run in parallel with any phase
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — can be done first
- **US2 (P1)**: Independent — can be done in parallel with US1
- **US3 (P2)**: Somewhat dependent on US2 (TemplatesTab removal simplifies it)
- **US4 (P2)**: Independent — can be done in parallel with US3
- **US5 (P2)**: Independent — can be done in parallel with all other stories

### Parallel Opportunities

- T003 [US1] runs in parallel with T001–T002 (AdminSettingsTab vs TemplatesTab)
- T011–T017 [US2] run in parallel (different API files, no overlap)
- T019–T020 [US4] can run in parallel (AdminSettingsTab changes vs query keys migration)
- T023–T024 [US4] run in parallel (separate hook files)
- All T026–T036 [US5] marked [P] run in parallel (different lines, different files)
- T001–T003 [US1] can run in parallel with T004–T017 [US2] (different files)
- All [US5] tasks can run in parallel with any other phase

---

## Parallel Example: User Story 5 (Accessibility)

```bash
# Launch all accessibility fixes in parallel:
Task: "Add aria-label to AdminSettingsTab edit/delete buttons"
Task: "Add aria-hidden to AdminSettingsTab decorative icons"
Task: "Add aria-hidden to BulkMessagingTab icon"
Task: "Add aria-hidden to LogsTab icons"
Task: "Wire htmlFor/id for LogsTab filters"
Task: "Wire htmlFor/id for AdminSettingsTab recipient modal"
Task: "Add role=tabpanel to NotificationsPage tabs"
Task: "Wrap tabs in ErrorBoundary"
Task: "Add retry button to LogsTab error state"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: User Story 1 (Runtime Bugs)
2. **STOP and VALIDATE**: Test bug fixes are working
3. Deploy/demo if ready

### Incremental Delivery

1. Complete US1 + US2 → Stability + cleanup (MVP)
2. Add US4 → Data fetching optimized
3. Add US5 → Accessibility compliant
4. Add US3 → TypeScript clean (mostly resolved by US2)
5. Polish → Final verification

### Parallel Team Strategy

With multiple developers:
1. Developer A: US1 (runtime bugs)
2. Developer B: US2 (dead code removal)
3. Developer C: US5 (accessibility)
4. Once US2 done: Developer A moves to US4, Developer B moves to US3

---

## Notes

- [P] tasks = different files, no dependencies
- This is an audit/fix feature — tasks are edits to existing files, not new code
- No tests requested in spec — no test tasks generated
- Removing dead code is safe because zero consumers exist (verified by grep)
- The `TemplatesTab` removal cascades to its hooks and API functions — remove them together
- Run `npm run build && npm run lint` after each phase for quick validation
