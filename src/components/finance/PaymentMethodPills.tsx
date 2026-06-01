interface PillOption {
  value: string
  label: string
}

interface PaymentMethodPillsProps {
  options: PillOption[]
  selected: string | null
  onChange: (value: string) => void
  error?: string
  label?: string
}

export function PaymentMethodPills({ options, selected, onChange, error, label }: PaymentMethodPillsProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-on-surface mb-2">{label}</label>
      )}
      <div
        className={`flex flex-wrap gap-2 p-1 rounded-lg transition-all ${error ? 'ring-2 ring-red-400 animate-shake' : ''}`}
      >
        {options.map((opt) => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
