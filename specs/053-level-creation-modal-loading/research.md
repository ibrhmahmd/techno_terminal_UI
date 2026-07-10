# Research Report: Level Creation Loading UX & Disclaimer

Investigation of the level progression components and state flow in the UI project.

## Findings & System Context

### 1. Affected Codebase Locations
- **Mutations Hook**: [useGroupMutations.ts](file:///d:/Users/HP/Desktop/techno-terminal-SourceCode/techno_terminal_UI/src/hooks/useGroupMutations.ts)
  - Manages mutation callbacks for `updateGroup`, `deleteGroup`, `archiveGroup`, `levelUp`, and `createNewLevel`.
  - Only exposes a merged `status` and `error` state. Does not expose individual `isPending` states for individual mutations.
- **Page Container**: [GroupDetailPage.tsx](file:///d:/Users/HP/Desktop/techno-terminal-SourceCode/techno_terminal_UI/src/pages/GroupDetailPage.tsx)
  - Connects the mutations to components but passes `isLoading={false}` hardcoded into `ProgressLevelDialog`.
  - Does not pass any pending state to the `Level Up` trigger in `GroupInfoCard`.
- **Level Progress Dialog**: [ProgressLevelDialog.tsx](file:///d:/Users/HP/Desktop/techno-terminal-SourceCode/techno_terminal_UI/src/components/groups/detail/ProgressLevelDialog.tsx)
  - Renders the level progression inputs and handles the confirm submit action.
  - Has an unused `isLoading` prop.
  - Needs a dynamic callout to summarize level progression impact before submission.
- **Group Info Header**: [GroupInfoCard.tsx](file:///d:/Users/HP/Desktop/techno-terminal-SourceCode/techno_terminal_UI/src/components/groups/detail/GroupInfoCard.tsx)
  - Renders the main `Level Up` button. Needs an `isLevelUpPending` check to disable itself and show loading indicator.

---

## Decisions & Rationale

### Decision 1: Expose Specific Pending States from Custom Hook
- **Alternative**: Manage local loading states inside `GroupDetailPage.tsx` manually.
- **Rejected because**: Manually synchronizing promise resolve/reject states adds unnecessary state machines and boilerplate. TanStack Query already tracks each mutation's `isPending` state natively. Exposing them in the hook's return object is the cleanest and most robust approach.
- **Chosen approach**: Add `isCreateLevelPending: createLevelMutation.isPending` and `isLevelUpPending: levelUpMutation.isPending` to the `useGroupMutations` return fields.

### Decision 2: Complete Input Locking in Progress Dialog
- **Alternative**: Only disable the buttons.
- **Rejected because**: Users could still modify input fields, toggle checkmarks, or change selector fields *while* the request is in flight. If they modify form details and the mutation completes, the final dialog visual might conflict with what was sent to the server.
- **Chosen approach**: Disable the Close (X) button, the background click, and all form inputs, select dropdowns, search selectors, and action buttons during submission.

### Decision 3: Dynamic Progress Disclaimer Summary
- **Chosen approach**: Provide a visually highlighted callout box (using styling matching our design system - subtle blue border and background) summarizing:
  - Progression target level.
  - Completion of old level (if checked).
  - Migration of active students (if checked).
  - Newly scheduled sessions start date.
