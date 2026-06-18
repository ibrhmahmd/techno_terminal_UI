// Domain comboboxes have been relocated to their respective domain directories:
// - StudentCombobox → src/components/student/StudentCombobox.tsx
// - GroupCombobox → src/components/groups/GroupCombobox.tsx
// - InstructorCombobox → src/components/staff/InstructorCombobox.tsx

// Re-export from new locations for backward compatibility
export { StudentCombobox } from '../../student/StudentCombobox'
export { GroupCombobox } from '../../groups/GroupCombobox'
export { InstructorCombobox } from '../../staff/InstructorCombobox'

// Re-export types
export type { StudentComboboxProps } from '../../student/StudentCombobox'
export type { GroupComboboxProps } from '../../groups/GroupCombobox'
export type { InstructorComboboxProps } from '../../staff/InstructorCombobox'
