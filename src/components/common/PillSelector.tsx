// PillSelector.tsx
// Reusable pill/segmented control component for selecting from mutually exclusive options
// Supports icons, optional dot indicators, and full keyboard accessibility

export interface PillOption {
  value: string
  label: string
  icon?: string        // Material Symbols icon name
  dotColor?: string    // Tailwind class for dot background (e.g., 'bg-blue-500')
}

export interface PillSelectorProps {
  options: PillOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
  required?: boolean
}

export function PillSelector({
  options,
  value,
  onChange,
  label,
  disabled = false,
  required = false,
}: PillSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (disabled) return

    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
        onChange(options[nextIndex].value)
        break
      case 'ArrowRight':
        e.preventDefault()
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
        onChange(options[nextIndex].value)
        break
      case 'Home':
        e.preventDefault()
        onChange(options[0].value)
        break
      case 'End':
        e.preventDefault()
        onChange(options[options.length - 1].value)
        break
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-on-surface">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}
      <div
        className={`flex items-center gap-1 rounded-lg bg-slate-100 p-1 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option, index) => {
          const isActive = value === option.value
          const ringColor = option.dotColor?.replace('bg-', 'ring-') || 'ring-secondary'

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !disabled && onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? `bg-white shadow-sm text-on-surface ring-2 ring-offset-1 ${ringColor}`
                  : 'text-slate-500 hover:text-on-surface hover:bg-white/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {option.dotColor && (
                <span className={`inline-block w-2 h-2 rounded-full ${option.dotColor}`} />
              )}
              {option.icon && (
                <span className="material-symbols-outlined text-[16px]">{option.icon}</span>
              )}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
