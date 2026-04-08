import { useState, useEffect, useCallback } from 'react'
import { 
  getCompetition, 
  updateCompetition,
  deleteCompetition,
  type Competition,
  type UpdateCompetitionInput 
} from '../../api/competitions'

interface UseCompetitionReturn {
  competition: Competition | null
  isLoading: boolean
  isMutating: boolean
  error: string | null
  refresh: () => Promise<void>
  update: (data: UpdateCompetitionInput) => Promise<void>
  remove: () => Promise<void>
}

export function useCompetition(id: string): UseCompetitionReturn {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompetition = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompetition(id)
      setCompetition(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competition')
      setCompetition(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCompetition()
  }, [fetchCompetition])

  const update = useCallback(async (data: UpdateCompetitionInput) => {
    if (!id) return
    setIsMutating(true)
    try {
      const updated = await updateCompetition(id, data)
      setCompetition(updated)
    } catch (err) {
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [id])

  const remove = useCallback(async () => {
    if (!id) return
    setIsMutating(true)
    try {
      await deleteCompetition(id)
      setCompetition(null)
    } catch (err) {
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [id])

  return {
    competition,
    isLoading,
    isMutating,
    error,
    refresh: fetchCompetition,
    update,
    remove,
  }
}
