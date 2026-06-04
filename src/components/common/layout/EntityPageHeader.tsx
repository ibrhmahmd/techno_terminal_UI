import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '../Toast'

interface QuickInfoItem {
  icon?: ReactNode
  value: string
  label?: string
  copyable?: boolean
}

interface Action {
  label: string
  onClick: () => void
  icon?: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}

interface EntityPageHeaderProps {
  title: string
  subtitle?: string
  status?: {
    label: string
    variant: 'active' | 'inactive' | 'pending' | 'warning' | 'error'
  }
  quickInfo?: QuickInfoItem[]
  actions?: Action[]
  backLink?: string
  backLabel?: string
  whatsappPhone?: string | null
}

export function EntityPageHeader({
  title,
  subtitle,
  status,
  quickInfo,
  actions,
  backLink,
  backLabel = 'Back',
  whatsappPhone,
}: EntityPageHeaderProps) {
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
      showToast('Phone number copied to clipboard', 'success')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleWhatsApp = () => {
    if (whatsappPhone) {
      const cleanPhone = whatsappPhone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  const statusStyles = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-600',
    pending: 'bg-amber-100 text-amber-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
      <div className="max-w-[1680px] mx-auto">
        {backLink && (
          <button
            onClick={() => navigate(backLink)}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-on-surface mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </button>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
              {title}
            </h1>
            {status && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status.variant]}`}>
                {status.label}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {whatsappPhone && whatsappPhone !== '-' && (
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-green-600 border border-green-200 hover:bg-green-50"
                title="Open WhatsApp chat"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            )}
            {actions && actions.length > 0 && (
              <>
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      action.variant === 'danger' 
                        ? 'text-red-600 border border-red-200 hover:bg-red-50' :
                      action.variant === 'primary'
                        ? 'text-white bg-secondary hover:bg-secondary/90' :
                        'text-secondary border border-secondary hover:bg-secondary-container'
                    }`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        )}

        {quickInfo && quickInfo.length > 0 && (
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
            {quickInfo.map((info, index) => (
              <div key={index} className="flex items-center gap-1">
                {info.icon && <span className="text-slate-400">{info.icon}</span>}
                {info.copyable && info.value && info.value !== '-' ? (
                  <button
                    onClick={() => handleCopy(info.value, index)}
                    className="hover:text-secondary transition-colors cursor-pointer"
                    title="Click to copy"
                  >
                    {info.value}
                  </button>
                ) : (
                  <span>{info.value}</span>
                )}
                {info.label && <span className="text-slate-400">{info.label}</span>}
                {info.copyable && info.value && info.value !== '-' && copiedIndex === index && (
                  <Check className="w-3 h-3 text-green-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {ToastComponent}
    </header>
  )
}

export default EntityPageHeader
