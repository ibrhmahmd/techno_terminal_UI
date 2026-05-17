import { useQuery } from '@tanstack/react-query'
import { getEmployees } from '../api/hr'
import type { EmployeePublic } from '../api/hr'

/**
 * Fetch all active employees via pagination and cache the result.
 * Used by GroupForm and EditGroupDialog to populate instructor dropdowns.
 */
export function useAllEmployees() {
  return useQuery({
    queryKey: ['employees', 'all'],
    queryFn: async () => {
      const allEmployees: EmployeePublic[] = []
      let page = 1
      const page_size = 100

      while (true) {
        const result = await getEmployees({ page, page_size })
        const data = (result.data || []) as EmployeePublic[]
        allEmployees.push(...data)

        if (data.length < page_size) break
        page++
      }

      return allEmployees.filter((e) => e.is_active !== false)
    },
    staleTime: 10 * 60 * 1000,
  })
}
