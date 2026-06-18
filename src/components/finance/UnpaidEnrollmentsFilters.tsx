import { useState } from 'react'
import { GroupCombobox } from '../groups/GroupCombobox'
import type { EnrichedGroupPublic } from '../../api/academics'

interface UnpaidEnrollmentsFiltersProps {
  selectedGroup: EnrichedGroupPublic | null
  minBalance: number | ''
  ageFilter: 'all' | 'lt30' | '30to60' | 'gt60'
  // groups and isLoadingGroups removed — GroupCombobox owns its own data fetching
  onGroupChange: (group: EnrichedGroupPublic | null) => void
  onMinBalanceChange: (value: number | '') => void
  onAgeFilterChange: (value: 'all' | 'lt30' | '30to60' | 'gt60') => void
}

const AGE_FILTER_OPTIONS = [
  { value: 'all' as const, label: 'All time' },
  { value: 'lt30' as const, label: '< 30 days' },
  { value: '30to60' as const, label: '30-60 days' },
  { value: 'gt60' as const, label: '60+ days' },
]

export function UnpaidEnrollmentsFilters({
  selectedGroup,
  minBalance,
  ageFilter,
  onGroupChange,
  onMinBalanceChange,
  onAgeFilterChange,
}: UnpaidEnrollmentsFiltersProps) {
  const [groupSearch, setGroupSearch] = useState('')

  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
      <div className="flex flex-wrap items-center gap-3">
        {/* Group Filter - Using ComboBox */}
        <div className="flex items-center gap-2 flex-1 min-w-[300px] max-w-[400px]">
          <span className="text-sm font-medium text-slate-600 shrink-0">Group:</span>
          <div className="flex-1">
            <GroupCombobox
              value={selectedGroup}
              onChange={onGroupChange}
              search={groupSearch}
              setSearch={setGroupSearch}
            />
          </div>
        </div>

        {/* Minimum Balance Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="min-balance" className="text-sm font-medium text-slate-600">Min balance:</label>
          <div className="relative">
            <input
              id="min-balance"
              type="number"
              min={0}
              placeholder="0"
              value={minBalance}
              onChange={(e) => onMinBalanceChange(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-24 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-center"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">EGP</span>
          </div>
        </div>

        {/* Age Filter */}
        <div className="flex items-center gap-2">
          <span id="age-filter-label" className="text-sm font-medium text-slate-600">Unpaid for:</span>
          <div className="flex bg-white rounded-lg border border-slate-200 p-0.5" role="radiogroup" aria-labelledby="age-filter-label">
            {AGE_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                role="radio"
                aria-checked={ageFilter === option.value}
                onClick={() => onAgeFilterChange(option.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  ageFilter === option.value
                    ? 'bg-secondary text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
