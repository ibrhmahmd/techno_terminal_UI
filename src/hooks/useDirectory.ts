import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentsPaginated,
  getParentsPaginated,
  searchStudents,
  searchParents,
  createStudent,
  updateStudent,
  deleteStudent,
  createParent,
  type StudentListItem,
  type ParentListItem,
  type UpdateStudentDTO,
} from '../api/crm'

export const directoryKeys = {
  students: {
    all:        ['directory', 'students'] as const,
    list:       (page: number, size: number) => ['directory', 'students', 'list', page, size] as const,
    search:     (term: string)  => ['directory', 'students', 'search', term] as const,
  },
  parents: {
    all:        ['directory', 'parents'] as const,
    list:       (page: number, size: number) => ['directory', 'parents', 'list', page, size] as const,
    search:     (term: string)  => ['directory', 'parents', 'search', term] as const,
  },
}

// ── Student Queries ───────────────────────────────────────────────────────────

export function useStudentsList(page: number, pageSize: number, enabled: boolean) {
  return useQuery({
    queryKey: directoryKeys.students.list(page, pageSize),
    queryFn: () => getStudentsPaginated({ skip: (page - 1) * pageSize, limit: pageSize }),
    staleTime: 3 * 60 * 1000,
    enabled,
  })
}

export function useStudentsSearch(term: string) {
  return useQuery<StudentListItem[]>({
    queryKey: directoryKeys.students.search(term),
    queryFn: () => searchStudents(term),
    staleTime: 2 * 60 * 1000,
    enabled: term.length >= 2,
  })
}

// ── Parent Queries ────────────────────────────────────────────────────────────

export function useParentsList(page: number, pageSize: number, enabled: boolean) {
  return useQuery({
    queryKey: directoryKeys.parents.list(page, pageSize),
    queryFn: () => getParentsPaginated({ skip: (page - 1) * pageSize, limit: pageSize }),
    staleTime: 3 * 60 * 1000,
    enabled,
  })
}

export function useParentsSearch(term: string) {
  return useQuery<ParentListItem[]>({
    queryKey: directoryKeys.parents.search(term),
    queryFn: () => searchParents(term),
    staleTime: 2 * 60 * 1000,
    enabled: term.length >= 2,
  })
}

// ── Student Mutations ─────────────────────────────────────────────────────────

function useStudentInvalidator() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: directoryKeys.students.all })
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

export function useDeleteStudent() {
  const invalidate = useStudentInvalidator()
  return useMutation({ mutationFn: deleteStudent, onSuccess: invalidate })
}

export function useCreateParent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createParent,
    onSuccess: () => qc.invalidateQueries({ queryKey: directoryKeys.parents.all }),
  })
}
