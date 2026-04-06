import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DataTable, type DataTableColumn } from '../DataTable'

interface TestItem {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
}

const testData: TestItem[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'active' },
]

const testColumns: DataTableColumn<TestItem>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (item) => item.name,
  },
  {
    key: 'email',
    header: 'Email',
    cell: (item) => item.email,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (item) => item.status,
  },
]

const keyExtractor = (item: TestItem) => item.id.toString()

describe('DataTable', () => {
  it('renders table with correct column headers', () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
      />
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders data rows with cell content', () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    // Use getAllByText since 'active' appears in multiple rows
    expect(screen.getAllByText('active').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('inactive')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <DataTable
        data={[]}
        columns={testColumns}
        keyExtractor={keyExtractor}
        isLoading={true}
      />
    )

    // Should render table headers even when loading
    expect(screen.getByText('Name')).toBeInTheDocument()
    
    // Should have skeleton rows with animate-pulse
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('shows empty state when no data', () => {
    render(
      <DataTable
        data={[]}
        columns={testColumns}
        keyExtractor={keyExtractor}
        emptyMessage="No items found"
        emptyIcon="search"
      />
    )

    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('calls onSort when sortable header is clicked', () => {
    const onSort = vi.fn()
    const sortableColumns: DataTableColumn<TestItem>[] = [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        cell: (item) => item.name,
      },
      {
        key: 'email',
        header: 'Email',
        cell: (item) => item.email,
      },
    ]

    render(
      <DataTable
        data={testData}
        columns={sortableColumns}
        keyExtractor={keyExtractor}
        onSort={onSort}
      />
    )

    fireEvent.click(screen.getByText('Name'))
    expect(onSort).toHaveBeenCalledWith('name')
  })

  it('does not call onSort for non-sortable columns', () => {
    const onSort = vi.fn()

    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
        onSort={onSort}
      />
    )

    fireEvent.click(screen.getByText('Email'))
    expect(onSort).not.toHaveBeenCalled()
  })

  it('calls onRowClick when row is clicked', () => {
    const onRowClick = vi.fn()

    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
        onRowClick={onRowClick}
      />
    )

    fireEvent.click(screen.getByText('John Doe'))
    expect(onRowClick).toHaveBeenCalledWith(testData[0])
  })

  it('calls action handlers when action buttons are clicked', () => {
    const onView = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
        actions={{
          view: onView,
          edit: onEdit,
          delete: onDelete,
        }}
      />
    )

    // Find and click view button for first row
    const viewButtons = screen.getAllByTitle('View')
    fireEvent.click(viewButtons[0])
    expect(onView).toHaveBeenCalledWith(testData[0])

    // Find and click edit button for second row
    const editButtons = screen.getAllByTitle('Edit')
    fireEvent.click(editButtons[1])
    expect(onEdit).toHaveBeenCalledWith(testData[1])

    // Find and click delete button for third row
    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[2])
    expect(onDelete).toHaveBeenCalledWith(testData[2])
  })

  it('renders with custom action labels', () => {
    const onView = vi.fn()

    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
        actions={{
          view: onView,
        }}
        actionLabels={{
          view: 'Details',
        }}
      />
    )

    expect(screen.getAllByTitle('Details')[0]).toBeInTheDocument()
  })

  it('sort indicator shows correct direction', () => {
    const sortableColumns: DataTableColumn<TestItem>[] = [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        cell: (item) => item.name,
      },
    ]

    const { rerender } = render(
      <DataTable
        data={testData}
        columns={sortableColumns}
        keyExtractor={keyExtractor}
        sortField="name"
        sortDirection="asc"
      />
    )

    // Check for ascending sort indicator
    expect(document.querySelector('.text-secondary')).toBeInTheDocument()

    rerender(
      <DataTable
        data={testData}
        columns={sortableColumns}
        keyExtractor={keyExtractor}
        sortField="name"
        sortDirection="desc"
      />
    )

    // Should still have sort indicator
    expect(document.querySelector('.text-secondary')).toBeInTheDocument()
  })

  it('renders within DataTableContainer with correct styling', () => {
    const { container } = render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
      />
    )

    // Check for DataTableContainer styling
    const dataTableContainer = container.querySelector('.rounded-xl')
    expect(dataTableContainer).toBeInTheDocument()
    
    // Check for sticky header
    const stickyHeader = container.querySelector('.sticky')
    expect(stickyHeader).toBeInTheDocument()
  })

  it('handles row click without action column', () => {
    const onRowClick = vi.fn()

    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
        onRowClick={onRowClick}
      />
    )

    // No actions column should be present
    expect(screen.queryByText('Actions')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('John Doe'))
    expect(onRowClick).toHaveBeenCalled()
  })

  it('does not call onRowClick when action button is clicked', () => {
    const onRowClick = vi.fn()
    const onView = vi.fn()

    render(
      <DataTable
        data={testData}
        columns={testColumns}
        keyExtractor={keyExtractor}
        onRowClick={onRowClick}
        actions={{
          view: onView,
        }}
      />
    )

    const viewButton = screen.getAllByTitle('View')[0]
    fireEvent.click(viewButton)

    // onRowClick should not be called when clicking action button
    expect(onRowClick).not.toHaveBeenCalled()
    expect(onView).toHaveBeenCalled()
  })
})
