# Data & Component Model: Level Creation Loading UX

Specification of props, states, and interface signatures modified or added for this feature.

## Hook Signatures

### [useGroupMutations.ts](file:///d:/Users/HP/Desktop/techno-terminal-SourceCode/techno_terminal_UI/src/hooks/useGroupMutations.ts)

```typescript
// Updated Return Interface
interface UseGroupMutationsReturn {
  updateGroup: (data: UpdateGroupDTO) => Promise<Group>
  deleteGroup: () => Promise<void>
  archiveGroup: () => Promise<Group>
  levelUp: () => Promise<ProgressGroupLevelResult>
  createNewLevel: (data: ProgressGroupLevelRequest) => Promise<ProgressGroupLevelResult>
  status: MutationStatus
  error: string | null
  clearError: () => void
  isCreateLevelPending: boolean  // Expose specific status
  isLevelUpPending: boolean      // Expose specific status
}
```

---

## Component Interfaces

### [ProgressLevelDialog.tsx](file:///d:/Users/HP/Desktop/techno-terminal-SourceCode/techno_terminal_UI/src/components/groups/detail/ProgressLevelDialog.tsx)

```typescript
// Props contract (unchanged but details implemented)
interface ProgressLevelDialogProps {
  isOpen: boolean
  groupId: number
  currentLevelNumber: number
  currentInstructorId: number
  currentCourseId: number
  currentGroupName: string
  currentPriceOverride: number | null | undefined
  onClose: () => void
  onConfirm: (data: ProgressGroupLevelRequest) => Promise<void>
  isLoading: boolean // Prop will now be connected to `isCreateLevelPending`
  triggerRef?: React.RefObject<HTMLElement | null>
}
```

### [GroupInfoCard.tsx](file:///d:/Users/HP/Desktop/techno-terminal-SourceCode/techno_terminal_UI/src/components/groups/detail/GroupInfoCard.tsx)

```typescript
// Updated Props Contract
interface GroupInfoCardProps {
  group: EnrichedGroupPublic
  currentLevel: LevelDetailDTO | null
  onEdit: () => void
  onDelete: () => void
  onArchive: () => void
  onLevelUp: () => void
  onCreateNewLevel: () => void
  canLevelUp: boolean
  onNotesChange?: (notes: string) => void
  isSavingNotes?: boolean
  isLevelUpPending?: boolean // New optional prop for loading feedback
}
```
