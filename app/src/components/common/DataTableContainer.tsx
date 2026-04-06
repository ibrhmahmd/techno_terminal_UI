import type { ReactNode } from 'react'

interface DataTableContainerProps {
  /** Table content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Whether to show shadow effect */
  hasShadow?: boolean
  /** Whether table has hover shadow effect */
  hoverShadow?: boolean
}

/**
 * DataTableContainer - Standardized wrapper for data tables
 * 
 * Provides consistent styling for all table components including:
 * - Rounded corners
 * - Border styling
 * - Horizontal scrolling on mobile
 * - Optional shadow and hover effects
 * 
 * @example
 * <DataTableContainer>
 *   <table className="w-full">...</table>
 * </DataTableContainer>
 * 
 * @example
 * <DataTableContainer hasShadow hoverShadow>
 *   <DataTable columns={columns} data={data} />
 * </DataTableContainer>
 */
export function DataTableContainer({ 
  children, 
  className = '',
  hasShadow = true,
  hoverShadow = true
}: DataTableContainerProps) {
  const shadowClasses = hasShadow 
    ? `shadow-sm ${hoverShadow ? 'transition-all duration-300 hover:shadow-md' : ''}` 
    : ''

  return (
    <div className={`overflow-hidden rounded-xl bg-white border border-slate-200 ${shadowClasses} ${className}`}>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  )
}
