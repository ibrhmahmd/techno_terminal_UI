import { useTranslation } from 'react-i18next'
import { PageHeader, SearchBar } from '../common'

interface CertificatesHeaderProps {
  totalCount: number
  onSearchChange: (value: string) => void
  onGenerateClick?: () => void
}

export function CertificatesHeader({
  totalCount,
  onSearchChange,
  onGenerateClick,
}: CertificatesHeaderProps) {
  const { t } = useTranslation('common')
  return (
    <PageHeader
      title={t('certificates.title')}
      count={totalCount}
      subtitle={t('certificates.subtitle')}
      actions={
        <div className="flex items-center gap-2">
          <SearchBar
            placeholder={t('certificates.search_placeholder')}
            onSearch={onSearchChange}
            minLength={2}
            className="w-64"
          />
          {onGenerateClick && (
            <button
              onClick={onGenerateClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
              {t('certificates.generate')}
            </button>
          )}
        </div>
      }
    />
  )
}
