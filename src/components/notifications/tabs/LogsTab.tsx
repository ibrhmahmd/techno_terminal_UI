import { useState } from 'react'
import { useNotificationLogs, useRetryFailed } from '../../../hooks/notifications'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { Modal } from '../../common/Modal'
import { DataTableContainer } from '../../common/DataTableContainer'
import { Pagination } from '../../common/Pagination'
import { useDebounce } from '../../../hooks/useDebounce'
import { formatDate, formatTime } from '../../../utils/formatting'
import type { NotificationLogDTO } from '../../../api/notifications'

export function LogsTab() {
  // Query Filters & Pagination State
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState<string>('')
  const [channel, setChannel] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [recipientType, setRecipientType] = useState<string>('')
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState<NotificationLogDTO | null>(null)

  // Debounce search term to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 350)

  const offset = (page - 1) * pageSize

  // Fetch logs using query hook
  const { data, isLoading, error } = useNotificationLogs({
    status: status || undefined,
    channel: channel || undefined,
    search: debouncedSearch || undefined,
    recipient_type: recipientType || undefined,
    limit: pageSize,
    offset: offset,
  })
  const retryFailed = useRetryFailed()

  const logs = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const isHtmlBody = (body: string) => {
    const trimmed = body.trim().toLowerCase()
    return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.includes('<div') || trimmed.includes('<p')
  }

  const hasActiveFilters = search !== '' || status !== '' || channel !== '' || recipientType !== ''
  const handleResetFilters = () => {
    setSearch('')
    setStatus('')
    setChannel('')
    setRecipientType('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-headline">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by recipient contact or subject..."
            className="w-full bg-transparent border-b border-slate-200 focus:border-secondary outline-none py-2 font-body text-sm placeholder:text-slate-400 transition-colors"
            aria-label="Search notification logs"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-headline">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="w-full bg-transparent border-b border-slate-200 focus:border-secondary outline-none py-2 font-body text-sm text-slate-700 transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-headline">Channel</label>
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value)
              setPage(1)
            }}
            className="w-full bg-transparent border-b border-slate-200 focus:border-secondary outline-none py-2 font-body text-sm text-slate-700 transition-colors cursor-pointer"
          >
            <option value="">All Channels</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-headline">Recipient Type</label>
          <select
            value={recipientType}
            onChange={(e) => {
              setRecipientType(e.target.value)
              setPage(1)
            }}
            className="w-full bg-transparent border-b border-slate-200 focus:border-secondary outline-none py-2 font-body text-sm text-slate-700 transition-colors cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="PARENT">Parent</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADDITIONAL">Additional</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg transition-all flex items-center gap-1.5 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span>
            Reset
          </button>
        )}
      </div>

      {/* Main Logs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-red-50 text-red-700 rounded-[6px] font-body text-sm">
          Failed to load dispatch history logs. Please try again.
        </div>
      ) : (
        <div className="space-y-6" aria-live="polite" aria-label="Notification logs">
          <DataTableContainer>
            <table className="w-full text-left font-body" aria-label="Notification log entries">
              <thead className="bg-slate-50/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Channel</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject / Preview</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block">history</span>
                      No dispatch records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="odd:bg-white even:bg-slate-50/30 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                        <div className="font-medium">{formatDate(log.created_at)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{formatTime(log.created_at)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-lg text-slate-400">
                            {log.channel === 'EMAIL' ? 'mail' : 'chat'}
                          </span>
                          <span className="text-xs font-medium">
                            {log.channel === 'EMAIL' ? 'Email' : 'WhatsApp'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <div className="font-mono text-xs">{log.recipient_contact}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                          {log.recipient_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">
                        {log.subject ? (
                          <span className="font-medium text-slate-800">{log.subject}</span>
                        ) : (
                          <span className="text-slate-400 italic">No Subject (WhatsApp)</span>
                        )}
                        <span className="block text-xs text-slate-400 truncate mt-0.5">
                          {log.body}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium ${
                            log.status === 'SENT'
                              ? 'bg-secondary/15 text-secondary'
                              : log.status === 'FAILED'
                              ? 'bg-red-500/10 text-red-700'
                              : 'bg-amber-500/10 text-amber-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 text-xs font-semibold text-secondary hover:underline"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </DataTableContainer>

          {totalPages > 1 && (
            <div className="pt-4 flex flex-col items-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setPage(1)
                }}
                onPageChange={setPage}
                pageSizeOptions={[10, 20, 50, 100]}
                showTotalInfo={true}
                loading={isLoading}
                totalRecords={total}
              />
            </div>
          )}
        </div>
      )}

      {/* Details View Modal */}
      <Modal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Dispatch Log Details"
      >
        {selectedLog && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Status Alert Banner */}
            <div className={`p-4 rounded-[6px] flex items-center gap-3 ${
              selectedLog.status === 'SENT'
                ? 'bg-secondary/10 text-secondary'
                : selectedLog.status === 'FAILED'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              <span className="material-symbols-outlined">
                {selectedLog.status === 'SENT' ? 'check_circle' : selectedLog.status === 'FAILED' ? 'error' : 'schedule'}
              </span>
              <div>
                <span className="font-headline font-semibold text-sm">
                  Message Dispatch {selectedLog.status === 'SENT' ? 'Successful' : selectedLog.status === 'FAILED' ? 'Failed' : 'Pending'}
                </span>
                <span className="block text-xs opacity-80 mt-0.5">
                  Logged on {formatDate(selectedLog.created_at)} at {formatTime(selectedLog.created_at)}
                </span>
              </div>
            </div>

            {/* Error logs if failed */}
            {selectedLog.status === 'FAILED' && selectedLog.error_message && (
              <div className="p-4 bg-red-50 text-red-700 rounded-[6px] border-l-4 border-red-500 text-sm font-body">
                <div className="font-semibold mb-1">Dispatch Error Details</div>
                <div className="font-mono text-xs break-all bg-red-100/50 p-2 rounded mt-1">
                  {selectedLog.error_message}
                </div>
              </div>
            )}

            {/* Recipient Details & Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-[6px]">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Recipient Details</div>
                <div className="font-mono text-sm font-medium text-slate-800">{selectedLog.recipient_contact}</div>
                <div className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide font-medium">{selectedLog.recipient_type}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Dispatch Channel</div>
                <div className="text-sm font-medium text-slate-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg text-slate-400">
                    {selectedLog.channel === 'EMAIL' ? 'mail' : 'chat'}
                  </span>
                  {selectedLog.channel === 'EMAIL' ? 'Email' : 'WhatsApp'}
                </div>
                {selectedLog.template_id && (
                  <div className="text-xs text-slate-500 mt-0.5">Template Ref: #{selectedLog.template_id}</div>
                )}
              </div>
            </div>

            {/* Rendered Subject */}
            {selectedLog.subject && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-headline">Message Subject</label>
                <div className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">{selectedLog.subject}</div>
              </div>
            )}

            {/* Rendered Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-headline">Message Body</label>
              {isHtmlBody(selectedLog.body) ? (
                <div className="rounded-[6px] overflow-hidden border border-slate-100 bg-white">
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <style>
                            body {
                              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                              font-size: 14px;
                              line-height: 1.5;
                              color: #334155;
                              margin: 16px;
                            }
                          </style>
                        </head>
                        <body>
                          ${selectedLog.body}
                        </body>
                      </html>
                    `}
                    className="w-full h-80 bg-white"
                    title="Rendered Email Notification Content"
                  />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm bg-slate-50 p-4 rounded-[6px] text-slate-700 max-h-80 overflow-y-auto leading-relaxed border border-slate-100">
                  {selectedLog.body}
                </pre>
              )}
            </div>

            {/* Action controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {selectedLog.status === 'FAILED' && (
                <button
                  onClick={() => {
                    retryFailed.mutate(selectedLog.id)
                    setSelectedLog(null)
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-[6px] transition-colors flex items-center gap-1.5"
                  disabled={retryFailed.isPending}
                  aria-label="Retry sending failed notification"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">refresh</span>
                  Retry Dispatch
                </button>
              )}
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-[6px] transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
