interface Category {
  key: string
  label: string
  count: number
}

interface GroupCategoryTabsProps {
  categories: Category[]
  activeKey: string
  onChange: (key: string) => void
}

export function GroupCategoryTabs({ categories, activeKey, onChange }: GroupCategoryTabsProps) {
  if (categories.length === 0) return null

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % categories.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + categories.length) % categories.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = categories.length - 1
    else return
    e.preventDefault()
    onChange(categories[next].key)
  }

  return (
    <div id="group-category-tablist" className="overflow-x-auto mb-4" role="tablist" aria-label="Group categories">
      <div className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-1.5">
        {categories.map((cat, index) => {
          const isActive = cat.key === activeKey
          return (
            <button
              key={cat.key}
              id={`tab-${cat.key}`}
              onClick={() => onChange(cat.key)}
              onKeyDown={handleKeyDown(index)}
              role="tab"
              aria-selected={cat.key === activeKey}
              aria-controls={`panel-${cat.key}`}
              className={`flex-1 flex justify-center items-center gap-2.5 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
                isActive
                  ? 'bg-secondary text-white font-bold shadow-lg shadow-secondary/20'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="font-headline">{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
