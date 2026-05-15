import type { CategoryResponse } from '../../api/competitions'

interface CategoryListProps {
  categories: CategoryResponse[]
  onViewTeams: (category: string) => void
  onRegisterTeam: (category: string) => void
}

export function CategoryList({
  categories,
  onViewTeams,
  onRegisterTeam,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">category</span>
        <p className="text-slate-500 mb-4">No categories yet. Categories are generated from team registrations.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Competition Categories ({categories.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.category}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-on-surface">{cat.category}</h4>
              </div>
            </div>

            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {cat.subcategories.map((sub) => (
                  <span key={sub} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                    {sub}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => onViewTeams(cat.category)}
                className="flex-1 px-3 py-2 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
              >
                View Teams
              </button>
              <button
                onClick={() => onRegisterTeam(cat.category)}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Register Team
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
