interface DualNumberInputProps {
  minValue: number | ''
  maxValue: number | ''
  onMinChange: (value: number | '') => void
  onMaxChange: (value: number | '') => void
  minPlaceholder?: string
  maxPlaceholder?: string
  unit?: string
  min?: number
  max?: number
  className?: string
}

export function DualNumberInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  unit = '',
  min = 0,
  max = 100,
  className = '',
}: DualNumberInputProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          placeholder={minPlaceholder}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-20 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-center"
        />
        {unit && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">{unit}</span>
        )}
      </div>
      <span className="text-slate-400 font-medium">-</span>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          placeholder={maxPlaceholder}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-20 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-center"
        />
        {unit && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">{unit}</span>
        )}
      </div>
    </div>
  )
}
