import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEmployee, createEmployee, updateEmployee, fetchEmployeesPaginated } from '../api/hr/employees'
import type { EmployeeCreateInput } from '../api/hr/types'

export const staffKeys = {
  all: ['staff', 'employees'] as const,
  list: (params: { search?: string; page?: number; pageSize?: number; employment_type?: string }) =>
    ['staff', 'employees', 'list', params] as const,
  detail: (id: number) => ['staff', 'employees', id] as const,
}

export function useEmployees(search: string, page: number, pageSize: number, employmentType?: string) {
  const trimmed = search.trim()
  return useQuery({
    queryKey: staffKeys.list({ search: trimmed, page, pageSize, employment_type: employmentType }),
    queryFn: async () => {
      const result = await fetchEmployeesPaginated({ skip: (page - 1) * pageSize, limit: pageSize, q: trimmed || undefined, employment_type: employmentType })
      return result
    },
    enabled: trimmed.length === 0 || trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}

export function useEmployee(id: number | null) {
  return useQuery({
    queryKey: staffKeys.detail(id!),
    queryFn: async () => {
      const response = await getEmployee(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: EmployeeCreateInput) => {
      const response = await createEmployee(data)
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}

export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmployeeCreateInput> }) => {
      const response = await updateEmployee(id, data)
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}
