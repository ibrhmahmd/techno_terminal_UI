import { useState, useEffect } from 'react'

const MOBILE_QUERY = '(max-width: 1023px)'

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(MOBILE_QUERY)
    
    // Fallback for older browsers that don't support addEventListener on MediaQueryList
    if (mql.addEventListener) {
      const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    } else {
      const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
      mql.addListener(handler)
      return () => mql.removeListener(handler)
    }
  }, [])

  return isMobile
}
