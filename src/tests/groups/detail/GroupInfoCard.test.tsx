import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GroupInfoCard } from '../../../components/groups/detail/GroupInfoCard'
import type { EnrichedGroupPublic } from '../../../api/academics'

function makeGroup(notes: string | null): EnrichedGroupPublic {
  return {
    id: 5,
    name: 'Robotics A',
    notes,
    status: 'active',
    instructor_id: 10,
    instructor_name: 'Ahmed Ali',
    course_id: 1,
    course_name: 'Robotics EV3',
    current_student_count: 8,
    schedule: { day: 'Saturday', start_time: '18:00', end_time: '20:00' },
  } as unknown as EnrichedGroupPublic
}

function renderCard(group: EnrichedGroupPublic, onNotesChange = vi.fn()) {
  const tree = (g: EnrichedGroupPublic) => (
    <MemoryRouter>
      <GroupInfoCard
        group={g}
        currentLevel={null}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onArchive={vi.fn()}
        onLevelUp={vi.fn()}
        onCreateNewLevel={vi.fn()}
        canLevelUp={false}
        onNotesChange={onNotesChange}
      />
    </MemoryRouter>
  )

  const utils = render(tree(group))
  return { ...utils, onNotesChange, rerenderCard: (g: EnrichedGroupPublic) => utils.rerender(tree(g)) }
}

function notesArea() {
  return screen.getByLabelText(/group notes/i) as HTMLTextAreaElement
}

async function settleDebounce() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 700))
  })
}

describe('GroupInfoCard notes', () => {
  it('shows the server notes on first render', () => {
    renderCard(makeGroup('server v1'))
    expect(notesArea()).toHaveValue('server v1')
  })

  it('renders an empty textarea for null notes', () => {
    renderCard(makeGroup(null))
    expect(notesArea()).toHaveValue('')
  })

  it('adopts a server-side notes change', () => {
    const { rerenderCard } = renderCard(makeGroup('server v1'))

    rerenderCard(makeGroup('server v2'))
    expect(notesArea()).toHaveValue('server v2')
  })

  it('does not save anything on mount', async () => {
    const { onNotesChange } = renderCard(makeGroup('server v1'))

    await settleDebounce()
    expect(onNotesChange).not.toHaveBeenCalled()
  })

  it('saves the typed notes after the debounce, not before', async () => {
    const { onNotesChange } = renderCard(makeGroup('server v1'))

    fireEvent.change(notesArea(), { target: { value: 'local edit' } })
    expect(notesArea()).toHaveValue('local edit')
    expect(onNotesChange).not.toHaveBeenCalled()

    await waitFor(() => expect(onNotesChange).toHaveBeenCalledWith('local edit'), { timeout: 2000 })
    expect(onNotesChange).toHaveBeenCalledTimes(1)
  })

  it('saves again when the notes are edited a second time', async () => {
    const { onNotesChange } = renderCard(makeGroup('server v1'))

    fireEvent.change(notesArea(), { target: { value: 'first' } })
    await waitFor(() => expect(onNotesChange).toHaveBeenCalledWith('first'), { timeout: 2000 })

    fireEvent.change(notesArea(), { target: { value: 'second' } })
    await waitFor(() => expect(onNotesChange).toHaveBeenCalledWith('second'), { timeout: 2000 })
  })

  it('does not clobber in-progress typing with the echo of its own save', async () => {
    const { rerenderCard, onNotesChange } = renderCard(makeGroup('server v1'))

    fireEvent.change(notesArea(), { target: { value: 'local edit' } })
    await waitFor(() => expect(onNotesChange).toHaveBeenCalledWith('local edit'), { timeout: 2000 })

    // the refetch echoes the value we just saved
    rerenderCard(makeGroup('local edit'))
    expect(notesArea()).toHaveValue('local edit')

    // the user keeps typing while that refetch is in flight
    fireEvent.change(notesArea(), { target: { value: 'local edit v2' } })
    rerenderCard(makeGroup('local edit'))
    expect(notesArea()).toHaveValue('local edit v2')
  })

  it('does not re-save the value that the server echoed back', async () => {
    const { rerenderCard, onNotesChange } = renderCard(makeGroup('server v1'))

    fireEvent.change(notesArea(), { target: { value: 'local edit' } })
    await waitFor(() => expect(onNotesChange).toHaveBeenCalledWith('local edit'), { timeout: 2000 })

    rerenderCard(makeGroup('local edit'))
    await settleDebounce()

    expect(onNotesChange).toHaveBeenCalledTimes(1)
  })

  it('adopts a server change that is not the echo of our own save', async () => {
    const { rerenderCard, onNotesChange } = renderCard(makeGroup('server v1'))

    fireEvent.change(notesArea(), { target: { value: 'local edit' } })
    await waitFor(() => expect(onNotesChange).toHaveBeenCalledWith('local edit'), { timeout: 2000 })

    rerenderCard(makeGroup('edited by someone else'))
    expect(notesArea()).toHaveValue('edited by someone else')
  })

  it('adopts a server change that arrives while the user is typing', () => {
    const { rerenderCard } = renderCard(makeGroup('server v1'))

    fireEvent.change(notesArea(), { target: { value: 'half typed' } })
    rerenderCard(makeGroup('server v2'))

    expect(notesArea()).toHaveValue('server v2')
  })

  it('adopts a server change that clears the notes', () => {
    const { rerenderCard } = renderCard(makeGroup('server v1'))

    rerenderCard(makeGroup(null))
    expect(notesArea()).toHaveValue('')
  })

  it('keeps the typed text after autosave while the parent has not refetched yet', async () => {
    const { onNotesChange } = renderCard(makeGroup('old'))
    fireEvent.change(notesArea(), { target: { value: 'typed text' } })
    await settleDebounce()
    expect(onNotesChange).toHaveBeenCalledWith('typed text')
    expect(notesArea()).toHaveValue('typed text')
  })

  it('keeps text typed after the autosave, before the refetch lands', async () => {
    const { onNotesChange } = renderCard(makeGroup('old'))
    fireEvent.change(notesArea(), { target: { value: 'typed text' } })
    await settleDebounce()
    expect(onNotesChange).toHaveBeenCalledTimes(1)

    // the user keeps typing while the refetch is still in flight
    fireEvent.change(notesArea(), { target: { value: 'typed text more' } })
    await settleDebounce()

    expect(notesArea()).toHaveValue('typed text more')
    expect(onNotesChange).toHaveBeenLastCalledWith('typed text more')
    expect(onNotesChange).toHaveBeenCalledTimes(2)
  })

  it('ignores a rerender that carries the unchanged or the echoed server value', async () => {
    const { rerenderCard, onNotesChange } = renderCard(makeGroup('old'))
    fireEvent.change(notesArea(), { target: { value: 'typed text' } })
    await settleDebounce()
    expect(onNotesChange).toHaveBeenCalledTimes(1)

    // an unrelated rerender, the server still has the old value
    rerenderCard(makeGroup('old'))
    expect(notesArea()).toHaveValue('typed text')

    // the refetch finally lands with the value we saved
    rerenderCard(makeGroup('typed text'))
    expect(notesArea()).toHaveValue('typed text')
  })
})
