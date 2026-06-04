import type { ReactNode } from 'react'

interface PageSectionProps {
  /** Section content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Maximum width constraint */
  maxWidth?: 'full' | '1400' | '1680'
  /** Whether to add top padding */
  withPadding?: boolean
}

/**
 * PageSection - Responsive container for page content
 * 
 * Provides consistent responsive padding and max-width constraints.
 * Uses the same pattern as GroupsPage for consistency.
 * 
 * @example
 * <PageSection>
 *   <DataTable ... />
 * </PageSection>
 * 
 * @example
 * <PageSection maxWidth="full" withPadding={false}>
 *   <FullWidthContent />
 * </PageSection>
 */
export function PageSection({ 
  children, 
  className = '',
  maxWidth = '1680',
  withPadding = true
}: PageSectionProps) {
  const maxWidthClass = maxWidth === '1400' ? 'max-w-[1400px]' : maxWidth === '1680' ? 'max-w-[1680px]' : ''
  const paddingClass = withPadding ? 'px-4 sm:px-6 lg:px-8 py-8' : ''

  return (
    <section className={`w-full ${maxWidthClass} mx-auto ${paddingClass} ${className}`}>
      {children}
    </section>
  )
}
