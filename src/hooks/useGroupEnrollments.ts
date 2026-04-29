import { useState, useEffect, useCallback } from 'react'
import {
  getGroupEnrollmentsAll,
  type GroupEnrollmentsAllResponse,
  type LevelEnrollmentGroupDTO,
  type TransferOptionDTO,
} from '../api/academics'
import { extractErrorMessage } from '../utils/apiErrors'

interface UseGroupEnrollmentsReturn {
  // Data
  enrollmentsByLevel: LevelEnrollmentGroupDTO[]
  students: GroupEnrollmentsAllResponse['students']
  transferOptions: TransferOptionDTO[]
  totalEnrollments: number
  activeEnrollments: number

  // Loading
  isLoading: boolean
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

export function useGroupEnrollments(groupId: number): UseGroupEnrollmentsReturn {
  const [data, setData] = useState<GroupEnrollmentsAllResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!groupId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await getGroupEnrollmentsAll(groupId)
      setData(response)
    } catch (err) {
      const userMessage = extractErrorMessage(err)
      console.error('[useGroupEnrollments] Failed:', { error: err, userMessage })
      setError(userMessage)
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate totals
  const totalEnrollments = data?.grouped_by_level.reduce(
    (sum, level) => sum + level.summary.total,
    0
  ) ?? 0

  const activeEnrollments = data?.grouped_by_level.reduce(
    (sum, level) => sum + level.summary.active,
    0
  ) ?? 0

  return {
    enrollmentsByLevel: data?.grouped_by_level ?? [],
    students: data?.students ?? {},
    transferOptions: data?.transfer_options ?? [],
    totalEnrollments,
    activeEnrollments,
    isLoading,
    error,
    refresh: fetchData,
  }
}
