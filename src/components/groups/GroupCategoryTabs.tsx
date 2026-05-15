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

  return (
    <div className="overflow-x-auto mb-4">
      <div className="flex min-w-max gap-1 rounded-lg bg-slate-800 p-1">
        {categories.map((cat) => {
          const isActive = cat.key === activeKey
          return (
            <button
              key={cat.key}
              onClick={() => onChange(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-secondary/10 text-secondary'
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
