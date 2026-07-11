export interface PillOption {
  value: string
  label: string
  color?: 'emerald' | 'red' | 'purple' | 'slate'
  icon?: string
}

interface PaymentMethodPillsProps {
  options: PillOption[]
  selected: string | null
  onChange: (value: string) => void
  error?: string
  label?: string
  layout?: 'horizontal' | 'vertical'
}

export function PaymentMethodPills({ options, selected, onChange, error, label, layout = 'horizontal' }: PaymentMethodPillsProps) {
  const isVertical = layout === 'vertical'
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      )}
      <div
        className={`${
          isVertical ? 'flex flex-col gap-2.5' : 'grid grid-cols-4 gap-1.5'
        } p-0.5 transition-all ${error ? 'ring-2 ring-red-400/50 rounded-xl animate-shake' : ''}`}
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
              className={`${
                isVertical
                  ? 'w-full py-3.5 px-4 text-base font-bold rounded-xl justify-start inline-flex items-center gap-2.5'
                  : 'w-full py-2 px-1 text-[10px] font-extrabold rounded-xl flex flex-col items-center justify-center gap-1 text-center'
              } transition-all border shadow-sm active:scale-[0.98] ${
                isSelected ? s.selected : s.unselected
              }`}
            >
              {opt.icon && (
                <span className={`material-symbols-outlined ${isVertical ? 'text-[20px]' : 'text-[18px]'}`} aria-hidden="true">
                  {opt.icon}
                </span>
              )}
              <span className="truncate max-w-full">{opt.label}</span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
