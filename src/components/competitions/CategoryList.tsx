import { useState } from 'react'
import type { CompetitionCategory } from '../../api/competitions'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface CategoryListProps {
  categories: CompetitionCategory[]
  onViewTeams: (categoryId: string, categoryName: string) => void
  onRegisterTeam: (categoryId: string) => void
  // NOTE: Categories are auto-generated from team registrations
  // Backend only supports GET /competitions/{id}/categories
  // No add/delete functionality available
}

export function CategoryList({
  categories,
  onViewTeams,
  onRegisterTeam,
}: CategoryListProps) {
  // Categories are read-only - auto-generated from team registrations

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">category</span>
        <p className="text-slate-500 mb-4">No categories created yet</p>
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

      {/* Info Banner */}
      {categories.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">info</span>
            Categories are automatically generated from team registrations
          </p>
        </div>
      )}

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

    </div>
  )
}
