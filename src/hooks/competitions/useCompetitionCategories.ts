import { useState, useEffect, useCallback } from 'react'
import {
  getCompetitionCategories,
  type CompetitionCategory,
} from '../../api/competitions'

interface UseCompetitionCategoriesReturn {
  categories: CompetitionCategory[]
  isLoading: boolean
  isMutating: boolean
  error: string | null
  refresh: () => Promise<void>
  // NOTE: Categories are auto-generated from team registrations
  // No add/remove functionality - backend doesn't support POST/DELETE
}

export function useCompetitionCategories(
  competitionId: number | string
): UseCompetitionCategoriesReturn {
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
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
    isMutating: false, // No mutations - categories are auto-generated
    error,
    refresh: fetchCategories,
  }
}
