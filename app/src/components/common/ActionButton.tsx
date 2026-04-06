import { ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ActionButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant
  /** Size of the button */
  size?: ButtonSize
  /** Material icon name (e.g., 'add', 'edit', 'delete') */
  icon?: string
  /** Button content/text */
  children?: ReactNode
  /** Click handler */
  onClick?: () => void
  /** Disabled state */
  disabled?: boolean
  /** Loading state (shows spinner) */
  loading?: boolean
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset'
  /** Additional CSS classes */
  className?: string
  /** Accessibility label */
  ariaLabel?: string
}

/**
 * ActionButton - Consistent button component with multiple variants
 * 
 * Provides standardized button styling across the application.
 * Supports icons via Material Symbols, loading states, and multiple visual variants.
 * 
 * @example
 * // Primary action
 * <ActionButton variant="primary" icon="add">Create</ActionButton>
 * 
 * @example
 * // Danger action with loading state
 * <ActionButton variant="danger" icon="delete" loading={isDeleting}>Delete</ActionButton>
 * 
 * @example
 * // Ghost/transparent button
 * <ActionButton variant="ghost" icon="close" onClick={onClose} />
 */
export function ActionButton({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ariaLabel
}: ActionButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/20'
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl'
  }

  const variantClasses = {
    primary: 'text-white bg-secondary hover:bg-secondary/90 disabled:opacity-50',
    secondary: 'text-secondary border border-secondary hover:bg-secondary-container disabled:opacity-50',
    danger: 'text-white bg-red-600 hover:bg-red-700 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50'
  }

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : icon ? (
        <span className={`material-symbols-outlined ${iconSizes[size]}`}>{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
