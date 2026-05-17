import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import {
  getGroupEnrollmentsAll,
  type GroupEnrollmentsAllResponse,
  type LevelEnrollmentGroupDTO,
  type TransferOptionDTO,
} from '../api/academics'

interface UseGroupEnrollmentsReturn {
  enrollmentsByLevel: LevelEnrollmentGroupDTO[]
  students: GroupEnrollmentsAllResponse['students']
  transferOptions: TransferOptionDTO[]
  totalEnrollments: number
  activeEnrollments: number
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useGroupEnrollments(groupId: number): UseGroupEnrollmentsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.groupEnrollments(groupId),
    queryFn: () => getGroupEnrollmentsAll(groupId),
    enabled: groupId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const levels = data?.grouped_by_level ?? []
  const totalEnrollments = levels.reduce((sum, level) => sum + level.summary.total, 0)
  const activeEnrollments = levels.reduce((sum, level) => sum + level.summary.active, 0)

  return {
    enrollmentsByLevel: levels,
    students: data?.students ?? {},
    transferOptions: data?.transfer_options ?? [],
    totalEnrollments,
    activeEnrollments,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => void refetch(),
  }
}
