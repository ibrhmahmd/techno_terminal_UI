import { useTranslation } from 'react-i18next'
import { Modal, LoadingSpinner } from '../common'
import { formatDate } from '../../utils/formatting'
import type { CertificateDTO } from '../../api/certificates/types'

interface CertificateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  certificate: CertificateDTO | null
  onDownloadPdf?: (certId: string) => void
  onRevoke?: (certId: string) => void
  isDownloadingPdf?: boolean
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-end">{value ?? '—'}</span>
    </div>
  )
}

export function CertificateDetailModal({
  isOpen,
  onClose,
  certificate,
  onDownloadPdf,
  onRevoke,
  isDownloadingPdf,
}: CertificateDetailModalProps) {
  const { t } = useTranslation('common')
  if (!certificate) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('certificates.detail_title')} size="lg">
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`rounded-lg px-4 py-3 ${certificate.revoked_at ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">{certificate.revoked_at ? 'gavel' : 'verified'}</span>
            <span className={`text-sm font-bold ${certificate.revoked_at ? 'text-red-700' : 'text-green-700'}`}>
              {certificate.revoked_at ? t('certificates.status_revoked') : t('certificates.status_active')}
            </span>
            {certificate.revoked_reason && (
              <span className="text-xs text-red-600 ms-2">— {certificate.revoked_reason}</span>
            )}
          </div>
        </div>

        {/* Certificate ID */}
        <div className="bg-slate-50 rounded-lg px-4 py-3 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('certificates.certificate_id')}</p>
          <p className="font-mono text-sm font-bold text-slate-900">{certificate.cert_id}</p>
        </div>

        {/* Info Grid */}
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          <InfoRow label={t('certificates.info_row_student')} value={certificate.student_name} />
          <InfoRow label={t('certificates.info_row_course')} value={certificate.course_name} />
          <InfoRow label={t('certificates.info_row_track')} value={certificate.course_track.replace(/_/g, ' ')} />
          <InfoRow label={t('certificates.info_row_level')} value={certificate.level} />
          <InfoRow label={t('certificates.info_row_issue_date')} value={formatDate(certificate.issue_date)} />
          <InfoRow label={t('certificates.info_row_branch')} value={certificate.branch} />
          {certificate.instructor && <InfoRow label={t('certificates.info_row_instructor')} value={certificate.instructor} />}
          {certificate.director && <InfoRow label={t('certificates.info_row_director')} value={certificate.director} />}
          {certificate.revoked_at && (
            <>
              <InfoRow label={t('certificates.info_row_revoked_at')} value={formatDate(certificate.revoked_at)} />
              <InfoRow label={t('certificates.info_row_revoke_reason')} value={certificate.revoked_reason} />
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {onDownloadPdf && !certificate.revoked_at && (
            <button
              onClick={() => onDownloadPdf(certificate.cert_id)}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {isDownloadingPdf ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span className="material-symbols-outlined text-sm" aria-hidden="true">picture_as_pdf</span>
              )}
              {t('certificates.download_pdf')}
            </button>
          )}
          {onRevoke && !certificate.revoked_at && (
            <button
              onClick={() => onRevoke(certificate.cert_id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors ms-auto"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">gavel</span>
              {t('certificates.revoke')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
