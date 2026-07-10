import type { ReactNode } from 'react'
import { TerminalPattern } from './TerminalPattern'

interface PageHeaderProps {
  /** Main page title */
  title: string
  /** Optional count to display next to title */
  count?: number
  /** Subtitle or description */
  subtitle?: string
  /** Action buttons or elements to display in header */
  actions?: ReactNode
  /** Whether header should stick to top on scroll */
  sticky?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * PageHeader - Consistent page header with title, subtitle, and actions
 * 
 * Provides a sticky header with consistent styling across all pages.
 * Supports dynamic count badges and action button slots.
 * 
 * @example
 * <PageHeader 
 *   title="Groups" 
 *   count={24}
 *   subtitle="Manage classes, schedules, and attendance"
 *   actions={<button>Create Group</button>}
 * />
 */
export function PageHeader({ 
  title, 
  count,
  subtitle, 
  actions, 
  sticky = true,
  className = '' 
}: PageHeaderProps) {
  const stickyClasses = sticky 
    ? 'sticky top-0 z-40' 
    : ''

  return (
    <header className={`${stickyClasses} relative overflow-hidden bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      <TerminalPattern opacity={0.04} id="header-pattern" />
      <div className="relative z-10 w-full flex items-end justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
            {title}
            {count !== undefined && (
              <span className="ml-2 text-2xl text-slate-400">({count})</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-sm text-on-surface-variant mt-2">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
