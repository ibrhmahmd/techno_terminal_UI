import { useState, useEffect, useCallback } from 'react'
import {
  getCompetitionCategories,
  type CategoryResponse,
} from '../../api/competitions'

interface UseCompetitionCategoriesReturn {
  categories: CategoryResponse[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCompetitionCategories(
  competitionId: number | string
): UseCompetitionCategoriesReturn {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!competitionId || competitionId === '') {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const numericId = typeof competitionId === 'string' ? parseInt(competitionId, 10) : competitionId
      const data = await getCompetitionCategories(numericId)
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }, [competitionId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
  }
}
