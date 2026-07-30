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
  return (
    <PageHeader
      title="Certificates"
      count={totalCount}
      subtitle="Generate, view, and manage course completion certificates"
      actions={
        <div className="flex items-center gap-2">
          <SearchBar
            placeholder="Search by student or cert ID..."
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
              Generate
            </button>
          )}
        </div>
      }
    />
  )
}
