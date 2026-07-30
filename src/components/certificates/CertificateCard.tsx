import { formatDate } from '../../utils/formatting'
import type { CertificateDTO } from '../../api/certificates/types'

interface CertificateCardProps {
  certificate: CertificateDTO
  onDownloadPdf: (certId: string) => void
  onRevoke?: (certId: string) => void
  onClick: (cert: CertificateDTO) => void
  isDownloadingPdf?: boolean
}

const TRACK_ICONS: Record<string, string> = {
  html: 'code',
  css: 'palette',
  javascript: 'code',
  python: 'code',
  advanced: 'code',
  problem_solving: 'psychology',
  'robotics-wedo': 'smart_toy',
  'robotics-spike-essential': 'smart_toy',
  'robotics-spike-prime': 'smart_toy',
  'robotics-ev3': 'smart_toy',
  'robotics-arduino': 'hardware',
  scratch: 'stadia_controller',
  'scratch-jr': 'stadia_controller',
  iot: 'sensors',
  ai: 'neurology',
  game_dev: 'sports_esports',
  digital_marketing: 'campaign',
  electronics: 'bolt',
}

export function CertificateCard({
  certificate,
  onDownloadPdf,
  onRevoke,
  onClick,
  isDownloadingPdf,
}: CertificateCardProps) {
  const icon = TRACK_ICONS[certificate.course_track] || 'school'
  const isRevoked = !!certificate.revoked_at

  return (
    <div
      onClick={() => onClick(certificate)}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-on-surface text-base truncate">
            {certificate.student_name}
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{certificate.cert_id}</p>
        </div>
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-slate-100 text-slate-600`}>
          <span className="material-symbols-outlined text-lg" aria-hidden="true">{icon}</span>
        </span>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        {isRevoked ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Revoked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-slate-500 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-slate-400" aria-hidden="true">school</span>
          <span className="truncate">{certificate.course_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-slate-400" aria-hidden="true">layers</span>
          <span>{certificate.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-slate-400" aria-hidden="true">calendar_today</span>
          <span>{formatDate(certificate.issue_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-slate-400" aria-hidden="true">business</span>
          <span>{certificate.branch}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onDownloadPdf(certificate.cert_id)}
          disabled={isDownloadingPdf || isRevoked}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-40 transition-colors"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">picture_as_pdf</span>
          PDF
        </button>
        {onRevoke && !isRevoked && (
          <button
            onClick={() => onRevoke(certificate.cert_id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors ml-auto"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">gavel</span>
            Revoke
          </button>
        )}
      </div>
    </div>
  )
}
