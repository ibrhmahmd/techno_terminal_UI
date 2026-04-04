import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGroups } from '../../hooks/useGroups'
import * as academicsApi from '../../api/academics'

// Mock the API module
vi.mock('../../api/academics', () => {
  return {
    getEnrichedGroups: vi.fn(),
  }
})

describe('useGroups Hook', () => {
  const mockGroups = [
    {
      id: 1,
      name: 'Alpha Group',
      course_id: 10,
      course_name: 'Math 101',
      instructor_id: 20,
      instructor_name: 'John Doe',
      level_number: 1,
      max_capacity: 15,
      default_day: 'Monday',
      default_time_start: '10:00:00',
      default_time_end: '12:00:00',
      is_active: true
    },
    {
      id: 2,
      name: 'Beta Group',
      course_id: 11,
      course_name: 'Physics 101',
      instructor_id: 21,
      instructor_name: 'Jane Smith',
      level_number: 2,
      max_capacity: 10,
      default_day: 'Tuesday',
      default_time_start: '14:00:00',
      default_time_end: '16:00:00',
      is_active: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes and fetches groups successfully', async () => {
    vi.mocked(academicsApi.getEnrichedGroups).mockResolvedValueOnce(mockGroups)

    const { result } = renderHook(() => useGroups())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.groups).toEqual([])

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.groups).toEqual(mockGroups)
    expect(result.current.totalGroups).toBe(2)
  })

  it('filters groups based on search term', async () => {
    vi.mocked(academicsApi.getEnrichedGroups).mockResolvedValueOnce(mockGroups)

    const { result } = renderHook(() => useGroups())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Search by group name
    act(() => {
      result.current.setSearchTerm('Alpha')
    })
    expect(result.current.processedGroups).toHaveLength(1)
    expect(result.current.processedGroups[0].name).toBe('Alpha Group')

    // Search by instructor name
    act(() => {
      result.current.setSearchTerm('Jane')
    })
    expect(result.current.processedGroups).toHaveLength(1)
    expect(result.current.processedGroups[0].instructor_name).toBe('Jane Smith')
  })

  it('sorts groups locally', async () => {
    vi.mocked(academicsApi.getEnrichedGroups).mockResolvedValueOnce(mockGroups)

    const { result } = renderHook(() => useGroups())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    act(() => {
      result.current.handleSort('max_capacity')
    })

    expect(result.current.sortField).toBe('max_capacity')
    expect(result.current.sortDirection).toBe('asc')
    expect(result.current.processedGroups[0].max_capacity).toBe(10) // Beta group first

    // Toggle sort direction
    act(() => {
      result.current.handleSort('max_capacity')
    })
    expect(result.current.sortDirection).toBe('desc')
    expect(result.current.processedGroups[0].max_capacity).toBe(15) // Alpha group first
  })

  it('paginates correctly', async () => {
    // Generate 25 mock groups
    const manyGroups = Array.from({ length: 25 }, (_, i) => ({
      ...mockGroups[0],
      id: i + 1,
      name: `Group ${i + 1}`
    }))

    vi.mocked(academicsApi.getEnrichedGroups).mockResolvedValueOnce(manyGroups)

    const { result } = renderHook(() => useGroups())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Default is 20 per page, page 1
    expect(result.current.paginatedGroups).toHaveLength(20)
    expect(result.current.totalPages).toBe(2)

    act(() => {
      result.current.setCurrentPage(2)
    })

    expect(result.current.paginatedGroups).toHaveLength(5)
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(academicsApi.getEnrichedGroups).mockRejectedValueOnce(new Error('Network error'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useGroups())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Failed to load groups. Please check your connection.')
    expect(result.current.groups).toEqual([])
    
    consoleErrorSpy.mockRestore()
  })
})
