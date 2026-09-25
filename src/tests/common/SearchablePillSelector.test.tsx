import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  SearchablePillSelector,
  type SelectorOption,
} from '../../components/common/SearchablePillSelector'

const options: SelectorOption[] = [
  { id: 1, label: 'Alice Ahmed', subLabel: 'Group A' },
  { id: 2, label: 'Bassem Fahmy', subLabel: 'Group B' },
  { id: 3, label: 'Carol Nabil', subLabel: 'Group C' },
]

function getInput() {
  return screen.getByPlaceholderText('Search...') as HTMLInputElement
}

function optionItem(label: string) {
  return screen.getByText(label).closest('li') as HTMLElement
}

function highlighted() {
  return Array.from(document.querySelectorAll('li')).filter((li) =>
    li.className.includes('text-secondary')
  )
}

describe('SearchablePillSelector', () => {
  it('opens the list on focus and renders every option', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    expect(screen.queryByText('Alice Ahmed')).not.toBeInTheDocument()

    fireEvent.focus(getInput())

    expect(screen.getByText('Alice Ahmed')).toBeInTheDocument()
    expect(screen.getByText('Bassem Fahmy')).toBeInTheDocument()
    expect(screen.getByText('Carol Nabil')).toBeInTheDocument()
  })

  it('highlights the first option when the list opens', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    fireEvent.focus(getInput())

    expect(highlighted()).toHaveLength(1)
    expect(optionItem('Alice Ahmed')).toHaveClass('text-secondary')
  })

  it('filters options as the user types and highlights the first match', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    fireEvent.focus(getInput())
    fireEvent.change(getInput(), { target: { value: 'carol' } })

    expect(screen.queryByText('Alice Ahmed')).not.toBeInTheDocument()
    expect(screen.getByText('Carol Nabil')).toBeInTheDocument()
    expect(optionItem('Carol Nabil')).toHaveClass('text-secondary')
    expect(highlighted()).toHaveLength(1)
  })

  it('resets the highlight to the first filtered option when the search text changes', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    fireEvent.focus(getInput())
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
    expect(optionItem('Carol Nabil')).toHaveClass('text-secondary')

    fireEvent.change(getInput(), { target: { value: 'a' } })

    expect(optionItem('Alice Ahmed')).toHaveClass('text-secondary')
    expect(highlighted()).toHaveLength(1)
  })

  it('moves the highlight with ArrowDown and ArrowUp without wrapping past the ends', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    fireEvent.focus(getInput())
    expect(optionItem('Alice Ahmed')).toHaveClass('text-secondary')

    fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
    expect(optionItem('Bassem Fahmy')).toHaveClass('text-secondary')

    fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
    expect(optionItem('Carol Nabil')).toHaveClass('text-secondary')

    fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
    expect(optionItem('Carol Nabil')).toHaveClass('text-secondary')

    fireEvent.keyDown(getInput(), { key: 'ArrowUp' })
    expect(optionItem('Bassem Fahmy')).toHaveClass('text-secondary')

    fireEvent.keyDown(getInput(), { key: 'ArrowUp' })
    fireEvent.keyDown(getInput(), { key: 'ArrowUp' })
    expect(optionItem('Alice Ahmed')).toHaveClass('text-secondary')
  })

  it('selects the highlighted option with Enter after typing', () => {
    const onChange = vi.fn()
    render(<SearchablePillSelector options={options} value={null} onChange={onChange} />)

    fireEvent.focus(getInput())
    fireEvent.change(getInput(), { target: { value: 'ba' } })
    fireEvent.keyDown(getInput(), { key: 'Enter' })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(2)
    expect(screen.queryByText('Bassem Fahmy')).not.toBeInTheDocument()
    expect(getInput()).toHaveValue('')
  })

  it('selects the option reached with ArrowDown after typing', () => {
    const onChange = vi.fn()
    render(
      <SearchablePillSelector
        options={[
          { id: 10, label: 'Alpha one' },
          { id: 11, label: 'Alpha two' },
          { id: 12, label: 'Alpha three' },
        ]}
        value={null}
        onChange={onChange}
      />
    )

    fireEvent.focus(getInput())
    fireEvent.change(getInput(), { target: { value: 'alpha' } })
    expect(optionItem('Alpha one')).toHaveClass('text-secondary')

    fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
    expect(optionItem('Alpha two')).toHaveClass('text-secondary')

    fireEvent.keyDown(getInput(), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(11)
  })

  it('opens the list with ArrowDown from a closed state', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    expect(screen.queryByText('Alice Ahmed')).not.toBeInTheDocument()

    fireEvent.keyDown(getInput(), { key: 'ArrowDown' })

    expect(screen.getByText('Alice Ahmed')).toBeInTheDocument()
  })

  it('closes the list on Escape and on an outside mousedown', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    fireEvent.focus(getInput())
    expect(screen.getByText('Alice Ahmed')).toBeInTheDocument()

    fireEvent.keyDown(getInput(), { key: 'Escape' })
    expect(screen.queryByText('Alice Ahmed')).not.toBeInTheDocument()

    fireEvent.focus(getInput())
    expect(screen.getByText('Alice Ahmed')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Alice Ahmed')).not.toBeInTheDocument()
  })

  it('renders the selected option as a pill and clears it back to the search input', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <SearchablePillSelector options={options} value={1} onChange={onChange} />
    )

    expect(screen.getByText('Alice Ahmed')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))

    expect(onChange).toHaveBeenCalledWith(null)

    rerender(<SearchablePillSelector options={options} value={null} onChange={onChange} />)
    expect(getInput()).toBeInTheDocument()
  })

  it('selects an option on click and clears the search text', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <SearchablePillSelector options={options} value={null} onChange={onChange} />
    )

    fireEvent.focus(getInput())
    fireEvent.change(getInput(), { target: { value: 'carol' } })
    fireEvent.click(screen.getByText('Carol Nabil'))

    expect(onChange).toHaveBeenCalledWith(3)

    rerender(<SearchablePillSelector options={options} value={3} onChange={onChange} />)
    expect(screen.getByText('Carol Nabil')).toBeInTheDocument()
  })

  it('shows the empty message when nothing matches', () => {
    render(<SearchablePillSelector options={options} value={null} onChange={vi.fn()} />)

    fireEvent.focus(getInput())
    fireEvent.change(getInput(), { target: { value: 'zzz' } })

    expect(screen.getByText('No options found')).toBeInTheDocument()
    expect(highlighted()).toHaveLength(0)
  })
})
