import { useQuery } from '@tanstack/react-query'
import { getStudentsGrouped } from '../api/crm'
import { useGroupingSettingsStore } from '../store/groupingSettingsStore'

const studentsGroupedKeys = {
  all: ['students', 'grouped'] as const,
  byParams: (
    groupBy: string,
    skip: number,
    limit: number,
    tab: 'students' | 'waiting',
    ageBucketsKey: string // For cache key
  ) => ['students', 'grouped', groupBy, skip, limit, tab, ageBucketsKey] as const,
}

// Generate a cache key from age buckets
function getAgeBucketsKey(
  buckets: { min: number; max: number; key: string }[]
): string {
  return buckets.map((b) => `${b.min}-${b.max}`).join(',')
}

interface UseStudentsGroupedOptions {
  groupBy: 'status' | 'age' // Backend only supports status and age (as age_bucket)
  pagination: { page: number; pageSize: number }
  tab: 'students' | 'waiting'
  enabled?: boolean
}

export function useStudentsGrouped({
  groupBy,
  pagination,
  tab,
  enabled = true,
}: UseStudentsGroupedOptions) {
  const ageBuckets = useGroupingSettingsStore((state) => state.ageBuckets)

  const skip = (pagination.page - 1) * pagination.pageSize
  const limit = pagination.pageSize

  return useQuery({
    queryKey: studentsGroupedKeys.byParams(
      groupBy,
      skip,
      limit,
      tab,
      groupBy === 'age' ? getAgeBucketsKey(ageBuckets) : 'default'
    ),
    queryFn: () =>
      getStudentsGrouped(
        groupBy,
        { skip, limit },
        {
          includeInactive: tab === 'students',
          statusFilter: tab === 'waiting' ? 'waiting' : undefined,
          ageBuckets: groupBy === 'age' ? ageBuckets : undefined,
        }
      ),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
