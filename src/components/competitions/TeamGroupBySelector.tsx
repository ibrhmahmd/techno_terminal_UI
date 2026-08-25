import type { TeamGroupByField } from '../../api/teams/types'

const VALID_GROUP_BY_VALUES: readonly TeamGroupByField[] = ['instructor', 'category', 'subcategory', 'payment_status', 'placement', 'alphabetical']

function isValidGroupByField(value: string): value is TeamGroupByField {
  return (VALID_GROUP_BY_VALUES as readonly string[]).includes(value)
}

interface TeamGroupBySelectorProps {
  groupBy: TeamGroupByField | null
  onGroupByChange: (field: TeamGroupByField | null) => void
  subgroupBy: TeamGroupByField | null
  onSubgroupByChange: (field: TeamGroupByField | null) => void
}

const GROUP_OPTIONS: Array<{ value: TeamGroupByField | null; label: string; icon: string }> = [
  { value: null, label: 'All', icon: 'grid_view' },
  { value: 'category', label: 'Category', icon: 'category' },
  { value: 'subcategory', label: 'Subcategory', icon: 'layers' },
  { value: 'instructor', label: 'Instructor', icon: 'person' },
  { value: 'payment_status', label: 'Payment', icon: 'payments' },
  { value: 'placement', label: 'Placement', icon: 'emoji_events' },
  { value: 'alphabetical', label: 'A–Z', icon: 'sort_by_alpha' },
]

const SUBGROUP_OPTIONS: Array<{ value: TeamGroupByField; label: string }> = [
  { value: 'category', label: 'Category' },
  { value: 'subcategory', label: 'Subcategory' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'payment_status', label: 'Payment' },
  { value: 'placement', label: 'Placement' },
]

export function TeamGroupBySelector({
  groupBy,
  onGroupByChange,
  subgroupBy,
  onSubgroupByChange,
}: TeamGroupBySelectorProps) {
  const availableSubgroups = SUBGROUP_OPTIONS.filter(o => o.value !== groupBy)

  return (
    <section>
      <div
        className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto"
        role="tablist"
        aria-label="Group teams by"
      >
        {GROUP_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            role="tab"
            aria-selected={groupBy === opt.value}
            onClick={() => onGroupByChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
              groupBy === opt.value
                ? 'bg-white text-secondary shadow-sm font-bold'
                : 'text-slate-500 hover:text-secondary hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
        <div className="ms-auto flex items-center gap-2 ps-2 border-l border-slate-300">
          <span className="text-xs text-slate-500">Sub-group:</span>
          <select
            value={subgroupBy ?? ''}
            onChange={(e) => {
              const val = e.target.value
              onSubgroupByChange(val && isValidGroupByField(val) ? val : null)
            }}
            className="text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            aria-label="Sub-group by"
          >
            <option value="">None</option>
            {availableSubgroups.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
