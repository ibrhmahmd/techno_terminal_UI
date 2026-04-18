import { useQuery } from '@tanstack/react-query'
import type { StudentListItem } from '../api/crm'

/**
 * TODO: Backend endpoint GET /crm/parents/{parent_id}/students
 * This hook currently returns empty data until backend implements the endpoint
 */

// Query key factory
const parentStudentsKeys = {
  all: ['parent-students'] as const,
  byParent: (parentId: number) => ['parent-students', parentId] as const,
}

/**
 * Fetches students linked to a specific parent
 * TODO: Replace with actual API call when backend implements:
 * GET /crm/parents/{parent_id}/students
 */
async function getParentStudents(_parentId: number): Promise<StudentListItem[]> {
  // TODO: Implement actual API call when backend endpoint is ready
  // const response = await client.get<ApiResponse<StudentListItem[]>>(`/crm/parents/${parentId}/students`)
  // return response.data.data || []
  
  console.warn('TODO: Backend endpoint GET /crm/parents/{id}/students not implemented')
  return []
}

// Hook for parent students (lazy loading)
export function useParentStudents(parentId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: parentStudentsKeys.byParent(parentId),
    queryFn: () => getParentStudents(parentId),
    enabled: enabled && !!parentId,
    staleTime: 5 * 60 * 1000,
  })
}

// Export for use in other hooks
export { getParentStudents }
