import { useState, useEffect } from 'react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  minLength?: number
  debounceMs?: number
  className?: string
}

export function SearchBar({ 
  placeholder = 'Search...', 
  onSearch, 
  minLength = 2,
  debounceMs = 300,
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (query.length > 0 && query.length < minLength) return
    
    const timeout = setTimeout(() => {
      onSearch(query)
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [query, onSearch, minLength, debounceMs])

  return (
    <div className={`flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 ${className}`}>
      <span className="material-symbols-outlined text-slate-500" aria-hidden="true">search</span>
      <input
        type="text"
        placeholder={placeholder}
        aria-label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-transparent border-none outline-none text-sm text-on-surface flex-1 focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-lg"
      />
      {query && (
        <button
          aria-label="Clear search"
          onClick={() => {
            setQuery('')
            onSearch('')
          }}
          className="text-slate-400 hover:text-slate-600"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
  )
}
