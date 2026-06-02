export interface PillOption {
  value: string
  label: string
  color?: string
  icon?: string
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
          const styles: Record<string, { selected: string; unselected: string }> = {
            emerald: { selected: 'bg-emerald-600 text-white shadow-sm border-transparent', unselected: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
            red: { selected: 'bg-red-600 text-white shadow-sm border-transparent', unselected: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
            purple: { selected: 'bg-purple-600 text-white shadow-sm border-transparent', unselected: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
            slate: { selected: 'bg-slate-600 text-white shadow-sm border-transparent', unselected: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' },
          }
          const s = styles[opt.color || 'slate']
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                isSelected ? s.selected : s.unselected
              }`}
            >
              {opt.icon && <span className="material-symbols-outlined text-base">{opt.icon}</span>}
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
