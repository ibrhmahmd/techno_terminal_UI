import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupCombobox } from '../components/groups/GroupCombobox'
import type { EnrichedGroupPublic } from '../api/academics'

const serverGroups: EnrichedGroupPublic[] = [
  {
    id: 1,
    name: 'Python A',
    course_name: 'Python',
    instructor_name: 'Mona',
    status: 'active',
    capacity: 10,
    current_level: 1,
    schedule: { day: 'Friday', start_time: '10:00:00', end_time: '12:00:00' },
  },
  {
    id: 2,
    name: 'Python B',
    course_name: 'Python',
    instructor_name: 'Karim',
    status: 'active',
    capacity: 8,
    current_level: 2,
    schedule: { day: 'Monday', start_time: '14:00:00', end_time: '16:00:00' },
  },
  {
    id: 3,
    name: 'Maths A',
    course_name: '',
    instructor_name: '',
    status: 'active',
    capacity: 6,
    current_level: 1,
    schedule: { day: 'Saturday', start_time: '09:00:00', end_time: '11:00:00' },
  },
  {
    id: 4,
    name: 'Excluded Group',
    course_name: 'Python',
    instructor_name: 'Mona',
    status: 'active',
    capacity: 4,
    current_level: 1,
  },
]

vi.mock('../hooks/useGroupSearch', () => ({
  useGroupSearch: () => ({ data: { items: serverGroups }, isLoading: false, isFetching: false }),
}))

function Harness({ onChange = vi.fn(), excludeGroupIds }: {
  onChange?: (group: EnrichedGroupPublic | null) => void
  excludeGroupIds?: number[]
}) {
  const [search, setSearch] = useState('')
  return (
    <GroupCombobox
      value={null}
      onChange={onChange}
      search={search}
      setSearch={setSearch}
      excludeGroupIds={excludeGroupIds}
    />
  )
}

function openDropdown(term: string) {
  const input = screen.getByLabelText('Search group')
  fireEvent.focus(input)
  if (term) fireEvent.change(input, { target: { value: term } })
}

function categoryLabels() {
  return screen.getAllByRole('tab').map((tab) => tab.querySelector('span')?.textContent)
}

function cardNames() {
  return screen.queryAllByRole('button', { name: /^Select group / }).map((b) => b.getAttribute('aria-label'))
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('techno_recent_groups', JSON.stringify([
    { id: 1, name: 'Python A' },
    { id: 4, name: 'Excluded Group' },
  ]))
})

describe('GroupCombobox grouping and search output', () => {
  it('lists recent groups under a single category when the search is shorter than two characters', () => {
    render(<Harness />)
    openDropdown('')

    expect(categoryLabels()).toEqual(['Recently Used'])
    expect(cardNames()).toEqual(['Select group Python A', 'Select group Excluded Group'])
  })

  it('filters recents by a single typed character', () => {
    render(<Harness />)
    openDropdown('x')

    expect(categoryLabels()).toEqual(['Recently Used'])
    expect(cardNames()).toEqual(['Select group Excluded Group'])
  })

  it('groups search results by course and falls back to a placeholder for a missing course', () => {
    render(<Harness />)
    openDropdown('py')

    expect(categoryLabels()).toEqual(['Python', 'Uncategorized Course'])
    expect(cardNames()).toEqual([
      'Select group Python A',
      'Select group Python B',
      'Select group Excluded Group',
    ])

    fireEvent.click(screen.getByRole('tab', { name: /Uncategorized Course/ }))

    expect(cardNames()).toEqual(['Select group Maths A'])
  })

  it('regroups the same results by instructor', () => {
    render(<Harness />)
    openDropdown('py')

    fireEvent.click(screen.getByRole('button', { name: 'instructor' }))

    expect(categoryLabels()).toEqual(['Karim', 'Mona', 'No Instructor'])
    expect(cardNames()).toEqual(['Select group Python B'])

    fireEvent.click(screen.getByRole('tab', { name: /Mona/ }))

    expect(cardNames()).toEqual(['Select group Python A', 'Select group Excluded Group'])
  })

  it('regroups by weekday in Saturday-to-Friday order', () => {
    render(<Harness />)
    openDropdown('py')

    fireEvent.click(screen.getByRole('button', { name: 'day' }))

    // Day labels are translated through the `groups` namespace, which has no
    // `days.*` entries, so the raw key is what renders. The order is the point.
    expect(categoryLabels()).toEqual(['days.saturday', 'days.monday', 'days.friday', 'No Specific Day'])
    expect(cardNames()).toEqual(['Select group Maths A'])
  })

  it('excludes the given group ids from both recents and search results', () => {
    render(<Harness excludeGroupIds={[4, 1]} />)

    openDropdown('')
    expect(categoryLabels()).toEqual(['Recently Used'])
    expect(cardNames()).toEqual([])

    openDropdown('py')
    expect(categoryLabels()).toEqual(['Python', 'Uncategorized Course'])
    expect(cardNames()).toEqual(['Select group Python B'])
  })

  it('reports the picked group and clears the search', () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    openDropdown('py')

    fireEvent.click(screen.getByRole('button', { name: 'Select group Python B' }))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 2, name: 'Python B' }))
    expect(screen.getByLabelText('Search group')).toHaveValue('')
  })
})
