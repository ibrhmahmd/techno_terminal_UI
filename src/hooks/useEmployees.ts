import { useQuery } from '@tanstack/react-query'
import { getEmployees } from '../api/hr'
import type { EmployeeListItem } from '../api/hr'
import { queryKeys } from './queryKeys'

interface UseEmployeesResult {
  employees: EmployeeListItem[]
  isLoading: boolean
}

export function useEmployees(enabled = true): UseEmployeesResult {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employees.list(),
    queryFn: () => getEmployees({ page: 1, page_size: 100 }),
    staleTime: 10 * 60 * 1000,
    enabled,
  })

  return {
    employees: data?.data ?? [],
    isLoading,
  }
}
