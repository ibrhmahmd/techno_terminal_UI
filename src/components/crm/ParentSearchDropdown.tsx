import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, User, Phone, Mail } from 'lucide-react'
import type { Parent } from '../../api/crm'

interface ParentSearchDropdownProps {
  onSelect: (parent: Parent | null) => void
  selectedParent: Parent | null
  onSearchParents: (query: string) => Promise<Parent[]>
  placeholder?: string
  label?: string
  helperText?: string
}

export function ParentSearchDropdown({
  onSelect,
  selectedParent,
  onSearchParents,
  placeholder = 'Search parents by name or phone...',
  label = 'Search Parent (Optional)',
  helperText = 'Search and select a parent to link with this student'
}: ParentSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Parent[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true)
        try {
          const parents = await onSearchParents(searchQuery)
          setResults(parents)
          setIsOpen(true)
        } catch (error) {
          console.error('Error searching parents:', error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, onSearchParents])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((parent: Parent) => {
    onSelect(parent)
    setSearchQuery('')
    setIsOpen(false)
    setResults([])
  }, [onSelect])

  const handleClear = useCallback(() => {
    onSelect(null)
    setSearchQuery('')
    setIsOpen(false)
  }, [onSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      
      {selectedParent ? (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{selectedParent.full_name}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {selectedParent.phone_primary && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedParent.phone_primary}
                  </span>
                )}
                {selectedParent.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {selectedParent.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remove parent"
            aria-label="Remove selected parent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.trim().length >= 2 && setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-controls={isOpen ? 'parent-search-results' : undefined}
              aria-activedescendant={results.length > 0 ? `parent-option-${results[0].id}` : undefined}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-slate-200 border-t-secondary rounded-full animate-spin" />
              </div>
            )}
          </div>

          {isOpen && (
            <div
              id="parent-search-results"
              className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
            >
              {results.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p className="text-sm">No parents found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                <ul className="py-1">
                  {results.map((parent, index) => (
                    <li
                      key={parent.id}
                      id={`parent-option-${parent.id}`}
                      role="option"
                      aria-selected={!!((selectedParent as any)?.id === parent.id)}
                      onClick={() => handleSelect(parent)}
                      className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        index === results.length - 1 ? '' : 'border-b border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{parent.full_name}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            {parent.phone_primary && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {parent.phone_primary}
                              </span>
                            )}
                            {parent.email && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3" />
                                {parent.email}
                              </span>
                            )}
                            {parent.relation && (
                              <span className="text-slate-400">{parent.relation}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        </div>
      )}
    </div>
  )
}

export default ParentSearchDropdown
