import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSearch } from '../../hooks/useSearch'

const DEBOUNCE = 300

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports isSearching immediately after a term change and settles after the debounce', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    act(() => {
      result.current.handleSearch('al')
    })

    expect(result.current.searchTerm).toBe('al')
    expect(result.current.isSearching).toBe(true)
    expect(result.current.debouncedSearch).toBe('')
    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.isSearching).toBe(false)
    expect(result.current.debouncedSearch).toBe('al')
    expect(onSearch).toHaveBeenCalledWith('al')
  })

  it('settles an over-minimum-length term through setSearchTerm as well', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    act(() => {
      result.current.setSearchTerm('carol')
    })
    expect(result.current.isSearching).toBe(true)

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.debouncedSearch).toBe('carol')
    expect(result.current.isSearching).toBe(false)
    expect(onSearch).toHaveBeenCalledWith('carol')
  })

  it('keeps isSearching true until the full delay elapses', () => {
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2 }))

    act(() => {
      result.current.handleSearch('al')
    })
    expect(result.current.isSearching).toBe(true)

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE - 1)
    })
    expect(result.current.isSearching).toBe(true)
    expect(result.current.debouncedSearch).toBe('')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.isSearching).toBe(false)
    expect(result.current.debouncedSearch).toBe('al')
  })

  it('debounces rapid changes and only settles the last term', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    act(() => {
      result.current.handleSearch('a')
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    act(() => {
      result.current.handleSearch('ab')
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.isSearching).toBe(true)
    expect(result.current.debouncedSearch).toBe('')
    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.debouncedSearch).toBe('ab')
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('ab')
  })

  it('never publishes a term shorter than minLength but still stops searching', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    act(() => {
      result.current.handleSearch('al')
    })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })
    expect(result.current.debouncedSearch).toBe('al')

    act(() => {
      result.current.handleSearch('a')
    })
    expect(result.current.isSearching).toBe(true)

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.searchTerm).toBe('a')
    expect(result.current.debouncedSearch).toBe('al')
    expect(result.current.isSearching).toBe(false)
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenLastCalledWith('al')
  })

  it('publishes an empty term after the debounce', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    act(() => {
      result.current.handleSearch('al')
    })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })
    onSearch.mockClear()

    act(() => {
      result.current.handleSearch('')
    })
    expect(result.current.isSearching).toBe(true)

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.debouncedSearch).toBe('')
    expect(result.current.isSearching).toBe(false)
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('starts searching on mount and settles the initial empty term', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    expect(result.current.isSearching).toBe(true)
    expect(result.current.debouncedSearch).toBe('')

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.isSearching).toBe(false)
    expect(result.current.debouncedSearch).toBe('')
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('clearSearch resets both terms and settles the empty term', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    act(() => {
      result.current.handleSearch('al')
    })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })
    expect(result.current.debouncedSearch).toBe('al')

    act(() => {
      result.current.clearSearch()
    })

    expect(result.current.searchTerm).toBe('')
    expect(result.current.debouncedSearch).toBe('')
    expect(result.current.isSearching).toBe(true)

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.isSearching).toBe(false)
    expect(result.current.debouncedSearch).toBe('')
    expect(onSearch).toHaveBeenLastCalledWith('')
  })

  it('clearSearch is a no-op when the hook is already empty', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ debounceMs: DEBOUNCE, minLength: 2, onSearch }))

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })
    onSearch.mockClear()

    act(() => {
      result.current.clearSearch()
    })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE)
    })

    expect(result.current.searchTerm).toBe('')
    expect(result.current.debouncedSearch).toBe('')
    expect(result.current.isSearching).toBe(false)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('defaults to a 300ms debounce and a zero minLength', () => {
    const onSearch = vi.fn()
    const { result } = renderHook(() => useSearch({ onSearch }))

    act(() => {
      result.current.handleSearch('a')
    })

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current.debouncedSearch).toBe('')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.debouncedSearch).toBe('a')
    expect(onSearch).toHaveBeenCalledWith('a')
  })
})
