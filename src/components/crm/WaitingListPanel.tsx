// Waiting List Management Panel
// Dedicated interface for managing waiting list students with priority controls

import { useState } from 'react'
import { ArrowUp, ArrowDown, CheckCircle, User, Calendar, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EmptyState } from '../common/EmptyState'
import { Modal } from '../common/Modal'
import { useWaitingList, useSetWaitingPriority, useActivateStudent } from '../../hooks/useWaitingList'
import type { StudentWithDetails } from '../../api/crm'

interface WaitingListPanelProps {
  onStudentClick?: (student: StudentWithDetails) => void
}

export function WaitingListPanel({ onStudentClick }: WaitingListPanelProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null)
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false)
  const [activationNotes, setActivationNotes] = useState('')

  const { students, total, isLoading } = useWaitingList({ skip: 0, limit: 100 })
  const setPriorityMutation = useSetWaitingPriority()
  const activateMutation = useActivateStudent()

  // Sort students by waiting priority (if available) or waiting_since date
  const sortedStudents = [...students].sort((a, b) => {
    // If both have waiting_priority, sort by that
    if (a.waiting_priority && b.waiting_priority) {
      return a.waiting_priority - b.waiting_priority
    }
    // Otherwise sort by waiting_since date
    if (a.waiting_since && b.waiting_since) {
      return new Date(a.waiting_since).getTime() - new Date(b.waiting_since).getTime()
    }
    return 0
  })

  const handlePriorityChange = (studentId: number, newPriority: number) => {
    setPriorityMutation.mutate({ studentId, priority: newPriority })
  }

  const handleActivate = () => {
    if (!selectedStudent) return
    activateMutation.mutate(
      { studentId: selectedStudent.id, notes: activationNotes },
      {
        onSuccess: () => {
          setIsActivateModalOpen(false)
          setActivationNotes('')
          setSelectedStudent(null)
        },
      }
    )
  }

  const getDaysWaiting = (since?: string | null) => {
    if (!since) return 0
    const days = Math.floor((Date.now() - new Date(since).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Waiting List</h2>
          <p className="text-sm text-slate-500 mt-1">
            {total} student{total !== 1 ? 's' : ''} waiting for enrollment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sort by:</span>
          <select className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white">
            <option>Priority (High → Low)</option>
            <option>Wait Duration (Longest First)</option>
            <option>Name (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Waiting List Table */}
      {sortedStudents.length === 0 ? (
        <EmptyState
          title="No students on waiting list"
          message="All students are currently active or enrolled."
          icon="schedule"
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Waiting Since
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* Priority */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-on-surface w-6">
                        {student.waiting_priority || index + 1}
                      </span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => handlePriorityChange(student.id, (student.waiting_priority || index + 1) - 1)}
                          disabled={index === 0 || setPriorityMutation.isPending}
                          className="text-slate-400 hover:text-secondary disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handlePriorityChange(student.id, (student.waiting_priority || index + 1) + 1)}
                          disabled={index === sortedStudents.length - 1 || setPriorityMutation.isPending}
                          className="text-slate-400 hover:text-secondary disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Student Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                        <User className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium text-on-surface cursor-pointer hover:text-secondary"
                          onClick={() => onStudentClick?.(student)}
                        >
                          {student.full_name}
                        </p>
                        {student.phone && (
                          <p className="text-xs text-slate-500">{student.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Waiting Since */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {student.waiting_since
                        ? new Date(student.waiting_since).toLocaleDateString()
                        : 'Unknown'}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getDaysWaiting(student.waiting_since) > 30
                        ? 'bg-red-100 text-red-700'
                        : getDaysWaiting(student.waiting_since) > 14
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getDaysWaiting(student.waiting_since)} days
                    </span>
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-3">
                    {student.waiting_notes ? (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate max-w-[150px]">{student.waiting_notes}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudent(student)
                        setIsActivateModalOpen(true)
                      }}
                      disabled={activateMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Activate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Recent (&lt; 14 days)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Moderate (14-30 days)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Long wait (&gt; 30 days)
        </span>
      </div>

      {/* Activate Modal */}
      <Modal
        isOpen={isActivateModalOpen}
        onClose={() => {
          setIsActivateModalOpen(false)
          setSelectedStudent(null)
          setActivationNotes('')
        }}
        title={`Activate ${selectedStudent?.full_name || 'Student'}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This will move <strong>{selectedStudent?.full_name}</strong> from the waiting list to active status.
          </p>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Activation Notes (optional)
            </label>
            <textarea
              value={activationNotes}
              onChange={(e) => setActivationNotes(e.target.value)}
              placeholder="e.g., Spot opened in Group A, notified parent via WhatsApp"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsActivateModalOpen(false)
                setSelectedStudent(null)
                setActivationNotes('')
              }}
              disabled={activateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleActivate}
              disabled={activateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {activateMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Confirm Activation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
