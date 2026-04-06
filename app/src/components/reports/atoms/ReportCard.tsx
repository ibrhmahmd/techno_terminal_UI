interface ReportCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate'
  isLoading?: boolean
  error?: string
}

export function ReportCard({ title, value, subtitle, icon, color, isLoading, error }: ReportCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700'
  }

  if (isLoading) {
    return (
      <div className={`p-6 rounded-xl border ${colorClasses[color]} animate-pulse`}>
        <div className="flex items-start justify-between">
          <div className="w-full">
            <div className="h-4 bg-current opacity-20 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-current opacity-30 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-current opacity-20 rounded w-1/3"></div>
          </div>
          <div className="w-8 h-8 bg-current opacity-20 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </div>
          <span className="material-symbols-outlined text-3xl opacity-50">error</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm opacity-70 mt-1">{subtitle}</p>}
        </div>
        <span className="material-symbols-outlined text-3xl opacity-50">{icon}</span>
      </div>
    </div>
  )
}
