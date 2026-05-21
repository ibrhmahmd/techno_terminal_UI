interface TeamCategoryFilterProps {
  categories: string[]
  value: string | null
  onChange: (category: string | null) => void
}

export function TeamCategoryFilter({ categories, value, onChange }: TeamCategoryFilterProps) {
  if (categories.length === 0) return null

  const uniqueCategories = [...new Set(categories)]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Category:</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary/30"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {uniqueCategories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  )
}
