import { useState, useCallback } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageSection, Pagination, Modal, ConfirmDialog } from '../components/common'
import { CardGrid } from '../components/directory/CardGrid'
import { CardSkeleton } from '../components/directory/shared/CardSkeleton'
import { useToast } from '../components/common/Toast'
import { CertificatesHeader } from '../components/certificates/CertificatesHeader'
import { CertificateCard } from '../components/certificates/CertificateCard'
import { CertificateDetailModal } from '../components/certificates/CertificateDetailModal'
import { CertificateForm } from '../components/certificates/CertificateForm'
import { useCertificatesList, useDownloadCertificatePdf, useRevokeCertificate } from '../hooks/useCertificates'
import { useAuthStore } from '../store/authStore'
import type { CertificateDTO } from '../api/certificates/types'

export function CertificatesPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin'

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [trackFilter, setTrackFilter] = useState<string>('')
  const [includeRevoked, setIncludeRevoked] = useState(false)

  const [selectedCert, setSelectedCert] = useState<CertificateDTO | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null)

  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)

  const { showToast, ToastComponent } = useToast()

  const { data, isLoading, error } = useCertificatesList({
    page,
    page_size: pageSize,
    search: searchTerm || undefined,
    track: trackFilter || undefined,
    include_revoked: includeRevoked || undefined,
  })

  const downloadPdf = useDownloadCertificatePdf()
  const revokeMutation = useRevokeCertificate()

  const certificates = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleCardClick = useCallback((cert: CertificateDTO) => {
    setSelectedCert(cert)
    setIsDetailOpen(true)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleTrackFilterChange = useCallback((track: string) => {
    setTrackFilter(track)
    setPage(1)
  }, [])

  const handleDownloadPdf = useCallback(async (certId: string) => {
    setDownloadingCertId(certId)
    try {
      const blob = await downloadPdf.mutateAsync(certId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const cert = certificates.find((c) => c.cert_id === certId)
      const datePart = cert ? cert.issue_date.replace(/-/g, '') : certId
      const namePart = cert ? cert.student_name.replace(/\s+/g, '_') : 'certificate'
      a.download = `${namePart}_${datePart}.pdf`
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
      showToast('PDF downloaded successfully', 'success')
    } catch {
      showToast('Failed to download PDF', 'error')
    } finally {
      setDownloadingCertId(null)
    }
  }, [downloadPdf, showToast, certificates])

  const handleRevokeClick = useCallback((certId: string) => {
    setRevokeTarget(certId)
    setRevokeReason('')
    setIsRevokeDialogOpen(true)
  }, [])

  const handleConfirmRevoke = useCallback(async () => {
    if (!revokeTarget || !revokeReason.trim()) return
    try {
      await revokeMutation.mutateAsync({ certId: revokeTarget, data: { reason: revokeReason.trim() } })
      showToast('Certificate revoked successfully', 'success')
      setIsRevokeDialogOpen(false)
      setRevokeTarget(null)
      setRevokeReason('')
    } catch {
      showToast('Failed to revoke certificate', 'error')
    }
  }, [revokeTarget, revokeReason, revokeMutation, showToast])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Certificates" />

      <CertificatesHeader
        totalCount={total}
        onSearchChange={handleSearchChange}
        onGenerateClick={isAdmin ? () => setIsGenerateOpen(true) : undefined}
      />

      <PageSection>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <select
              value={trackFilter}
              onChange={(e) => handleTrackFilterChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="">All Tracks</option>
              <option value="html">HTML — Web Structure</option>
              <option value="css">CSS — Styling & Layout</option>
              <option value="javascript">JavaScript — Interactivity</option>
              <option value="python">Python — Programming</option>
              <option value="advanced">Advanced — Web Pro</option>
              <option value="problem_solving">Problem Solving — Logic</option>
              <option value="robotics-wedo">Robotics WeDo 2.0</option>
              <option value="robotics-spike-essential">Robotics SPIKE Essential</option>
              <option value="robotics-spike-prime">Robotics SPIKE Prime</option>
              <option value="robotics-ev3">Robotics EV3</option>
              <option value="robotics-arduino">Robotics Arduino</option>
              <option value="scratch">Scratch</option>
              <option value="scratch-jr">Scratch Jr</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRevoked}
                onChange={(e) => { setIncludeRevoked(e.target.checked); setPage(1) }}
                className="rounded border-slate-300"
              />
              Include revoked
            </label>
          </div>
          <p className="text-sm text-slate-500">
            Showing {certificates.length} of {total} certificates
          </p>
        </div>

        {isLoading ? (
          <CardGrid>
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </CardGrid>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-center">{error instanceof Error ? error.message : 'Failed to load certificates'}</div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3" aria-hidden="true">{searchTerm ? 'search' : 'verified'}</span>
            <p className="text-slate-500 text-sm">{searchTerm ? `No certificates matching "${searchTerm}"` : 'No certificates found'}</p>
          </div>
        ) : (
          <>
            <CardGrid className="xl:grid-cols-3">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert.cert_id}
                  certificate={cert}
                  onClick={handleCardClick}
                  onDownloadPdf={handleDownloadPdf}
                  onRevoke={isAdmin ? handleRevokeClick : undefined}
                  isDownloadingPdf={downloadingCertId === cert.cert_id}
                />
              ))}
            </CardGrid>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </PageSection>

      {/* Detail Modal */}
      <CertificateDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedCert(null) }}
        certificate={selectedCert}
        onDownloadPdf={handleDownloadPdf}
        onRevoke={isAdmin ? handleRevokeClick : undefined}
        isDownloadingPdf={downloadingCertId === selectedCert?.cert_id}
      />

      {/* Generate Modal */}
      {isGenerateOpen && (
        <Modal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} title="Generate Certificate" size="lg">
          <CertificateForm
            onSuccess={() => {
              setIsGenerateOpen(false)
              showToast('Certificate generated successfully', 'success')
            }}
            onCancel={() => setIsGenerateOpen(false)}
          />
        </Modal>
      )}

      {/* Revoke Dialog */}
      <ConfirmDialog
        isOpen={isRevokeDialogOpen}
        title="Revoke Certificate"
        message="Are you sure you want to revoke this certificate? This action cannot be undone."
        confirmText="Revoke"
        cancelText="Cancel"
        onConfirm={handleConfirmRevoke}
        onCancel={() => { setIsRevokeDialogOpen(false); setRevokeTarget(null); setRevokeReason('') }}
        variant="danger"
        disabled={!revokeReason.trim() || revokeMutation.isPending}
      >
        <div className="mt-4">
          <label htmlFor="revoke-reason" className="block text-sm font-medium text-slate-700 mb-1">
            Reason for revocation <span className="text-red-500">*</span>
          </label>
          <textarea
            id="revoke-reason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/70"
            placeholder="Enter reason for revoking this certificate..."
          />
        </div>
      </ConfirmDialog>

      {ToastComponent}
    </div>
  )
}
