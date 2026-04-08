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
  competitionId: string
): UseCompetitionCategoriesReturn {
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!competitionId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompetitionCategories(competitionId)
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
      if (!competitionId) throw new Error('No competition ID')
      setIsMutating(true)
      try {
        const newCategory = await addCompetitionCategory(competitionId, data)
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
      if (!competitionId) throw new Error('No competition ID')
      setIsMutating(true)
      try {
        await deleteCategory(competitionId, categoryId)
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
