// No React hooks needed
import { Search, CheckCircle2, Plus } from 'lucide-react'
import { Modal } from '../Modal'
import { LoadingSpinner } from '../LoadingSpinner'

interface Entity {
  id: number | string
  title: string
  subtitle?: string
  meta?: string
  isDisabled?: boolean
  disabledReason?: string
}

interface Category {
  id: string
  title: string
  entityIds: (number | string)[]
}

interface EntitySelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  entities: Entity[]
  selectedId: number | string | null
  onSelect: (id: number | string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isSearching?: boolean
  categories?: Category[]
  onSubmit: () => void
  isSubmitting?: boolean
  submitLabel?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

export function EntitySelectionDialog({
  isOpen,
  onClose,
  title,
  entities,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  isSearching,
  categories,
  onSubmit,
  isSubmitting,
  submitLabel = 'Select',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found',
}: EntitySelectionDialogProps) {
  const handleClose = () => {
    onSearchChange('')
    onClose()
  }

  const handleSubmit = () => {
    onSubmit()
    onSearchChange('')
  }

  const renderEntityList = (entityList: Entity[]) => (
    <div className="space-y-2">
      {entityList.map((entity) => (
        <button
          key={entity.id}
          onClick={() => !entity.isDisabled && onSelect(entity.id)}
          disabled={entity.isDisabled}
          className={`w-full p-4 text-left border rounded-lg transition-colors ${
            selectedId === entity.id
              ? 'border-secondary bg-secondary/5'
              : entity.isDisabled
              ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-on-surface truncate">{entity.title}</p>
              {entity.subtitle && (
                <p className="text-sm text-slate-500 truncate">{entity.subtitle}</p>
              )}
              {entity.isDisabled && entity.disabledReason && (
                <p className="text-xs text-red-500 mt-1">{entity.disabledReason}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              {entity.meta && (
                <span className="text-xs text-slate-400">{entity.meta}</span>
              )}
              {selectedId === entity.id && (
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <button
        onClick={handleClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={!selectedId || isSubmitting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            Processing...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            {submitLabel}
          </>
        )}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
          />
        </div>

        {/* Loading State */}
        {isSearching ? (
          <div className="py-8 text-center">
            <LoadingSpinner size="md" />
            <p className="text-sm text-slate-500 mt-2">Searching...</p>
          </div>
        ) : entities.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">{emptyMessage}</p>
          </div>
        ) : categories && categories.length > 0 ? (
          /* Categorized View */
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {categories.map((category) => {
              const categoryEntities = entities.filter((e) =>
                category.entityIds.includes(e.id)
              )
              if (categoryEntities.length === 0) return null
              
              return (
                <div key={category.id}>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                    {category.title}
                  </h4>
                  {renderEntityList(categoryEntities)}
                </div>
              )
            })}
          </div>
        ) : (
          /* Flat List */
          <div className="max-h-60 overflow-y-auto">
            {renderEntityList(entities)}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default EntitySelectionDialog
