import { useState, useRef, useEffect, useMemo } from 'react'
import { ModalFooter, LoadingSpinner } from '../common'
import { useCreateCertificate } from '../../hooks/useCertificates'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { getStudentWithDetails } from '../../api/crm/students/core'
import { useDebounce } from '../../hooks/useDebounce'
import type { CreateCertificateInput } from '../../api/certificates/types'
import type { StudentListItem } from '../../api/crm'

interface TrackOption { value: string; label: string }

const TRACK_OPTIONS: TrackOption[] = [
  { value: 'html', label: 'HTML — Web Structure' },
  { value: 'css', label: 'CSS — Styling & Layout' },
  { value: 'javascript', label: 'JavaScript — Interactivity' },
  { value: 'python', label: 'Python — Programming' },
  { value: 'advanced', label: 'Advanced — Web Pro' },
  { value: 'problem_solving', label: 'Problem Solving — Logic' },
  { value: 'robotics-wedo', label: 'Robotics WeDo 2.0' },
  { value: 'robotics-spike-essential', label: 'Robotics SPIKE Essential' },
  { value: 'robotics-spike-prime', label: 'Robotics SPIKE Prime' },
  { value: 'robotics-ev3', label: 'Robotics EV3' },
  { value: 'robotics-arduino', label: 'Robotics Arduino' },
  { value: 'scratch', label: 'Scratch' },
  { value: 'scratch-jr', label: 'Scratch Jr' },
]

function trackLabelToValue(label: string): string | undefined {
  return TRACK_OPTIONS.find((o) => o.label === label)?.value
}

function levelNumberToLevel(n: number): string {
  const labels = ['Level 1 — Junior', 'Level 2 — Intermediate', 'Level 3 — Advanced']
  return labels[n - 1] ?? `Level ${n}`
}

const TODAY = new Date().toISOString().split('T')[0]

function TrackCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState(value)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () => TRACK_OPTIONS.filter((o) => o.label.toLowerCase().includes(input.toLowerCase())),
    [input],
  )

  const displayValue = useMemo(
    () => TRACK_OPTIONS.find((o) => o.value === value)?.label ?? value,
    [value],
  )

  useEffect(() => {
    setInput(displayValue)
  }, [displayValue])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [input])

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id="course-track-input"
        type="text"
        value={input}
        onChange={(e) => { setInput(e.target.value); onChange(e.target.value); setIsOpen(true) }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (!isOpen) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlightedIndex((i) => Math.max(i - 1, 0))
          } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault()
            const selected = filtered[highlightedIndex]
            setInput(selected.label)
            onChange(selected.value)
            setIsOpen(false)
          } else if (e.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
        placeholder="Type or select a track"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              onMouseDown={() => { setInput(opt.label); onChange(opt.value); setIsOpen(false) }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`px-3 py-2 text-sm cursor-pointer ${
                i === highlightedIndex ? 'bg-cyan-50 text-cyan-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StudentSearchCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState(value)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [manualInput, setManualInput] = useState(false)

  const debouncedSearch = useDebounce(selectedId ? '' : input, 300)
  const { data: students = [], isLoading } = useStudentsSearch(debouncedSearch)

  const filtered = useMemo(
    () => students.filter((s) => s.full_name.toLowerCase().includes(input.toLowerCase())),
    [students, input],
  )

  useEffect(() => {
    if (selectedId && !manualInput) {
      setManualInput(true)
    }
  }, [input, selectedId, manualInput])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [input])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (student: StudentListItem) => {
    setSelectedId(student.id)
    setInput(student.full_name)
    onChange(student.full_name)
    setIsOpen(false)
  }

  const handleInputChange = (val: string) => {
    setInput(val)
    setSelectedId(null)
    onChange(val)
    setIsOpen(true)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id="student-name"
        type="text"
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => { if (!selectedId) setIsOpen(true) }}
        onKeyDown={(e) => {
          if (!isOpen) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlightedIndex((i) => Math.max(i - 1, 0))
          } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault()
            handleSelect(filtered[highlightedIndex])
          } else if (e.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
        placeholder="Type a student name to search..."
        autoFocus
      />
      {isOpen && (
        <>
          {isLoading ? (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-3 flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : input.length >= 2 && filtered.length === 0 ? (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm text-slate-400 text-center">
              No students found
            </div>
          ) : input.length >= 2 && filtered.length > 0 ? (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {filtered.map((s, i) => (
                <li
                  key={s.id}
                  onMouseDown={() => handleSelect(s)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${
                    i === highlightedIndex ? 'bg-cyan-50 text-cyan-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{s.full_name}</span>
                  {s.current_group_name && (
                    <span className="text-xs text-slate-400 ml-2 truncate max-w-[180px]">{s.current_group_name}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  )
}

interface CertificateFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CertificateForm({ onSuccess, onCancel }: CertificateFormProps) {
  const createMutation = useCreateCertificate()
  const [studentName, setStudentName] = useState('')
  const [courseTrack, setCourseTrack] = useState('')
  const [level, setLevel] = useState('')
  const [customColor, setCustomColor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  const debouncedStudentName = useDebounce(studentName, 500)
  const { data: students = [] } = useStudentsSearch(debouncedStudentName)

  useEffect(() => {
    if (debouncedStudentName.length < 2 || students.length === 0) return
    const match = students.find(
      (s) => s.full_name.toLowerCase() === debouncedStudentName.toLowerCase(),
    )
    if (!match) return

    setIsFetchingDetails(true)
    getStudentWithDetails(match.id)
      .then((details) => {
        const enrollment = details.current_enrollment
        if (enrollment) {
          const trackValue = trackLabelToValue(enrollment.course_name)
          if (trackValue) setCourseTrack(trackValue)
          setLevel(levelNumberToLevel(enrollment.level_number))
        }
      })
      .catch(() => {})
      .finally(() => setIsFetchingDetails(false))
  }, [debouncedStudentName, students])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)

    if (!studentName.trim()) {
      setError('Student name is required')
      return
    }
    if (!courseTrack.trim()) {
      setError('Course track is required')
      return
    }
    if (!level.trim()) {
      setError('Level is required')
      return
    }

    const data: CreateCertificateInput = {
      student_name: studentName.trim(),
      course_track: courseTrack.trim(),
      level: level.trim(),
      issue_date: TODAY,
      branch: 'KFS',
      custom_color: customColor || undefined,
    }

    try {
      await createMutation.mutateAsync(data)
      onSuccess()
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('already exists')) {
        setError('A certificate for this student, track, and level already exists.')
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to generate certificate'
        setError(msg)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="student-name" className="block text-sm font-medium text-slate-700 mb-1">
            Student Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <StudentSearchCombobox value={studentName} onChange={setStudentName} />
            {isFetchingDetails && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Start typing to search for a student. Selecting one auto-fills course and level from their enrollment.</p>
        </div>

        <div>
          <label htmlFor="course-track-input" className="block text-sm font-medium text-slate-700 mb-1">
            Course Track <span className="text-red-500">*</span>
          </label>
          <TrackCombobox value={courseTrack} onChange={setCourseTrack} />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1">
            Level <span className="text-red-500">*</span>
          </label>
          <input
            id="level"
            type="text"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
            placeholder="e.g. Level 1, Beginner, etc."
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-slate-700 mb-1">
            Issue Date
          </p>
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            {TODAY}
          </p>
        </div>

        <div>
          <p className="block text-sm font-medium text-slate-700 mb-1">
            Branch
          </p>
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            KFS
          </p>
        </div>

        <div>
          <label htmlFor="custom-color" className="block text-sm font-medium text-slate-700 mb-1">
            Custom Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="custom-color"
              type="color"
              value={customColor || '#0f172a'}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
            />
            {customColor && (
              <button
                type="button"
                onClick={() => setCustomColor('')}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <ModalFooter
        onCancel={onCancel}
        onConfirm={handleSubmit}
        confirmText="Generate Certificate"
        isProcessing={createMutation.isPending || isFetchingDetails}
      />
    </form>
  )
}
