// Bulk Messaging Tab
// Send bulk notifications to groups of recipients

import { useState, useMemo } from 'react'
import { useNotificationTemplates } from '../../../hooks/notifications'
import { usePreviewRecipients, useSendBulkMessage, useActiveBulkJobs, useCancelBulkJob } from '../../../hooks/notifications'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { Modal } from '../../common/Modal'
import type { 
  NotificationType, 
  RecipientType, 
  BulkMessagePreviewDTO,
  BulkMessageJobDTO 
} from '../../../api/notifications'

const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: 'enrollment_created', label: 'Enrollment Created' },
  { value: 'enrollment_completed', label: 'Enrollment Completed' },
  { value: 'enrollment_dropped', label: 'Enrollment Dropped' },
  { value: 'enrollment_transferred', label: 'Enrollment Transferred' },
  { value: 'level_progression', label: 'Level Progression' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'payment_reminder', label: 'Payment Reminder' },
  { value: 'daily_report', label: 'Daily Report' },
  { value: 'weekly_report', label: 'Weekly Report' },
  { value: 'monthly_report', label: 'Monthly Report' },
  { value: 'competition_team_registration', label: 'Competition Registration' },
  { value: 'competition_fee_payment', label: 'Competition Payment' },
  { value: 'competition_placement', label: 'Competition Placement' },
]

const RECIPIENT_TYPE_OPTIONS: { value: RecipientType; label: string }[] = [
  { value: 'admins', label: 'All Admins' },
  { value: 'students', label: 'All Students' },
  { value: 'parents', label: 'All Parents' },
  { value: 'enrolled_students', label: 'Currently Enrolled Students' },
  { value: 'active_students', label: 'Active Students' },
  { value: 'teams', label: 'Competition Teams' },
]

export function BulkMessagingTab() {
  const { data: templates, isLoading: templatesLoading } = useNotificationTemplates()
  const previewRecipients = usePreviewRecipients()
  const sendBulkMessage = useSendBulkMessage()
  const { data: activeJobs } = useActiveBulkJobs()
  const cancelJob = useCancelBulkJob()

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('')
  const [selectedType, setSelectedType] = useState<NotificationType>('enrollment_created')
  const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<RecipientType[]>([])
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  
  // Modal states
  const [previewData, setPreviewData] = useState<BulkMessagePreviewDTO | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [sentJobId, setSentJobId] = useState<number | null>(null)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)

  const selectedTemplate = useMemo(() => 
    templates?.find(t => t.id === Number(selectedTemplateId)),
    [templates, selectedTemplateId]
  )

  const handlePreview = async () => {
    if (!selectedTemplateId) return
    
    const result = await previewRecipients.mutateAsync({
      template_id: Number(selectedTemplateId),
      notification_type: selectedType,
      recipient_filter: {
        recipient_types: selectedRecipientTypes.length > 0 ? selectedRecipientTypes : undefined,
      },
      variable_values: Object.keys(variableValues).length > 0 ? variableValues : undefined,
    })
    
    setPreviewData(result)
    setIsPreviewOpen(true)
  }

  const handleSend = async () => {
    if (!selectedTemplateId) return
    
    const result = await sendBulkMessage.mutateAsync({
      template_id: Number(selectedTemplateId),
      notification_type: selectedType,
      recipient_filter: {
        recipient_types: selectedRecipientTypes.length > 0 ? selectedRecipientTypes : undefined,
      },
      variable_values: Object.keys(variableValues).length > 0 ? variableValues : undefined,
    })
    
    setSentJobId(result.job_id)
    setIsJobModalOpen(true)
    setIsPreviewOpen(false)
  }

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Active Jobs */}
      {activeJobs && activeJobs.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">sync</span>
            </div>
            <div>
              <h3 className="font-medium text-on-surface">Active Jobs</h3>
              <p className="text-sm text-slate-500">Currently processing bulk messages</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {activeJobs.map(job => (
              <JobCard key={job.id} job={job} onCancel={() => cancelJob.mutate(job.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Composer */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-600">send</span>
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Compose Message</h3>
            <p className="text-sm text-slate-500">Send notifications to multiple recipients</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Template *</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(Number(e.target.value) || '')
                setVariableValues({})
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              required
            >
              <option value="">Select a template...</option>
              {templates?.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notification Type *</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as NotificationType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              required
            >
              {NOTIFICATION_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Variable Values */}
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Template Variables</label>
              <div className="space-y-3">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.name}>
                    <label className="block text-xs text-slate-500 mb-1">
                      {variable.name}
                      {variable.required && <span className="text-red-500"> *</span>}
                    </label>
                    <input
                      type="text"
                      value={variableValues[variable.name] || ''}
                      onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                      placeholder={variable.description}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      required={variable.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipient Types */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Recipients *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {RECIPIENT_TYPE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedRecipientTypes.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecipientTypes([...selectedRecipientTypes, opt.value])
                      } else {
                        setSelectedRecipientTypes(selectedRecipientTypes.filter(t => t !== opt.value))
                      }
                    }}
                    className="w-4 h-4 text-secondary rounded"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handlePreview}
              disabled={!selectedTemplateId || selectedRecipientTypes.length === 0}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Preview Recipients
            </button>
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewData={previewData}
        onSend={handleSend}
        isSending={sendBulkMessage.isPending}
      />

      {/* Job Progress Modal */}
      <JobProgressModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        jobId={sentJobId}
      />
    </div>
  )
}

// Job Card Component
interface JobCardProps {
  job: BulkMessageJobDTO
  onCancel: () => void
}

function JobCard({ job, onCancel }: JobCardProps) {
  const progressPercent = job.progress_percent
  const isProcessing = job.status === 'processing' || job.status === 'queued'

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500">send</span>
          <span className="font-medium text-slate-700">Job #{job.id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            job.status === 'completed' ? 'bg-green-100 text-green-700' :
            job.status === 'failed' ? 'bg-red-100 text-red-700' :
            job.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
        {isProcessing && (
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
        <div 
          className="bg-secondary h-2 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500">
        <span>{job.processed_count} of {job.total_recipients} processed</span>
        <span>{job.success_count} success / {job.failure_count} failed</span>
      </div>
    </div>
  )
}

// Preview Modal Component
interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewData: BulkMessagePreviewDTO | null
  onSend: () => void
  isSending: boolean
}

function PreviewModal({ isOpen, onClose, previewData, onSend, isSending }: PreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Recipients"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={onSend}
            disabled={isSending || !previewData || previewData.total_recipients === 0}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark disabled:opacity-50 transition-colors"
          >
            {isSending ? 'Sending...' : `Send to ${previewData?.total_recipients || 0} Recipients`}
          </button>
        </div>
      }
    >
      {previewData ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-secondary">{previewData.total_recipients}</p>
              <p className="text-sm text-slate-600">Total Recipients</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-slate-700">{previewData.cost_estimate.toFixed(2)}</p>
              <p className="text-sm text-slate-600">Estimated Cost (EGP)</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-slate-700">{previewData.variables_required.length}</p>
              <p className="text-sm text-slate-600">Variables Required</p>
            </div>
          </div>

          {/* Sample Recipients */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Sample Recipients</h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              {previewData.recipients_sample.map((recipient, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{recipient.name}</p>
                    <p className="text-sm text-slate-500">{recipient.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-200 rounded-full text-slate-600">
                    {recipient.type}
                  </span>
                </div>
              ))}
              {previewData.total_recipients > previewData.recipients_sample.length && (
                <p className="text-center text-sm text-slate-500 pt-2">
                  + {previewData.total_recipients - previewData.recipients_sample.length} more recipients
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
    </Modal>
  )
}

// Job Progress Modal Component
interface JobProgressModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: number | null
}

function JobProgressModal({ isOpen, onClose, jobId }: JobProgressModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Message Sent"
      size="md"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Job Started Successfully</h3>
        <p className="text-slate-500 mb-4">
          Your bulk message has been queued as Job #{jobId}. You can monitor its progress in the Active Jobs section.
        </p>
      </div>
    </Modal>
  )
}
