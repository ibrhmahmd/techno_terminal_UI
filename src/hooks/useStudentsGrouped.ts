import { useQuery } from '@tanstack/react-query'
import { getStudentsGrouped } from '../api/crm'
import { useGroupingSettingsStore } from '../store/groupingSettingsStore'
import { queryKeys } from './queryKeys'
import type { StudentFilterParams } from '../api/crm'

const studentsGroupedKeys = {
  all: queryKeys.studentsGroupedAll,
  byParams: queryKeys.studentsGroupedByParams,
}

function getAgeBucketsKey(
  buckets: { min: number; max: number; key: string }[]
): string {
  return buckets.map((b) => `${b.min}-${b.max}`).join(',')
}

interface UseStudentsGroupedOptions {
  groupBy: 'status' | 'age'
  pagination: { page: number; pageSize: number }
  tab: 'students' | 'waiting'
  enabled?: boolean
  filterParams?: StudentFilterParams
}

export function useStudentsGrouped({
  groupBy,
  pagination,
  tab,
  enabled = true,
  filterParams,
}: UseStudentsGroupedOptions) {
  const ageBuckets = useGroupingSettingsStore((state) => state.ageBuckets)

  const skip = (pagination.page - 1) * pagination.pageSize
  const limit = pagination.pageSize

  const ageBucketsKey = groupBy === 'age' ? getAgeBucketsKey(ageBuckets) : 'default'
  const baseKey = studentsGroupedKeys.byParams(groupBy, skip, limit, tab, ageBucketsKey)
  const queryKey = filterParams ? [...baseKey, filterParams] : baseKey

  return useQuery({
    queryKey,
    queryFn: () =>
      getStudentsGrouped(
        groupBy,
        { skip, limit },
        {
          includeInactive: tab === 'students',
          statusFilter: tab === 'waiting' ? 'waiting' : undefined,
          ageBuckets: groupBy === 'age' ? ageBuckets : undefined,
          filterParams,
        }
      ),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
