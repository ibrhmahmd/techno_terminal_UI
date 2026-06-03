import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export interface SelectorOption {
  id: number | string
  label: string
  subLabel?: string
}

interface SearchablePillSelectorProps {
  options: SelectorOption[]
  value: number | string | null
  onChange: (value: number | string | null) => void
  placeholder?: string
  disabled?: boolean
}

export function SearchablePillSelector({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false
}: SearchablePillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedOption = options.find(o => o.id === value)

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    (o.subLabel && o.subLabel.toLowerCase().includes(search.toLowerCase()))
  )

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset highlight index when search changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key === 'ArrowDown') {
      setIsOpen(true)
      return
    }
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => prev < filteredOptions.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightedIndex].id)
          setIsOpen(false)
          setSearch('')
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  // Auto scroll highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const element = listRef.current.children[highlightedIndex] as HTMLElement
      if (element) {
        element.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  if (selectedOption) {
    return (
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{selectedOption.label}</span>
            {selectedOption.subLabel && (
              <span className="text-[10px] leading-tight opacity-80">{selectedOption.subLabel}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setIsOpen(true)
              setTimeout(() => wrapperRef.current?.querySelector('input')?.focus(), 0)
            }}
            className="p-0.5 hover:bg-secondary/20 rounded-full transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`flex items-center gap-2 px-3 py-2 bg-surface border transition-colors ${isOpen ? 'rounded-t-lg border-secondary ring-1 ring-secondary/20' : 'rounded-lg border-surface-container-highest hover:border-slate-400'} ${disabled ? 'opacity-50 pointer-events-none bg-slate-50' : ''}`}>
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="bg-transparent border-none outline-none text-sm text-slate-900 flex-1 placeholder:text-slate-400"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-t-0 border-surface-container-highest rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-0.5">
          {filteredOptions.length > 0 ? (
            <ul ref={listRef} className="py-1">
              {filteredOptions.map((option, index) => (
                <li
                  key={option.id}
                  onClick={() => {
                    onChange(option.id)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3 py-2 cursor-pointer flex flex-col ${
                    highlightedIndex === index ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.subLabel && (
                    <span className="text-xs opacity-70">{option.subLabel}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-slate-500 text-center">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
