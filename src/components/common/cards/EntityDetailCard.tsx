import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface DetailItem {
  label: string
  value: string
  icon?: ReactNode
  link?: string
  onClick?: () => void
}

interface EntityDetailCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  details: DetailItem[]
  variant?: 'hero' | 'standard' | 'compact'
  status?: 'active' | 'inactive' | 'pending' | 'completed'
  actions?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
}

export function EntityDetailCard({
  title,
  subtitle,
  icon,
  details,
  variant = 'standard',
  status,
  actions,
}: EntityDetailCardProps) {
  const navigate = useNavigate()

  const variantStyles = {
    hero: 'bg-gradient-to-br from-secondary-container/50 to-white border-secondary/20 shadow-sm',
    standard: 'bg-blue-50 border-blue-200',
    compact: 'bg-slate-50 border-slate-200',
  }

  const statusBadge = status && (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      status === 'active' ? 'bg-green-100 text-green-700' :
      status === 'inactive' ? 'bg-slate-100 text-slate-600' :
      status === 'pending' ? 'bg-amber-100 text-amber-700' :
      'bg-blue-100 text-blue-700'
    }`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )

  return (
    <div className={`rounded-xl border p-6 relative overflow-hidden ${variantStyles[variant]}`}>
      {variant === 'hero' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      )}
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          {icon && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              variant === 'hero' ? 'bg-secondary/10' : 'bg-white/60'
            }`}>
              <span className={variant === 'hero' ? 'text-secondary' : 'text-blue-600'}>
                {icon}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-on-surface">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          {statusBadge}
        </div>

        <div className={`grid gap-4 ${details.length > 2 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {details.map((detail, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-3 ${variant === 'hero' ? 'bg-white/60' : 'bg-white/50'}`}
            >
              <label className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                {detail.icon}
                {detail.label}
              </label>
              {detail.link ? (
                <button
                  onClick={() => navigate(detail.link!)}
                  className="font-medium text-secondary hover:text-secondary/80 hover:underline flex items-center gap-1 transition-colors"
                >
                  {detail.value}
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : detail.onClick ? (
                <button
                  onClick={detail.onClick}
                  className="font-medium text-secondary hover:text-secondary/80 hover:underline transition-colors"
                >
                  {detail.value}
                </button>
              ) : (
                <p className="font-medium text-on-surface">{detail.value}</p>
              )}
            </div>
          ))}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/50">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  action.variant === 'danger' ? 'text-red-600 bg-red-50 hover:bg-red-100' :
                  action.variant === 'primary' ? 'text-white bg-secondary hover:bg-secondary/90' :
                  'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EntityDetailCard
