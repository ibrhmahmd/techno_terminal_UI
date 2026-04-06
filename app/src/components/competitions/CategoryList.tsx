import { useState } from 'react'
import type { CompetitionCategory } from '../../api/competitions'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface CategoryListProps {
  categories: CompetitionCategory[]
  competitionId: string
  onAddCategory: () => void
  onDeleteCategory: (categoryId: string) => Promise<void>
  onRegisterTeam: (categoryId: string) => void
  onViewTeams: (categoryId: string, categoryName: string) => void
  canManage: boolean
}

export function CategoryList({
  categories,
  onAddCategory,
  onDeleteCategory,
  onRegisterTeam,
  onViewTeams,
  canManage,
}: CategoryListProps) {
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (categoryId: string) => {
    setIsDeleting(true)
    try {
      await onDeleteCategory(categoryId)
    } finally {
      setIsDeleting(false)
      setDeletingCategory(null)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">category</span>
        <p className="text-slate-500 mb-4">No categories created yet</p>
        {canManage && (
          <button
            onClick={onAddCategory}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors mx-auto"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Category
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Competition Categories ({categories.length})
        </h3>
        {canManage && (
          <button
            onClick={onAddCategory}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-on-surface">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-slate-500 mt-1">{category.description}</p>
                )}
              </div>
              {canManage && (
                <button
                  onClick={() => setDeletingCategory(category.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete category"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
              {category.min_age && category.max_age && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                  <span>Ages {category.min_age}-{category.max_age}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">group</span>
                <span>Max {category.max_team_size} per team</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">emoji_events</span>
                <span>{category.registered_teams} teams</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onViewTeams(category.id, category.name)}
                className="flex-1 px-3 py-2 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
              >
                View Teams
              </button>
              <button
                onClick={() => onRegisterTeam(category.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Register Team
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Delete Category"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingCategory(null)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deletingCategory && handleDelete(deletingCategory)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting && <LoadingSpinner size="sm" />}
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
