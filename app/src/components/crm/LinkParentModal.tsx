import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { 
  searchParents, 
  getStudentParents, 
  linkParentToStudent,
  unlinkParentFromStudent,
  type Parent 
} from '../../api/crm'

interface LinkParentModalProps {
  studentId: number
  isOpen: boolean
  onClose: () => void
  onLinked: () => void
}

export function LinkParentModal({ studentId, isOpen, onClose, onLinked }: LinkParentModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Parent[]>([])
  const [linkedParents, setLinkedParents] = useState<Parent[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load currently linked parents when modal opens
  useEffect(() => {
    if (isOpen && studentId) {
      loadLinkedParents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentId])

  const loadLinkedParents = async () => {
    try {
      const parents = await getStudentParents(studentId)
      setLinkedParents(parents)
    } catch (err) {
      console.error('Failed to load linked parents:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const results = await searchParents(searchQuery)
      // Filter out already linked parents
      const linkedIds = new Set(linkedParents.map(p => p.id))
      const filteredResults = results.filter(p => !linkedIds.has(p.id))
      setSearchResults(filteredResults)
    } catch {
      setError('Failed to search parents')
    } finally {
      setIsSearching(false)
    }
  }

  const handleLinkParent = async (parentId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      await linkParentToStudent(studentId, parentId)
      await loadLinkedParents()
      setSearchResults(prev => prev.filter(p => p.id !== parentId))
      onLinked()
    } catch {
      setError('Failed to link parent')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlinkParent = async (parentId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      await unlinkParentFromStudent(studentId, parentId)
      await loadLinkedParents()
    } catch {
      setError('Failed to unlink parent')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Parent to Student"
      size="lg"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Search Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-on-surface">Search Parents</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-sm">search</span>}
              Search
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-200">
                Search Results ({searchResults.length})
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {searchResults.map((parent) => (
                  <div
                    key={parent.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-on-surface">{parent.full_name}</p>
                      {parent.phone_primary && (
                        <p className="text-sm text-slate-500">{parent.phone_primary}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleLinkParent(parent.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors disabled:opacity-50"
                    >
                      Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <p className="text-sm text-slate-500 text-center py-4">
              No parents found. Try a different search term.
            </p>
          )}
        </div>

        {/* Currently Linked Parents */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-on-surface">Currently Linked Parents</h4>
          {linkedParents.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-slate-100">
                {linkedParents.map((parent) => (
                  <div
                    key={parent.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-on-surface">{parent.full_name}</p>
                      {parent.phone_primary && (
                        <p className="text-sm text-slate-500">{parent.phone_primary}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnlinkParent(parent.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
              No parents currently linked to this student.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
