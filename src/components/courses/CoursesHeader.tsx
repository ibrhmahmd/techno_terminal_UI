import { useTranslation } from 'react-i18next'

interface CoursesHeaderProps {
  totalCourses: number
  searchTerm: string
  onSearchChange: (value: string) => void
  onCreateClick: () => void
}

export function CoursesHeader({ totalCourses, searchTerm, onSearchChange, onCreateClick }: CoursesHeaderProps) {
  const { t } = useTranslation('courses')
  return (
    <div className="px-4 md:px-8 py-6 bg-surface border-b border-slate-200">
      <div className="max-w-[1680px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl font-bold text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">school</span>
              {t('coursesHeader.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('coursesHeader.available', { count: totalCourses })}
            </p>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder={t('coursesHeader.search_placeholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              {t('coursesHeader.create_course')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
