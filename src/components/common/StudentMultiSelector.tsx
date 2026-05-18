import { useState, useMemo, useCallback, useRef } from 'react'
import { searchStudents } from '../../api/crm/students/search'
import type { StudentListItem } from '../../api/crm/students/types/models'
import { SpyCombobox, type SpyCategory } from '../common/SpyCombobox'

export interface StudentSelection {
  student: StudentListItem
  fee?: number
}

export interface StudentMultiSelectorProps {
  selected: StudentSelection[]
  onChange: (selected: StudentSelection[]) => void
  showFeeInput?: boolean
  defaultFee?: number
  maxSelections?: number
}

export function StudentMultiSelector({
  selected,
  onChange,
  showFeeInput = true,
  defaultFee = 0,
  maxSelections,
}: StudentMultiSelectorProps) {
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const selectedIds = useMemo(() => new Set(selected.map(s => s.student.id)), [selected])

  const doSearch = useCallback((query: string) => {
    setSearch(query)
    if (query.length < 2) {
      setStudents([])
      setIsLoading(false)
      setError(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    searchStudents(query)
      .then(results => {
        if (!controller.signal.aborted) {
          setStudents(results.filter(s => !selectedIds.has(s.id)))
        }
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name !== 'AbortError' && !controller.signal.aborted) {
          setError('Failed to search students')
          setStudents([])
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
  }, [selectedIds])

  const filteredStudents = useMemo(() => search.length < 2 ? [] : students, [search, students])

  const categories = useMemo<SpyCategory<StudentListItem>[]>(() => {
    const grouped: Record<string, StudentListItem[]> = {}
    filteredStudents.forEach(s => {
      const key = s.full_name ? s.full_name.charAt(0).toUpperCase() : '#'
      if (!/[A-Z]/.test(key)) {
        grouped['#'] = grouped['#'] || []
        grouped['#'].push(s)
      } else {
        grouped[key] = grouped[key] || []
        grouped[key].push(s)
      }
    })
    return Object.keys(grouped)
      .sort()
      .map(k => ({ id: k, title: k, icon: 'sort_by_alpha', items: grouped[k] }))
  }, [filteredStudents])

  const handleSelect = useCallback((student: StudentListItem) => {
    if (maxSelections && selected.length >= maxSelections) return
    onChange([...selected, { student }])
    setSearch('')
  }, [selected, onChange, maxSelections])

  const handleRemove = useCallback((id: number) => {
    onChange(selected.filter(s => s.student.id !== id))
  }, [selected, onChange])

  const handleFeeChange = useCallback((id: number, fee: string) => {
    const val = fee === '' ? undefined : parseFloat(fee)
    onChange(selected.map(s => s.student.id === id ? { ...s, fee: isNaN(val as number) ? undefined : val } : s))
  }, [selected, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && search === '' && selected.length > 0) {
      handleRemove(selected[selected.length - 1].student.id)
    }
  }, [search, selected, handleRemove])

  return (
    <div className="space-y-4">
      {/* Search Area */}
      <div onKeyDown={handleKeyDown}>
        <SpyCombobox<StudentListItem>
          search={search}
          onSearchChange={doSearch}
          placeholder="Search student by name (min 2 chars)..."
          isLoading={isLoading}
          noResultsText={search.length < 2 ? "Type at least 2 characters to search" : error || `No students found matching "${search}"`}
          modes={['alphabetical']}
          activeMode="alphabetical"
          categories={search.length >= 2 && !error ? categories : []}
          totalItemsCount={search.length >= 2 && !error ? filteredStudents.length : 0}
          onSelect={handleSelect}
          renderItem={(s, isHighlighted) => (
            <div
              className={`w-full px-4 py-2.5 text-left cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${
                isHighlighted ? 'bg-secondary/10' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center mb-0.5">
                <p className="font-medium text-sm text-on-surface leading-tight">{s.full_name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border shadow-sm ${
                  s.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                  s.status === 'inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Unknown'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{s.phone || 'No phone'}</p>
            </div>
          )}
        />
      </div>

      {/* Selected Students */}
      {selected.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-on-surface mb-2">
            Selected ({selected.length}){maxSelections ? ` / ${maxSelections}` : ''}
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selected.map(({ student, fee }) => (
              <div key={student.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-on-surface truncate">{student.full_name}</p>
                  <p className="text-xs text-slate-500">{student.phone || 'No phone'}</p>
                </div>
                {showFeeInput && (
                  <input
                    type="number"
                    value={fee ?? ''}
                    onChange={(e) => handleFeeChange(student.id, e.target.value)}
                    placeholder={`${defaultFee}`}
                    step="0.01"
                    min="0"
                    className="w-24 px-2 py-1 text-sm border border-slate-200 rounded bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(student.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  title="Remove student"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
