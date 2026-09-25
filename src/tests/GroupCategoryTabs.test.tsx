import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GroupCategoryTabs } from '../components/groups/GroupCategoryTabs'

describe('GroupCategoryTabs', () => {
  it('keeps hooks stable when categories load and supports keyboard navigation', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <GroupCategoryTabs categories={[]} activeKey="" onChange={onChange} />
    )

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()

    const categories = [
      { key: 'all', label: 'All', count: 2 },
      { key: 'active', label: 'Active', count: 1 },
    ]

    expect(() => {
      rerender(<GroupCategoryTabs categories={categories} activeKey="all" onChange={onChange} />)
    }).not.toThrow()

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
    expect(tabs[0]).toHaveTextContent('All')
    expect(tabs[1]).toHaveTextContent('Active')

    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenNthCalledWith(1, 'active')

    fireEvent.keyDown(tabs[0], { key: 'Home' })
    expect(onChange).toHaveBeenNthCalledWith(2, 'all')

    fireEvent.keyDown(tabs[0], { key: 'End' })
    expect(onChange).toHaveBeenNthCalledWith(3, 'active')
  })
})
