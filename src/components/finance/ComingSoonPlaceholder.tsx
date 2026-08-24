import { useTranslation } from 'react-i18next'

interface ComingSoonPlaceholderProps {
  title?: string
  description?: string
  icon?: string
}

export function ComingSoonPlaceholder({
  title,
  description,
  icon = 'construction',
}: ComingSoonPlaceholderProps) {
  const { t } = useTranslation('common')
  const displayTitle = title ?? t('comingSoon.title')
  const displayDescription = description ?? t('comingSoon.description')

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 mb-4" aria-hidden="true">{icon}</span>
      <h3 className="font-headline text-xl font-semibold text-on-surface mb-2">{displayTitle}</h3>
      <p className="text-slate-500 max-w-md">{displayDescription}</p>
    </div>
  )
}
