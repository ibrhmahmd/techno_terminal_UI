import { useState, useEffect, useCallback } from 'react'
import { 
  getCompetition, 
  updateCompetition,
  deleteCompetition,
  restoreCompetition,
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
  restore: () => Promise<void>
}

export function useCompetition(id: number | string): UseCompetitionReturn {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompetition = useCallback(async () => {
    if (!id || id === '') {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      const data = await getCompetition(numericId)
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
    if (!id || id === '') return
    setIsMutating(true)
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      const updated = await updateCompetition(numericId, data)
      setCompetition(updated)
    } catch (err) {
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [id])

  const remove = useCallback(async () => {
    if (!id || id === '') return
    setIsMutating(true)
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      await deleteCompetition(numericId)
      setCompetition(null)
    } catch (err) {
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [id])

  const restore = useCallback(async () => {
    if (!id || id === '') return
    setIsMutating(true)
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      await restoreCompetition(numericId)
      // Refresh competition data after restore
      await fetchCompetition()
    } catch (err) {
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [id, fetchCompetition])

  return {
    competition,
    isLoading,
    isMutating,
    error,
    refresh: fetchCompetition,
    update,
    remove,
    restore,
  }
}
