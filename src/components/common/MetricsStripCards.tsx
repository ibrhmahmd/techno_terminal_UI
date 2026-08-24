import { useNavDirection } from '../../hooks/useNavDirection'

interface MetricItem {
  label: string
  value?: string
  icon: string
  color: 'secondary' | 'emerald' | 'amber' | 'blue' | 'slate'
  isLoading?: boolean
  isActive?: boolean
  id?: string
  controls?: string
  onClick?: () => void
}

interface MetricsStripCardsProps {
  items: MetricItem[]
  activeIndex?: number
}

const colorMap: Record<MetricItem['color'], { bg: string; text: string; iconBg: string }> = {
  secondary: { bg: 'bg-secondary/5', text: 'text-secondary', iconBg: 'bg-secondary/10' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-400', iconBg: 'bg-slate-100' },
}

function MetricCard({ label, value, icon, color, isLoading, isActive, id, controls, onClick }: MetricItem) {
  const styles = colorMap[color]

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-1 min-w-[160px] animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-16 mb-3" />
        <div className="h-7 bg-slate-300 rounded w-24" />
      </div>
    )
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive || false}
      aria-controls={controls}
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl border shadow-sm p-4 flex-1 min-w-[160px] text-left transition-all hover:shadow-md hover:border-slate-300 ${onClick ? 'cursor-pointer' : 'cursor-default'} ${isActive ? 'ring-2 ring-secondary bg-secondary/5 border-secondary/30' : 'border-slate-200'}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`material-symbols-outlined text-lg ${isActive ? 'bg-secondary text-white' : `${styles.iconBg} ${styles.text}`} rounded-lg p-1`} aria-hidden="true">
          {icon}
        </span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{label}</span>
      </div>
      {value && <p className={`text-2xl font-bold font-headline ${isActive ? 'text-secondary' : styles.text}`}>{value}</p>}
    </button>
  )
}

export function MetricsStripCards({ items, activeIndex }: MetricsStripCardsProps) {
  const { getNextIndex } = useNavDirection()

  const handleTablistKeyDown = (e: React.KeyboardEvent) => {
    const count = items.length
    let newIndex: number | undefined
    const navIndex = getNextIndex(e, activeIndex ?? 0, count)
    if (navIndex !== null) newIndex = navIndex
    if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = count - 1
    }
    if (newIndex !== undefined) {
      e.preventDefault()
      const target = document.getElementById(items[newIndex].id ?? '')
      target?.click()
      target?.focus()
    }
  }

  return (
    <div
      className="flex flex-wrap gap-4"
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleTablistKeyDown}
    >
      {items.map((item, i) => (
        <MetricCard key={i} {...item} isActive={i === activeIndex} />
      ))}
    </div>
  )
}
