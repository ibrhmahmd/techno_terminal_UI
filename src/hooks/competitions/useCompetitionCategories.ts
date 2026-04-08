import { useState, useEffect, useCallback } from 'react'
import {
  getCompetitionCategories,
  addCompetitionCategory,
  deleteCategory,
  type CompetitionCategory,
  type CreateCategoryInput,
} from '../../api/competitions'

interface UseCompetitionCategoriesReturn {
  categories: CompetitionCategory[]
  isLoading: boolean
  isMutating: boolean
  error: string | null
  refresh: () => Promise<void>
  add: (data: CreateCategoryInput) => Promise<CompetitionCategory>
  remove: (categoryId: string) => Promise<void>
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

  const add = useCallback(
    async (data: CreateCategoryInput) => {
      if (!competitionId || competitionId === '') throw new Error('No competition ID')
      setIsMutating(true)
      try {
        const numericId = typeof competitionId === 'string' ? parseInt(competitionId, 10) : competitionId
        const newCategory = await addCompetitionCategory(numericId, data)
        setCategories((prev) => [...prev, newCategory])
        return newCategory
      } finally {
        setIsMutating(false)
      }
    },
    [competitionId]
  )

  const remove = useCallback(
    async (categoryId: string) => {
      if (!competitionId || competitionId === '') throw new Error('No competition ID')
      setIsMutating(true)
      try {
        const numericId = typeof competitionId === 'string' ? parseInt(competitionId, 10) : competitionId
        await deleteCategory(numericId, categoryId)
        setCategories((prev) => prev.filter((c) => c.id !== categoryId))
      } finally {
        setIsMutating(false)
      }
    },
    [competitionId]
  )

  return {
    categories,
    isLoading,
    isMutating,
    error,
    refresh: fetchCategories,
    add,
    remove,
  }
}
