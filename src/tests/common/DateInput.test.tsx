import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DateInput } from '../../components/common/DateInput'

function getInput() {
  return screen.getByLabelText('Date of birth') as HTMLInputElement
}

interface ControlledProps {
  initial: string | null
  spy: (value: string | null) => void
  /** Bumping this re-renders the parent without changing the DateInput props. */
  tick?: number
}

function ControlledDateInput({ initial, spy, tick = 0 }: ControlledProps) {
  const [value, setValue] = useState<string | null>(initial)
  void tick
  return (
    <DateInput
      id="dob"
      label="Date of birth"
      value={value}
      onChange={(next) => {
        spy(next)
        setValue(next)
      }}
    />
  )
}

describe('DateInput', () => {
  it('renders an ISO value in DD-MM-YYYY display format', () => {
    render(<DateInput id="dob" label="Date of birth" value="2024-01-15" onChange={vi.fn()} />)

    expect(getInput()).toHaveValue('15-01-2024')
  })

  it('renders an empty input for a null value', () => {
    render(<DateInput id="dob" label="Date of birth" value={null} onChange={vi.fn()} />)

    expect(getInput()).toHaveValue('')
  })

  it('updates the display when the value prop changes externally', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DateInput id="dob" label="Date of birth" value="2024-01-15" onChange={onChange} />
    )

    expect(getInput()).toHaveValue('15-01-2024')

    rerender(<DateInput id="dob" label="Date of birth" value="2024-03-20" onChange={onChange} />)
    expect(getInput()).toHaveValue('20-03-2024')

    rerender(<DateInput id="dob" label="Date of birth" value="2025-12-01" onChange={onChange} />)
    expect(getInput()).toHaveValue('01-12-2025')
  })

  it('clears the display when the value prop is externally reset to null', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DateInput id="dob" label="Date of birth" value="2024-01-15" onChange={onChange} />
    )

    expect(getInput()).toHaveValue('15-01-2024')

    rerender(<DateInput id="dob" label="Date of birth" value={null} onChange={onChange} />)
    expect(getInput()).toHaveValue('')
  })

  it('formats partial input with auto-inserted hyphens and does not emit until complete', () => {
    const spy = vi.fn()
    render(<ControlledDateInput initial={null} spy={spy} />)
    const input = getInput()

    fireEvent.change(input, { target: { value: '1' } })
    expect(input).toHaveValue('1')
    expect(spy).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: '12' } })
    expect(input).toHaveValue('12')
    expect(spy).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: '123' } })
    expect(input).toHaveValue('12-3')
    expect(spy).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: '1203' } })
    expect(input).toHaveValue('12-03')
    expect(spy).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: '12031' } })
    expect(input).toHaveValue('12-03-1')
    expect(spy).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: '12032024' } })
    expect(input).toHaveValue('12-03-2024')
    expect(spy).toHaveBeenLastCalledWith('2024-03-12')
  })

  it('emits an ISO value for a complete date typed with explicit hyphens', () => {
    const spy = vi.fn()
    render(<ControlledDateInput initial={null} spy={spy} />)
    const input = getInput()

    fireEvent.change(input, { target: { value: '12-03-2024' } })

    expect(input).toHaveValue('12-03-2024')
    expect(spy).toHaveBeenLastCalledWith('2024-03-12')
  })

  it('does not wipe an incomplete entry when the parent re-renders with the same value', () => {
    const spy = vi.fn()
    const { rerender } = render(<ControlledDateInput initial={null} spy={spy} tick={0} />)
    const input = getInput()

    fireEvent.change(input, { target: { value: '12-03' } })
    expect(input).toHaveValue('12-03')
    expect(spy).not.toHaveBeenCalled()

    rerender(<ControlledDateInput initial={null} spy={spy} tick={1} />)
    expect(input).toHaveValue('12-03')
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not wipe an incomplete entry when the value prop changes mid-typing', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DateInput id="dob" label="Date of birth" value="2024-01-15" onChange={onChange} />
    )
    const input = getInput()

    fireEvent.change(input, { target: { value: '12' } })
    expect(input).toHaveValue('12')
    expect(onChange).not.toHaveBeenCalled()

    rerender(
      <DateInput id="dob" label="Date of birth" value="2024-03-20" onChange={onChange} />
    )
    expect(input).toHaveValue('12')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps a completed entry intact when the parent echoes the value back', () => {
    const spy = vi.fn()
    render(<ControlledDateInput initial={null} spy={spy} />)
    const input = getInput()

    fireEvent.change(input, { target: { value: '12032024' } })

    expect(input).toHaveValue('12-03-2024')
    expect(spy).toHaveBeenLastCalledWith('2024-03-12')
  })

  it('emits null and empties the display when the input is cleared', () => {
    const spy = vi.fn()
    render(<ControlledDateInput initial="2024-01-15" spy={spy} />)
    const input = getInput()

    expect(input).toHaveValue('15-01-2024')

    fireEvent.change(input, { target: { value: '' } })

    expect(input).toHaveValue('')
    expect(spy).toHaveBeenLastCalledWith(null)
  })

  it('emits null again on blur when the input is empty', () => {
    const spy = vi.fn()
    render(<ControlledDateInput initial={null} spy={spy} />)
    const input = getInput()

    fireEvent.change(input, { target: { value: '' } })
    spy.mockClear()

    fireEvent.blur(input)

    expect(spy).toHaveBeenCalledWith(null)
  })

  it('restores the last valid external value when blurring an incomplete date', () => {
    const onChange = vi.fn()
    render(
      <DateInput id="dob" label="Date of birth" value="2024-01-15" onChange={onChange} />
    )
    const input = getInput()

    fireEvent.change(input, { target: { value: '12' } })
    expect(input).toHaveValue('12')

    fireEvent.blur(input)

    expect(input).toHaveValue('15-01-2024')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears the input on blur when an incomplete date is typed over an empty value', () => {
    const onChange = vi.fn()
    render(<DateInput id="dob" label="Date of birth" value={null} onChange={onChange} />)
    const input = getInput()

    fireEvent.change(input, { target: { value: '12' } })
    expect(input).toHaveValue('12')

    fireEvent.blur(input)

    expect(input).toHaveValue('')
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('accepts external value changes after the input has been blurred', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DateInput id="dob" label="Date of birth" value={null} onChange={onChange} />
    )
    const input = getInput()

    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.blur(input)
    expect(input).toHaveValue('')

    rerender(
      <DateInput id="dob" label="Date of birth" value="2024-07-04" onChange={onChange} />
    )
    expect(input).toHaveValue('04-07-2024')
  })

  it('emits null for well-formed but out-of-range dates', () => {
    const spy = vi.fn()
    render(<ControlledDateInput initial={null} spy={spy} />)
    const input = getInput()

    fireEvent.change(input, { target: { value: '32032024' } })
    expect(input).toHaveValue('32-03-2024')
    expect(spy).toHaveBeenLastCalledWith(null)

    fireEvent.change(input, { target: { value: '12992024' } })
    expect(input).toHaveValue('12-99-2024')
    expect(spy).toHaveBeenLastCalledWith(null)
  })
})
