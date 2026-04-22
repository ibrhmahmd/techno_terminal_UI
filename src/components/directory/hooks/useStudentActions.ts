import { useState, useCallback } from 'react'
import { useToast } from '../../common/Toast'
import {
  useCreateStudent,
  useUpdateStudent,
  useSoftDeleteStudent,
  useRestoreStudent,
  useHardDeleteStudent,
} from '../../../hooks/useDirectory'
import {
  linkParentToStudent,
  updateStudentStatus,
  type StudentListItem,
  type ParentListItem,
  type CreateStudentDTO,
  type UpdateStudentDTO,
  type StudentStatus,
} from '../../../api/crm'

interface UseStudentActionsReturn {
  handleCreateStudent: (
    data: CreateStudentDTO,
    selectedParent: ParentListItem | null,
    status: StudentStatus
  ) => Promise<void>
  handleEditStudent: (
    student: StudentListItem,
    data: UpdateStudentDTO,
    selectedParent: ParentListItem | null,
    status: StudentStatus
  ) => Promise<void>
  handleSoftDeleteStudent: (student: StudentListItem) => void
  handleRestoreStudent: (student: StudentListItem) => void
  handleHardDeleteStudent: (student: StudentListItem) => void
  isLoading: boolean
}

export function useStudentActions(
  closeCreateModal: () => void,
  closeEditModal: () => void,
  clearSearch: () => void
): UseStudentActionsReturn {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const createStudentMutation = useCreateStudent()
  const updateStudentMutation = useUpdateStudent()
  const softDeleteStudentMutation = useSoftDeleteStudent()
  const restoreStudentMutation = useRestoreStudent()
  const hardDeleteStudentMutation = useHardDeleteStudent()

  const handleCreateStudent = useCallback(
    async (
      data: CreateStudentDTO,
      selectedParent: ParentListItem | null,
      status: StudentStatus
    ) => {
      setIsLoading(true)
      try {
        const newStudent = await createStudentMutation.mutateAsync(data)

        if (selectedParent) {
          await linkParentToStudent(newStudent.id, selectedParent.id)
        }

        if (status && status !== 'active') {
          await updateStudentStatus(newStudent.id, status)
        }

        showToast('Student created successfully', 'success')
        closeCreateModal()
        clearSearch()
      } catch {
        showToast('Failed to create student', 'error')
      } finally {
        setIsLoading(false)
      }
    },
    [createStudentMutation, closeCreateModal, clearSearch, showToast]
  )

  const handleEditStudent = useCallback(
    async (
      student: StudentListItem,
      data: UpdateStudentDTO,
      selectedParent: ParentListItem | null,
      status: StudentStatus
    ) => {
      setIsLoading(true)
      try {
        await updateStudentMutation.mutateAsync({ id: student.id, data })

        if (selectedParent && selectedParent.id !== student.parent?.id) {
          await linkParentToStudent(student.id, selectedParent.id)
        }

        if (status && status !== student.status) {
          await updateStudentStatus(student.id, status)
        }

        showToast('Student updated successfully', 'success')
        closeEditModal()
      } catch {
        showToast('Failed to update student', 'error')
      } finally {
        setIsLoading(false)
      }
    },
    [updateStudentMutation, closeEditModal, showToast]
  )

  const handleSoftDeleteStudent = useCallback(
    (student: StudentListItem) => {
      softDeleteStudentMutation.mutate(student.id, {
        onSuccess: () => {
          showToast(`Student "${student.full_name}" moved to trash`, 'success')
        },
        onError: () => {
          showToast('Failed to delete student', 'error')
        },
      })
    },
    [softDeleteStudentMutation, showToast]
  )

  const handleRestoreStudent = useCallback(
    (student: StudentListItem) => {
      restoreStudentMutation.mutate(student.id, {
        onSuccess: () => {
          showToast(`Student "${student.full_name}" restored`, 'success')
        },
        onError: () => {
          showToast('Failed to restore student', 'error')
        },
      })
    },
    [restoreStudentMutation, showToast]
  )

  const handleHardDeleteStudent = useCallback(
    (student: StudentListItem) => {
      hardDeleteStudentMutation.mutate(student.id, {
        onSuccess: () => {
          showToast(`Student "${student.full_name}" permanently deleted`, 'success')
        },
        onError: () => {
          showToast('Failed to permanently delete student', 'error')
        },
      })
    },
    [hardDeleteStudentMutation, showToast]
  )

  return {
    handleCreateStudent,
    handleEditStudent,
    handleSoftDeleteStudent,
    handleRestoreStudent,
    handleHardDeleteStudent,
    isLoading:
      isLoading ||
      createStudentMutation.isPending ||
      updateStudentMutation.isPending ||
      softDeleteStudentMutation.isPending ||
      restoreStudentMutation.isPending ||
      hardDeleteStudentMutation.isPending,
  }
}
