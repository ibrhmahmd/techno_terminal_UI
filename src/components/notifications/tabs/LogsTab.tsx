import React, { useState, useMemo } from 'react'
import { useNotificationLogs, useRetryFailed } from '../../../hooks/notifications'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { Modal } from '../../common/Modal'
import { DataTableContainer } from '../../common/DataTableContainer'
import { Pagination } from '../../common/Pagination'
import { useDebounce } from '../../../hooks/useDebounce'
import { formatDate, formatTime } from '../../../utils/formatting'
import type { NotificationLogDTO } from '../../../api/notifications'
import { LogsGroupBySelector, type LogsGroupByField } from './LogsGroupBySelector'
import { LogsFilters } from './LogsFilters'

export function LogsTab() {
  // Query Filters & Pagination State
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [search, setSearch] = useState<string>('')
  const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<string[]>([])
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  const [groupBy, setGroupBy] = useState<LogsGroupByField>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState<NotificationLogDTO | null>(null)

  // Debounce search term to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 350)

  const offset = (page - 1) * pageSize

  // Fetch logs using query hook
  const { data, isLoading, error } = useNotificationLogs({
    status: selectedStatuses[0] || undefined,
    channel: selectedChannels[0] || undefined,
    search: debouncedSearch || undefined,
    recipient_type: selectedRecipientTypes[0] || undefined,
    template_id: selectedTemplateIds[0] ? parseInt(selectedTemplateIds[0], 10) : undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
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

  const hasActiveFilters = search !== '' || selectedStatuses.length > 0 || selectedChannels.length > 0 || selectedRecipientTypes.length > 0 || selectedTemplateIds.length > 0 || startDate !== '' || endDate !== ''

  const activeFilterTags = useMemo(() => {
    const tags: { id: string; label: string; value: string }[] = []
    
    selectedStatuses.forEach(s => tags.push({ id: `status-${s}`, label: 'Status', value: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() }))
    selectedChannels.forEach(c => tags.push({ id: `channel-${c}`, label: 'Channel', value: c.charAt(0).toUpperCase() + c.slice(1).toLowerCase() }))
    selectedRecipientTypes.forEach(r => tags.push({ id: `recipient-${r}`, label: 'Recipient Type', value: r.charAt(0).toUpperCase() + r.slice(1).toLowerCase() }))
    
    selectedTemplateIds.forEach(t => {
      const label = t === '1' ? 'Enrollment (#1)' : t === '2' ? 'Payment (#2)' : t === '3' ? 'Daily Report (#3)' : `Template #${t}`
      tags.push({ id: `template-${t}`, label: 'Template', value: label })
    })

    if (startDate) tags.push({ id: 'startdate', label: 'From Date', value: startDate })
    if (endDate) tags.push({ id: 'enddate', label: 'To Date', value: endDate })

    return tags
  }, [selectedStatuses, selectedChannels, selectedRecipientTypes, selectedTemplateIds, startDate, endDate])

  const handleRemoveFilter = (id: string) => {
    if (id.startsWith('status-')) setSelectedStatuses([])
    if (id.startsWith('channel-')) setSelectedChannels([])
    if (id.startsWith('recipient-')) setSelectedRecipientTypes([])
    if (id.startsWith('template-')) setSelectedTemplateIds([])
    if (id === 'startdate') setStartDate('')
    if (id === 'enddate') setEndDate('')
    setPage(1)
  }

  const handleClearAllFilters = () => {
    setSelectedStatuses([])
    setSelectedChannels([])
    setSelectedRecipientTypes([])
    setSelectedTemplateIds([])
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="material-symbols-outlined text-[14px] opacity-30 ml-1 inline-block align-middle" aria-hidden="true">unfold_more</span>
    return <span className="material-symbols-outlined text-[14px] ml-1 inline-block align-middle text-secondary" aria-hidden="true">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
  }

  // Grouping logic
  const groupedLogs = useMemo(() => {
    if (groupBy === null) return null
    
    return logs.reduce((acc, log) => {
      let key = ''
      if (groupBy === 'date') {
        key = formatDate(log.created_at)
      } else if (groupBy === 'recipient') {
        key = log.recipient_contact
      }
      
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(log)
      return acc
    }, {} as Record<string, typeof logs>)
  }, [logs, groupBy])

  const renderLogRow = (log: NotificationLogDTO) => (
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
          <span className="material-symbols-outlined text-lg text-slate-400" aria-hidden="true">
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
  )

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <LogsGroupBySelector
              value={(isFiltersOpen || hasActiveFilters) && groupBy === null ? 'search' : groupBy}
              onChange={(field) => {
                if (field === 'search') {
                  setIsFiltersOpen(prev => !prev)
                  setGroupBy(null)
                } else {
                  setGroupBy(field as LogsGroupByField)
                  setIsFiltersOpen(false)
                }
                setPage(1)
              }}
              rightSlot={
                <div className="relative flex items-center w-64 h-full py-1">
                  <span className="material-symbols-outlined absolute left-2 text-[18px] text-slate-400">search</span>
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="w-full pl-8 pr-3 h-full bg-white border-none rounded-[6px] text-sm focus:outline-none focus:ring-0 font-body text-slate-700"
                  />
                </div>
              }
            />
          </div>
        </div>
        
        <LogsFilters 
          isOpen={isFiltersOpen && groupBy === null}
          onClose={() => setIsFiltersOpen(false)}
          onApply={() => setPage(1)}
          filters={{
            selectedStatuses, setSelectedStatuses,
            selectedChannels, setSelectedChannels,
            selectedRecipientTypes, setSelectedRecipientTypes,
            selectedTemplateIds, setSelectedTemplateIds,
            startDate, setStartDate,
            endDate, setEndDate,
          }}
          activeFilterTags={activeFilterTags}
          onRemoveFilter={handleRemoveFilter}
          onClearAllFilters={handleClearAllFilters}
        />
      </div>

      {/* Main Logs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-red-50 text-red-700 rounded-[6px] font-body text-sm" role="alert">
          <p>Failed to load dispatch history logs. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-[6px] hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6" aria-live="polite" aria-label="Notification logs">
          <DataTableContainer>
            <table className="w-full text-left font-body" aria-label="Notification log entries">
              <thead className="bg-slate-50/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('created_at')}>
                    Date & Time <SortIcon field="created_at" />
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Channel</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('recipient_contact')}>
                    Recipient <SortIcon field="recipient_contact" />
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject / Preview</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                    Status <SortIcon field="status" />
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block" aria-hidden="true">history</span>
                      No dispatch records match your search criteria.
                    </td>
                  </tr>
                ) : groupedLogs ? (
                  Object.entries(groupedLogs).map(([groupKey, groupLogs]) => (
                    <React.Fragment key={groupKey}>
                      <tr className="bg-slate-100 border-y border-slate-200 shadow-sm sticky top-0 z-10">
                        <td colSpan={6} className="px-4 py-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-500" aria-hidden="true">
                              {groupBy === 'recipient' ? 'person' : 'calendar_today'}
                            </span>
                            {groupBy === 'recipient' ? 'Recipient: ' : 'Date: '}
                            <span className="text-secondary">{groupKey}</span>
                            <span className="ml-auto text-slate-500 normal-case font-medium text-[11px] bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                              {groupLogs.length} item{groupLogs.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {groupLogs.map(renderLogRow)}
                    </React.Fragment>
                  ))
                ) : (
                  logs.map(renderLogRow)
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
              <span className="material-symbols-outlined" aria-hidden="true">
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
