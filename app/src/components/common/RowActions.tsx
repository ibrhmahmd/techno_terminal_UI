type IconType = string | React.ComponentType<{ className?: string }>

type ActionVariant = 'default' | 'danger' | 'primary'

interface RowAction {
  /** Icon - Lucide component or Material icon name */
  icon: IconType
  /** Tooltip/aria label */
  label: string
  /** Click handler */
  onClick: (e: React.MouseEvent) => void
  /** Visual variant */
  variant?: ActionVariant
  /** Whether action is disabled */
  disabled?: boolean
}

interface RowActionsProps {
  /** Array of action definitions */
  actions: RowAction[]
  /** When to show actions: always visible or on hover */
  visible?: 'always' | 'hover'
  /** Additional CSS classes */
  className?: string
  /** Alignment of buttons */
  align?: 'left' | 'right' | 'center'
}

/**
 * RowActions - Standardized action button group for table rows
 * 
 * Provides consistent view/edit/delete button styling with hover effects.
 * Supports both Lucide icons and Material Symbols.
 * 
 * @example
 * // Standard view/edit/delete actions
 * <RowActions 
 *   actions={[
 *     { icon: Eye, label: 'View', onClick: handleView, variant: 'primary' },
 *     { icon: Edit2, label: 'Edit', onClick: handleEdit },
 *     { icon: Trash2, label: 'Delete', onClick: handleDelete, variant: 'danger' }
 *   ]}
 * />
 * 
 * @example
 * // Always visible with custom icons
 * <RowActions 
 *   visible="always"
 *   actions={[
 *     { icon: 'visibility', label: 'View', onClick: handleView },
 *     { icon: 'edit', label: 'Edit', onClick: handleEdit }
 *   ]}
 * />
 */
export function RowActions({ 
  actions, 
  visible = 'hover',
  className = '',
  align = 'right'
}: RowActionsProps) {
  const visibilityClasses = visible === 'hover' 
    ? 'opacity-0 group-hover/row:opacity-100 transition-opacity' 
    : ''

  const alignClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center'
  }

  const getVariantClasses = (variant: ActionVariant) => {
    switch (variant) {
      case 'danger':
        return 'text-slate-400 hover:text-red-600 hover:bg-red-50'
      case 'primary':
        return 'text-slate-400 hover:text-secondary hover:bg-secondary-container'
      default:
        return 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
    }
  }

  const isLucideIcon = (icon: IconType): icon is React.ComponentType<{ className?: string }> => {
    return typeof icon !== 'string'
  }

  return (
    <div 
      className={`flex items-center gap-1 ${visibilityClasses} ${alignClasses[align]} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          disabled={action.disabled}
          title={action.label}
          aria-label={action.label}
          className={`p-1.5 rounded transition-colors ${getVariantClasses(action.variant || 'default')}`}
        >
          {isLucideIcon(action.icon) ? (
            <action.icon className="w-4 h-4" />
          ) : (
            <span className="material-symbols-outlined text-lg">{action.icon}</span>
          )}
        </button>
      ))}
    </div>
  )
}
