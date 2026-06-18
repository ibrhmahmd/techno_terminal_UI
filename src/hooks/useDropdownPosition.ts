import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'

interface UseDropdownPositionResult {
  wrapperRef: RefObject<HTMLDivElement | null>
  dropdownAbove: boolean
}

/**
 * Calculate dropdown position relative to viewport.
 * Flips above input when insufficient space below.
 */
export function useDropdownPosition(deps: unknown[]): UseDropdownPositionResult {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [dropdownAbove, setDropdownAbove] = useState(false)

  const updatePosition = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setDropdownAbove(spaceBelow < 350 && rect.top > spaceBelow)
    }
  }, [])

  useEffect(() => {
    const handle = requestAnimationFrame(() => updatePosition())
    return () => cancelAnimationFrame(handle)
  }, [updatePosition, ...deps])

  return { wrapperRef, dropdownAbove }
}
