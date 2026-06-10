import { useState } from 'react'
import { FilterPill, ActiveFilterTagsList } from '../../common'

interface LogsFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply?: () => void
  filters: {
    selectedStatuses: string[]
    setSelectedStatuses: (statuses: string[]) => void
    selectedChannels: string[]
    setSelectedChannels: (channels: string[]) => void
    selectedRecipientTypes: string[]
    setSelectedRecipientTypes: (types: string[]) => void
    selectedTemplateIds: string[]
    setSelectedTemplateIds: (ids: string[]) => void
    startDate: string
    setStartDate: (date: string) => void
    endDate: string
    setEndDate: (date: string) => void
  }
  activeFilterTags?: { id: string; label: string; value: string }[]
  onRemoveFilter?: (id: string) => void
  onClearAllFilters?: () => void
}

const FILTER_CATEGORIES = [
  { id: 'status',    label: 'Status',         icon: 'toggle_on'      },
  { id: 'channel',   label: 'Channel',        icon: 'chat'           },
  { id: 'recipient', label: 'Recipient Type', icon: 'group'          },
  { id: 'template',  label: 'Template',       icon: 'description'    },
  { id: 'date',      label: 'Date Range',     icon: 'date_range'     },
] as const

const STATUSES = ['SENT', 'PENDING', 'FAILED']
const CHANNELS = ['EMAIL', 'WHATSAPP']
const RECIPIENT_TYPES = ['PARENT', 'EMPLOYEE', 'ADDITIONAL']
const TEMPLATES = [
  { id: '1', label: 'Enrollment Created (#1)' },
  { id: '2', label: 'Payment Received (#2)' },
  { id: '3', label: 'Daily Report (#3)' },
]

function OptionPill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap text-center focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:outline-none ${
        selected
          ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
          : 'text-slate-600 hover:text-secondary hover:bg-white/70'
      }`}
    >
      {children}
    </button>
  )
}

export function LogsFilters({ isOpen, onClose, onApply, filters, activeFilterTags, onRemoveFilter, onClearAllFilters }: LogsFiltersProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const getFilterCount = (categoryId: string): number => {
    switch (categoryId) {
      case 'status': return filters.selectedStatuses.length
      case 'channel': return filters.selectedChannels.length
      case 'recipient': return filters.selectedRecipientTypes.length
      case 'template': return filters.selectedTemplateIds.length
      case 'date': return (filters.startDate ? 1 : 0) + (filters.endDate ? 1 : 0)
      default: return 0
    }
  }

  const handleApply = () => {
    onApply?.()
    onClose()
  }

  const handleReset = () => {
    filters.setSelectedStatuses([])
    filters.setSelectedChannels([])
    filters.setSelectedRecipientTypes([])
    filters.setSelectedTemplateIds([])
    filters.setStartDate('')
    filters.setEndDate('')
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-blue-100 px-4 sm:px-6 lg:px-8 py-3 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Logs</h3>
        <button
          onClick={onClose}
          aria-label="Close filters"
          className="text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1 mb-3">
        {FILTER_CATEGORIES.map(cat => (
          <FilterPill
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            isExpanded={expandedCategory === cat.id}
            hasFilters={getFilterCount(cat.id) > 0}
            filterCount={getFilterCount(cat.id)}
            onClick={() => toggleCategory(cat.id)}
            className="flex-1 px-4 py-2 rounded-md"
          />
        ))}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-blue-200 rounded-md hover:bg-blue-50 hover:text-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:outline-none"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 text-xs font-medium text-white bg-secondary rounded-md hover:bg-secondary/90 transition-all focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            Apply
          </button>
        </div>
      </div>

      {expandedCategory && (
        <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3">
          {expandedCategory === 'status' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">Status</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {STATUSES.map(status => (
                  <OptionPill
                    key={status}
                    selected={filters.selectedStatuses.includes(status)}
                    onClick={() => {
                      const newIds = filters.selectedStatuses.includes(status)
                        ? []
                        : [status]
                      filters.setSelectedStatuses(newIds)
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                  </OptionPill>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'channel' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">Channel</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {CHANNELS.map(channel => (
                  <OptionPill
                    key={channel}
                    selected={filters.selectedChannels.includes(channel)}
                    onClick={() => {
                      const newIds = filters.selectedChannels.includes(channel)
                        ? []
                        : [channel]
                      filters.setSelectedChannels(newIds)
                    }}
                  >
                    {channel.charAt(0).toUpperCase() + channel.slice(1).toLowerCase()}
                  </OptionPill>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'recipient' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">Recipient Type</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {RECIPIENT_TYPES.map(type => (
                  <OptionPill
                    key={type}
                    selected={filters.selectedRecipientTypes.includes(type)}
                    onClick={() => {
                      const newIds = filters.selectedRecipientTypes.includes(type)
                        ? []
                        : [type]
                      filters.setSelectedRecipientTypes(newIds)
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                  </OptionPill>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'template' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">Template</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {TEMPLATES.map(template => (
                  <OptionPill
                    key={template.id}
                    selected={filters.selectedTemplateIds.includes(template.id)}
                    onClick={() => {
                      const newIds = filters.selectedTemplateIds.includes(template.id)
                        ? []
                        : [template.id]
                      filters.setSelectedTemplateIds(newIds)
                    }}
                  >
                    {template.label}
                  </OptionPill>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'date' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">Date Range</span>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="w-full max-w-xs">
                  <label htmlFor="start-date" className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
                  <input
                    id="start-date"
                    type="date"
                    value={filters.startDate}
                    onChange={e => filters.setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none px-3 py-2 font-body text-sm text-slate-700 transition-colors"
                  />
                </div>
                <div className="w-full max-w-xs">
                  <label htmlFor="end-date" className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                  <input
                    id="end-date"
                    type="date"
                    value={filters.endDate}
                    onChange={e => filters.setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none px-3 py-2 font-body text-sm text-slate-700 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeFilterTags && activeFilterTags.length > 0 && onRemoveFilter && onClearAllFilters && (
        <div className="mb-1">
          <ActiveFilterTagsList
            filters={activeFilterTags}
            onRemoveFilter={onRemoveFilter}
            onClearAll={onClearAllFilters}
          />
        </div>
      )}
    </div>
  )
}
