import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SlideToConfirm } from '../components/finance/CreateReceipt/SlideToConfirm'

const transformTransition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'

function renderSlideToConfirm(onConfirm: () => void) {
  const { container } = render(<SlideToConfirm onConfirm={onConfirm} label="Confirm" />)
  const handle = container.querySelector<HTMLDivElement>('.cursor-grab')
  const track = handle?.parentElement

  if (!handle || !track) {
    throw new Error('SlideToConfirm elements not found')
  }

  Object.defineProperty(track, 'clientWidth', { configurable: true, value: 300 })

  return { handle }
}

describe('SlideToConfirm', () => {
  it('confirms once after a full drag', () => {
    const onConfirm = vi.fn()
    const { handle } = renderSlideToConfirm(onConfirm)

    fireEvent.mouseDown(handle, { clientX: 0 })
    fireEvent.mouseMove(window, { clientX: 300 })
    fireEvent.mouseUp(window)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('springs back after a partial drag without confirming', () => {
    const onConfirm = vi.fn()
    const { handle } = renderSlideToConfirm(onConfirm)

    fireEvent.mouseDown(handle, { clientX: 0 })
    fireEvent.mouseMove(window, { clientX: 100 })
    fireEvent.mouseUp(window)

    expect(onConfirm).not.toHaveBeenCalled()
    expect(handle.style.transform).toBe('translateX(0px)')
  })

  it('disables the transition while dragging and restores it after mouseup', () => {
    const onConfirm = vi.fn()
    const { handle } = renderSlideToConfirm(onConfirm)

    fireEvent.mouseDown(handle, { clientX: 0 })
    expect(handle.style.transition).toBe('none')

    fireEvent.mouseUp(window)
    expect(handle.style.transition).toBe(transformTransition)
  })
})
