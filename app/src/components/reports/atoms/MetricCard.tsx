interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'green' | 'red' | 'blue' | 'amber' | 'slate'
  isLoading?: boolean
  error?: string
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  color = 'slate',
  isLoading,
  error 
}: MetricCardProps) {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    slate: 'text-slate-900'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-slate-300 rounded w-1/2"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
