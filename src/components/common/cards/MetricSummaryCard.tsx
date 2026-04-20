interface BreakdownItem {
  label: string
  value: number | string
  status?: 'positive' | 'negative' | 'neutral'
}

interface MetricSummaryCardProps {
  label: string
  value: number | string
  currency?: string
  status?: 'positive' | 'negative' | 'neutral' | 'warning'
  statusLabel?: string
  breakdown?: BreakdownItem[]
  isLoading?: boolean
  error?: string
}

export function MetricSummaryCard({
  label,
  value,
  currency,
  status = 'neutral',
  statusLabel,
  breakdown,
  isLoading,
  error,
}: MetricSummaryCardProps) {
  const statusStyles = {
    positive: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      lightBg: 'bg-green-50',
      border: 'border-green-200',
    },
    negative: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      lightBg: 'bg-red-50',
      border: 'border-red-200',
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      lightBg: 'bg-slate-50',
      border: 'border-slate-200',
    },
    warning: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      lightBg: 'bg-amber-50',
      border: 'border-amber-200',
    },
  }

  const styles = statusStyles[status]

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-slate-300 rounded w-3/4"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    )
  }

  const formattedValue = typeof value === 'number' 
    ? `${Math.abs(value).toLocaleString()}${currency ? ` ${currency}` : ''}`
    : value

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 ${styles.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-700">{label}</h3>
        {statusLabel && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.lightBg} ${styles.text}`}>
            {statusLabel}
          </span>
        )}
      </div>

      <p className={`text-2xl font-bold ${styles.text}`}>
        {typeof value === 'number' && value < 0 ? '-' : ''}{formattedValue}
      </p>

      {breakdown && breakdown.length > 0 && (
        <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
          {breakdown.map((item, index) => (
            <span key={index} className={
              item.status === 'positive' ? 'text-green-600 font-medium' :
              item.status === 'negative' ? 'text-red-600' :
              ''
            }>
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default MetricSummaryCard
