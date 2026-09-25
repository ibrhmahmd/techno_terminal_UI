import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useSearchParams } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { EnrollmentsPage } from '../../pages/EnrollmentsPage'

vi.mock('../../components/enrollments/EnrollPanel', () => ({
  EnrollPanel: () => <div>create panel</div>,
}))

vi.mock('../../components/enrollments/ModifyEnrollmentPanel', () => ({
  ModifyEnrollmentPanel: () => <div>modify panel</div>,
}))

vi.mock('../../components/enrollments/DropEnrollmentPanel', () => ({
  DropEnrollmentPanel: () => <div>drop panel</div>,
}))

function ExternalNav() {
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <>
      <span data-testid="tab-param">{searchParams.get('tab')}</span>
      <button onClick={() => setSearchParams({ tab: 'drop' })}>external drop link</button>
      <button onClick={() => setSearchParams({ tab: 'nonsense' })}>external invalid link</button>
    </>
  )
}

function renderPage(url = '/enrollments') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <EnrollmentsPage />
      <ExternalNav />
    </MemoryRouter>,
  )
}

function panelTabs() {
  return screen.getAllByRole('tab')
}

function activeTab() {
  return panelTabs().find((tab) => tab.getAttribute('aria-selected') === 'true')!
}

beforeAll(() => {
  vi.stubGlobal('scrollTo', vi.fn())
})

describe('EnrollmentsPage active panel', () => {
  it('shows the create panel by default', () => {
    renderPage()

    expect(screen.getByText('create panel')).toBeInTheDocument()
    expect(screen.queryByText('modify panel')).toBeNull()
    expect(screen.queryByText('drop panel')).toBeNull()
  })

  it('opens the modify panel from the tab query param', () => {
    renderPage('/enrollments?tab=modify')

    expect(screen.getByText('modify panel')).toBeInTheDocument()
    expect(screen.queryByText('create panel')).toBeNull()
    expect(activeTab()).toHaveTextContent('Modify')
  })

  it('opens the drop panel from the tab query param', () => {
    renderPage('/enrollments?tab=drop')

    expect(screen.getByText('drop panel')).toBeInTheDocument()
    expect(activeTab()).toHaveTextContent('Drop')
  })

  it('opens the create panel for an unknown tab query param', () => {
    renderPage('/enrollments?tab=nonsense')

    expect(screen.getByText('create panel')).toBeInTheDocument()
  })

  it('switches panels locally when a metric card is clicked', () => {
    renderPage()

    fireEvent.click(screen.getByRole('tab', { name: /Modify/ }))

    expect(screen.getByText('modify panel')).toBeInTheDocument()
    expect(screen.queryByText('create panel')).toBeNull()
    expect(activeTab()).toHaveTextContent('Modify')
  })

  it('switches back to the create panel', () => {
    renderPage('/enrollments?tab=drop')

    fireEvent.click(screen.getByRole('tab', { name: /Create/ }))

    expect(screen.getByText('create panel')).toBeInTheDocument()
    expect(activeTab()).toHaveTextContent('Create')
  })

  it('follows a tab query param change that comes from outside the page', () => {
    renderPage('/enrollments?tab=modify')

    expect(screen.getByText('modify panel')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'external drop link' }))

    expect(screen.getByText('drop panel')).toBeInTheDocument()
    expect(screen.queryByText('modify panel')).toBeNull()
  })

  it('keeps the local panel when the query param is not a valid panel', () => {
    renderPage('/enrollments?tab=drop')

    fireEvent.click(screen.getByRole('button', { name: 'external invalid link' }))

    expect(screen.getByText('drop panel')).toBeInTheDocument()
  })

  it('writes the picked panel into the tab query param', () => {
    renderPage()

    expect(screen.getByTestId('tab-param')).toHaveTextContent('')

    fireEvent.click(screen.getByRole('tab', { name: /Drop/ }))

    expect(screen.getByTestId('tab-param')).toHaveTextContent('drop')
  })
})
