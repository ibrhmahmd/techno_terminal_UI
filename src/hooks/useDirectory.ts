import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentsPaginated,
  getParentsPaginated,
  searchStudents,
  searchParents,
  filterStudents,
  createStudent,
  updateStudent,
  softDeleteStudent,
  restoreStudent,
  hardDeleteStudent,
  getDeletedStudents,
  type StudentListItem,
  type ParentListItem,
  type UpdateStudentDTO,
  type StudentFilterParams,
  type StudentFilterResult,
} from '../api/crm'
import { queryKeys } from './queryKeys'

// ── Student Queries ───────────────────────────────────────────────────────────

export function useStudentsList(page: number, pageSize: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.directory.students.list(page, pageSize),
    queryFn: () => getStudentsPaginated({ skip: (page - 1) * pageSize, limit: pageSize }),
    staleTime: 3 * 60 * 1000,
    enabled,
  })
}

export function useStudentsSearch(term: string) {
  return useQuery<StudentListItem[]>({
    queryKey: queryKeys.directory.students.search(term),
    queryFn: () => searchStudents(term),
    staleTime: 2 * 60 * 1000,
    enabled: term.length >= 2,
  })
}

export function useStudentsFilter(params: StudentFilterParams, enabled: boolean = true) {
  return useQuery<StudentFilterResult>({
    queryKey: queryKeys.directory.students.filter(params),
    queryFn: () => filterStudents(params),
    staleTime: 2 * 60 * 1000,
    enabled,
  })
}

// ── Parent Queries ────────────────────────────────────────────────────────────

export function useParentsList(page: number, pageSize: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.directory.parents.list(page, pageSize),
    queryFn: () => getParentsPaginated({ skip: (page - 1) * pageSize, limit: pageSize }),
    staleTime: 3 * 60 * 1000,
    enabled,
  })
}

export function useParentsSearch(term: string) {
  return useQuery<ParentListItem[]>({
    queryKey: queryKeys.directory.parents.search(term),
    queryFn: () => searchParents(term),
    staleTime: 2 * 60 * 1000,
    enabled: term.length >= 2,
  })
}

// ── Student Mutations ─────────────────────────────────────────────────────────

function useStudentInvalidator() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['directory', 'students'] })
    qc.invalidateQueries({ queryKey: ['students'] })
  }
}

export function useCreateStudent() {
  const invalidate = useStudentInvalidator()
  return useMutation({ mutationFn: createStudent, onSuccess: invalidate })
}

export function useUpdateStudent() {
  const invalidate = useStudentInvalidator()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentDTO }) => updateStudent(id, data),
    onSuccess: invalidate,
  })
}

export function useSoftDeleteStudent() {
  const invalidate = useStudentInvalidator()
  return useMutation({ mutationFn: softDeleteStudent, onSuccess: invalidate })
}

export function useRestoreStudent() {
  const invalidate = useStudentInvalidator()
  return useMutation({ mutationFn: restoreStudent, onSuccess: invalidate })
}

export function useHardDeleteStudent() {
  const invalidate = useStudentInvalidator()
  return useMutation({ mutationFn: hardDeleteStudent, onSuccess: invalidate })
}

export function useDeletedStudents(page: number, pageSize: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.directory.students.deleted(page, pageSize),
    queryFn: () => getDeletedStudents({ skip: (page - 1) * pageSize, limit: pageSize }),
    staleTime: 3 * 60 * 1000,
    enabled,
  })
}


