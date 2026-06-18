import React, { useState, useRef, useEffect, type ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

export interface SpyCategory<T> {
  id: string
  title: string
  icon?: ReactNode
  items: T[]
  isSpecial?: boolean // If true, this category won't appear in the left-pane sticky navigation
}

interface SpyComboboxProps<T> {
  search: string
  onSearchChange: (val: string) => void
  placeholder?: string
  isLoading?: boolean
  noResultsText?: string

  // Grouping Options
  modes?: readonly string[]
  activeMode?: string
  onModeChange?: (mode: string) => void

  // Data Array
  categories: SpyCategory<T>[]
  totalItemsCount: number

  // Renderers
  renderItem: (item: T, isHighlighted: boolean, index: number) => ReactNode
  renderCategoryHeader?: (category: SpyCategory<T>) => ReactNode
  
  // Interactions
  onSelect: (item: T) => void
}

export function SpyCombobox<T>({
  search,
  onSearchChange,
  placeholder = 'Search...',
  isLoading = false,
  noResultsText = 'No items found.',
  modes,
  activeMode,
  onModeChange,
  categories,
  totalItemsCount,
  renderItem,
  renderCategoryHeader,
  onSelect
}: SpyComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [activeCategoryId, setActiveCategoryId] = useState<string>('')
  const [visibleLimit, setVisibleLimit] = useState(40)
  const [inputValue, setInputValue] = useState(search)
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const lastScrollCheckRef = useRef<number>(0)

  // Extract navigation categories (non-special ones)
  const navCategories = categories.filter(c => !c.isSpecial && c.items.length > 0)

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync internal state with external search prop when it changes
  useEffect(() => {
    setInputValue(search)
  }, [search])

  // Debounce input value changes to trigger onSearchChange
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== search) {
        onSearchChange(inputValue)
      }
    }, 250)

    return () => clearTimeout(handler)
  }, [inputValue, search, onSearchChange])

  // Reset states on input change
  useEffect(() => {
    setHighlightedIndex(-1)
    setVisibleLimit(40)
    if (inputValue.trim().length > 0) {
      setIsOpen(true)
    }
  }, [inputValue])

  useEffect(() => {
    setActiveCategoryId('')
    setVisibleLimit(40)
  }, [activeMode])

  useEffect(() => {
    if (!isOpen) {
      setVisibleLimit(40)
    }
  }, [isOpen])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    
    // 1. Progressive Rendering: Scroll near bottom trigger
    const threshold = 100 // px from bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    if (isNearBottom && visibleLimit < totalItemsCount) {
      setVisibleLimit(prev => Math.min(totalItemsCount, prev + 40))
    }

    // 2. Throttled Scrollspy Logic (limit check to once every 100ms)
    const now = Date.now()
    if (now - lastScrollCheckRef.current < 100) return
    lastScrollCheckRef.current = now

    const headers = container.querySelectorAll('.spy-category-header')
    let currentActive = activeCategoryId
    
    headers.forEach(header => {
      const parentRect = container.getBoundingClientRect()
      const rect = header.getBoundingClientRect()
      // If the top of the header is very close to or above the container's top boundary
      if (rect.top <= parentRect.top + 30) {
        currentActive = header.getAttribute('data-category-id') || currentActive
      }
    })

    if (currentActive && currentActive !== activeCategoryId) {
      setActiveCategoryId(currentActive)
    }
  }

  const scrollToCategory = (categoryId: string) => {
    if (!listRef.current) return
    const target = listRef.current.querySelector(`[data-category-id="${categoryId}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveCategoryId(categoryId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key === 'ArrowDown') {
      setIsOpen(true)
      return
    }
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => prev < totalItemsCount - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < totalItemsCount) {
          // Resolve highlighted flat index to nested item
          let relativeIndex = highlightedIndex
          for (const cat of categories) {
            if (relativeIndex < cat.items.length) {
              onSelect(cat.items[relativeIndex])
              setIsOpen(false)
              return
            }
            relativeIndex -= cat.items.length
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  // Auto scroll highlighted item container scroll position directly (avoids window layout shifts)
  useEffect(() => {
    if (highlightedIndex >= 0) {
      if (highlightedIndex >= visibleLimit) {
        setVisibleLimit(prev => Math.min(totalItemsCount, Math.max(prev + 40, highlightedIndex + 1)))
      }
      
      if (listRef.current) {
        const element = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`) as HTMLElement
        if (element) {
          const container = listRef.current
          const elemTop = element.offsetTop
          const elemBottom = elemTop + element.offsetHeight
          const containerTop = container.scrollTop
          const containerBottom = containerTop + container.clientHeight
          
          if (elemTop < containerTop) {
            container.scrollTop = elemTop
          } else if (elemBottom > containerBottom) {
            container.scrollTop = elemBottom - container.clientHeight
          }
        }
      }
    }
  }, [highlightedIndex, visibleLimit, totalItemsCount])

  let globalIndexCounter = 0

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input */}
      <div className={`flex items-center gap-2 px-4 py-2 bg-slate-100 border transition-colors ${isOpen ? 'rounded-t-lg rounded-b-none border-b-transparent border-slate-200' : 'rounded-lg border-slate-200'}`}>
        <span className="material-symbols-outlined text-slate-500">search</span>
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-sm text-on-surface flex-1"
        />
        {isLoading && <LoadingSpinner size="sm" />}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-0 sm:min-w-[400px] max-w-[100vw] left-0 sm:left-auto bg-white border border-t-0 border-slate-200 rounded-b-lg shadow-2xl overflow-hidden mt-1">
          
          {/* Dynamic Grouping Toolbar */}
          {modes && modes.length > 0 && onModeChange && (
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Categorize By</span>
              <div className="flex bg-slate-200/60 p-1 rounded-md gap-1">
                {modes.map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onModeChange(mode)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded capitalize transition-all ${
                      activeMode === mode 
                        ? 'bg-white text-secondary shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {totalItemsCount > 0 ? (
            <div className="flex w-full h-full">
              
              {/* Left Sidebar: Categories */}
              {navCategories.length > 0 && (
                <div className="hidden sm:block w-auto min-w-[max-content] md:max-w-[40%] flex-shrink-0 bg-slate-50/50 border-r border-slate-100 overflow-y-auto no-scrollbar py-2">
                  {navCategories.map(cat => (
                    <div 
                      key={`nav-${cat.id}`}
                      onClick={() => scrollToCategory(cat.id)}
                      className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors border-l-2 ${
                        (activeCategoryId === cat.id || (!activeCategoryId && navCategories[0].id === cat.id))
                          ? 'border-secondary bg-secondary/5 text-secondary'
                          : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {cat.title}
                    </div>
                  ))}
                </div>
              )}

              {/* Right Pane: Main List */}
              <div ref={listRef} className="flex-1 overflow-y-auto outline-none relative no-scrollbar" onScroll={handleScroll}>
                {categories.map(cat => {
                  if (cat.items.length === 0) return null

                  const categoryStartIndex = globalIndexCounter
                  if (categoryStartIndex >= visibleLimit) {
                    globalIndexCounter += cat.items.length
                    return null
                  }

                  return (
                    <div key={cat.id}>
                      {/* Header */}
                      {renderCategoryHeader ? (
                        <div className="spy-category-header" data-category-id={cat.id}>
                          {renderCategoryHeader(cat)}
                        </div>
                      ) : (
                        <div 
                          data-category-id={cat.id}
                          className="spy-category-header sticky top-0 z-10 px-4 py-1.5 bg-white/95 backdrop-blur-sm border-b border-slate-100 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm"
                        >
                          {cat.icon && <span className="material-symbols-outlined text-[14px] text-secondary/70">{cat.icon}</span>}
                          {cat.title}
                        </div>
                      )}
                      
                      {/* Items */}
                      {cat.items.map(item => {
                        const currentIndex = globalIndexCounter++
                        const isHighlighted = highlightedIndex === currentIndex
                        
                        if (currentIndex >= visibleLimit) return null

                        return (
                          <div 
                            key={`item-${currentIndex}`} 
                            data-index={currentIndex}
                            onClick={() => {
                              onSelect(item)
                              setIsOpen(false)
                            }}
                            onMouseEnter={() => setHighlightedIndex(currentIndex)}
                          >
                            {renderItem(item, isHighlighted, currentIndex)}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-400">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <span>{noResultsText}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
