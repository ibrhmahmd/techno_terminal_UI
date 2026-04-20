import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

interface MetaItem {
  label: string
  value: string
}

interface StatusDataCardProps {
  title: string
  subtitle?: string
  status: 'paid' | 'unpaid' | 'partial' | 'overdue' | 'pending' | 'completed' | 'active' | 'inactive'
  statusLabel?: string
  amount?: {
    value: number
    currency?: string
  }
  meta?: MetaItem[]
  onClick?: () => void
  isClickable?: boolean
}

export function StatusDataCard({
  title,
  subtitle,
  status,
  statusLabel,
  amount,
  meta,
  onClick,
  isClickable,
}: StatusDataCardProps) {
  const statusConfig = {
    paid: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
    },
    completed: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
    },
    active: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
    },
    unpaid: {
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-600',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
    },
    overdue: {
      icon: <AlertCircle className="w-5 h-5" />,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-600',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
    },
    partial: {
      icon: <Clock className="w-5 h-5" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-600',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-700',
    },
    pending: {
      icon: <Clock className="w-5 h-5" />,
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      textColor: 'text-slate-600',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
    },
    inactive: {
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      textColor: 'text-slate-600',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
    },
  }

  const config = statusConfig[status]

  const formattedAmount = amount 
    ? `${Math.abs(amount.value).toLocaleString()}${amount.currency ? ` ${amount.currency}` : ''}`
    : null

  return (
    <div
      onClick={onClick}
      className={`${config.bg} ${config.border} border rounded-xl p-4 transition-colors ${
        isClickable || onClick ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg} ${config.iconColor}`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-on-surface">{title}</p>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            
            {statusLabel && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeBg} ${config.badgeText}`}>
                {statusLabel}
              </span>
            )}
          </div>

          {formattedAmount && (
            <p className={`text-lg font-bold ${config.textColor} mt-1`}>
              {amount!.value < 0 ? '-' : ''}{formattedAmount}
            </p>
          )}

          {meta && meta.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
              {meta.map((item, index) => (
                <span key={index}>
                  {item.label}: <span className={item.value.includes('Saved') || item.value.includes('Discount') ? 'text-green-600' : ''}>
                    {item.value}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusDataCard
