import { useQuery } from '@tanstack/react-query'
import { getGroupsPaginated } from '../api/academics'
import { queryKeys } from './queryKeys'

/**
 * Server-side group search hook.
 * Only fires a request when `q` has 2 or more characters.
 * Returns up to 30 results from /academics/groups/filter?q=...
 */
export function useGroupSearch(q: string) {
  const trimmed = q.trim()
  const enabled = trimmed.length >= 2

  return useQuery({
    queryKey: queryKeys.groupFlat({ q: trimmed, limit: 30 }),
    queryFn: () => getGroupsPaginated({ q: trimmed, limit: 30 }),
    enabled,
    staleTime: 30 * 1000,    // search results stale after 30s
    placeholderData: (prev) => prev, // keep previous results visible while fetching
  })
}
