import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { TeamEditModal } from '../components/teams/TeamEditModal'
import { useTeam, useTeamMembers, useTeamPayments, useTeamPlacement } from '../hooks/teams'
import { useEmployee } from '../hooks/useStaff'
import { useStudentsSearch } from '../hooks/useDirectory'
import { StudentCombobox } from '../components/student/StudentCombobox'
import { searchParents } from '../api/crm'
import type { ParentListItem, StudentListItem } from '../api/crm'
import type { TeamMemberRosterDTO, UpdateTeamInput } from '../api/teams'
import { extractErrorMessage, getErrorStatus } from '../utils/apiErrors'

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teamId = id || ''

  // Team data
  const {
    team,
    isLoading: teamLoading,
    error: teamError,
    remove,
    update,
  } = useTeam(teamId)

  // Instructor data
  const { data: instructor } = useEmployee(team?.coach_id ?? null)

  // Members data
  const {
    members,
    isLoading: membersLoading,
    add: addMember,
    remove: removeMember,
  } = useTeamMembers(teamId)

  // Payments
  const { pay, isPaying, refund, isRefunding } = useTeamPayments(teamId)

  // Placement
  const { update: updatePlacement, isUpdating: placementUpdating } = useTeamPlacement(teamId)

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [addMemberError, setAddMemberError] = useState<string | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)

  const [parentSearch, setParentSearch] = useState('')
  const [debouncedParentSearch, setDebouncedParentSearch] = useState('')
  const [parentResults, setParentResults] = useState<ParentListItem[]>([])
  const [selectedParent, setSelectedParent] = useState<ParentListItem | null>(null)
  const [isSearchingParents, setIsSearchingParents] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedParentSearch(parentSearch), 300)
    return () => clearTimeout(timer)
  }, [parentSearch])

  useEffect(() => {
    if (debouncedParentSearch.trim().length < 2) {
      setParentResults([])
      return
    }
    let cancelled = false
    setIsSearchingParents(true)
    searchParents(debouncedParentSearch.trim()).then(results => {
      if (!cancelled) {
        setParentResults(results)
        setIsSearchingParents(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setParentResults([])
        setIsSearchingParents(false)
      }
    })
    return () => { cancelled = true }
  }, [debouncedParentSearch])

  const { data: studentResults, isLoading: isSearchingStudents } = useStudentsSearch(studentSearch)
  const [selectedMember, setSelectedMember] = useState<TeamMemberRosterDTO | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payError, setPayError] = useState<string | null>(null)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundError, setRefundError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Placement form state
  const [placementRank, setPlacementRank] = useState('')
  const [placementLabel, setPlacementLabel] = useState('')
  const [placementResult, setPlacementResult] = useState<string | null>(null)

  const isLoading = teamLoading || membersLoading

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleEditTeam = async (data: UpdateTeamInput) => {
    await update(data)
  }

  const handleDelete = async () => {
    setDeleteError(null)
    try {
      await remove()
      setIsDeleteModalOpen(false)
      navigate('/competitions')
    } catch (err: unknown) {
      if (getErrorStatus(err) === 409) {
        setDeleteError(extractErrorMessage(err) || 'Cannot delete: this team has members who have already paid.')
      }
    }
  }

  const handlePayFee = async () => {
    if (!selectedMember) return
    const amount = parseFloat(payAmount)
    if (isNaN(amount) || amount <= 0) {
      setPayError('Enter a valid payment amount greater than 0')
      return
    }

    setPayError(null)
    try {
      const payload: { amount: number; parent_id?: number } = { amount }
      if (selectedParent) {
        payload.parent_id = selectedParent.id
      }
      await pay(selectedMember.student_id, payload)
      setIsPayModalOpen(false)
      setSelectedMember(null)
      setPayAmount('')
      setSelectedParent(null)
      setParentSearch('')
      setParentResults([])
    } catch {
      setPayError('Payment failed. Please try again.')
    }
  }

  const handleRefund = async () => {
    if (!selectedMember) return
    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      setRefundError('Enter a valid refund amount greater than 0')
      return
    }
    if (amount > selectedMember.amount_paid) {
      setRefundError(`Refund amount cannot exceed the amount paid (${selectedMember.amount_paid} EGP)`)
      return
    }

    setRefundError(null)
    try {
      await refund(selectedMember.student_id, { amount })
      setIsRefundModalOpen(false)
      setSelectedMember(null)
      setRefundAmount('')
    } catch {
      setRefundError('Refund failed. Please try again.')
    }
  }

  const handleRemoveMember = async (member: TeamMemberRosterDTO) => {
    setRemoveError(null)
    try {
      await removeMember(member.student_id)
    } catch (err: unknown) {
      if (getErrorStatus(err) === 400) {
        setRemoveError(extractErrorMessage(err) || `Cannot remove ${member.student_name}: they have already paid (${member.amount_paid} EGP).`)
      }
    }
  }

  const handleUpdatePlacement = async () => {
    const rank = parseInt(placementRank, 10)
    if (isNaN(rank) || rank < 1) return

    setPlacementResult(null)
    try {
      await updatePlacement({
        placement_rank: rank,
        placement_label: placementLabel || undefined,
      })
      setPlacementRank('')
      setPlacementLabel('')
      setPlacementResult('Placement updated successfully')
    } catch (err: unknown) {
      if (getErrorStatus(err) === 400) {
        setPlacementResult(extractErrorMessage(err) || 'Cannot set placement before the competition date has passed.')
      }
    }
  }

  const handleAddMember = async () => {
    if (!selectedStudent) { setAddMemberError('Select a student to add'); return }
    setIsAddingMember(true)
    setAddMemberError(null)
    try {
      await addMember({ student_id: selectedStudent.id })
      setIsAddMemberModalOpen(false)
      setSelectedStudent(null)
      setStudentSearch('')
    } catch (err: unknown) {
      setAddMemberError(extractErrorMessage(err) || 'Failed to add member')
    } finally {
      setIsAddingMember(false)
    }
  }

  const getPaymentStatus = (member: TeamMemberRosterDTO) => {
    const remaining = member.amount_due - member.amount_paid
    if (remaining <= 0) return { label: 'Paid', color: 'bg-green-100 text-green-700' }
    if (member.amount_paid > 0) return { label: 'Partial', color: 'bg-blue-100 text-blue-700' }
    return { label: 'Pending', color: 'bg-amber-100 text-amber-700' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Competitions" />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Competitions" />
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-4" aria-hidden="true">error</span>
          <p className="text-slate-500">{teamError || 'Team not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const totalPaid = members.reduce((sum, m) => sum + m.amount_paid, 0)
  const totalDue = members.reduce((sum, m) => sum + m.amount_due, 0)
  const fullyPaidCount = members.filter(m => m.amount_paid >= m.amount_due).length

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Competitions" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-on-surface mb-2"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
            Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{team.team_name}</h1>
              {team.placement_rank && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Rank #{team.placement_rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">
        {teamError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {teamError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">Team Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400" aria-hidden="true">category</span>
                  <span>{team.category}</span>
                </div>
                {team.subcategory && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400" aria-hidden="true">label</span>
                    <span>{team.subcategory}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400" aria-hidden="true">schedule</span>
                  <span>Created {formatDate(team.created_at)}</span>
                </div>
                {instructor && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400" aria-hidden="true">school</span>
                    <span>Instructor: {instructor.full_name}</span>
                  </div>
                )}
              </div>
              {team.project_name && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-on-surface">Project: {team.project_name}</p>
                  {team.project_description && (
                    <p className="text-sm text-slate-600 mt-1">{team.project_description}</p>
                  )}
                </div>
              )}
              {team.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600">{team.notes}</p>
                </div>
              )}
            </div>

            {/* Members */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-lg font-semibold text-on-surface">Team Members</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{members.length} members</span>
                  <button
                    onClick={() => { setSelectedStudent(null); setStudentSearch(''); setAddMemberError(null); setIsAddMemberModalOpen(true) }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
                    Add Member
                  </button>
                </div>
              </div>

              {removeError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  {removeError}
                </div>
              )}

              {members.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No members yet</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                    const status = getPaymentStatus(member)
                    const remaining = member.amount_due - member.amount_paid
                    return (
                      <div key={member.team_member_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary" aria-hidden="true">person</span>
                          </div>
                          <div>
                            <p className="font-medium text-on-surface">{member.student_name}</p>
                            <p className="text-sm text-slate-500">
                              Due: {member.amount_due} EGP · Paid: {member.amount_paid} EGP
                              {remaining > 0 && <span className="text-red-500"> · Remaining: {remaining} EGP</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove member"
                          >
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">person_remove</span>
                          </button>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          {remaining > 0 && (
                            <button
                              onClick={() => {
                                setSelectedMember(member)
                                setPayAmount(remaining.toString())
                                setPayError(null)
                                setIsPayModalOpen(true)
                              }}
                              className="px-3 py-1 text-xs font-medium text-white bg-secondary rounded hover:bg-secondary/90 transition-colors"
                            >
                              Pay
                            </button>
                          )}
                          {member.amount_paid > 0 && (
                            <button
                              onClick={() => {
                                setSelectedMember(member)
                                setRefundAmount(member.amount_paid.toString())
                                setRefundError(null)
                                setIsRefundModalOpen(true)
                              }}
                              className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Placement */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">Competition Placement</h2>
              {placementResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${placementResult.startsWith('Cannot') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {placementResult}
                </div>
              )}
              <div className="flex items-end gap-4">
                <div>
                  <label htmlFor="placement-rank" className="block text-sm font-medium text-slate-700 mb-1">Rank</label>
                  <input
                    id="placement-rank"
                    type="number"
                    value={placementRank}
                    onChange={(e) => setPlacementRank(e.target.value)}
                    placeholder={team.placement_rank?.toString() || '1'}
                    min="1"
                    className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="placement-label" className="block text-sm font-medium text-slate-700 mb-1">Label (optional)</label>
                  <input
                    id="placement-label"
                    type="text"
                    value={placementLabel}
                    onChange={(e) => setPlacementLabel(e.target.value)}
                    placeholder={team.placement_label || 'Gold, Silver, etc.'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={handleUpdatePlacement}
                  disabled={placementUpdating || !placementRank}
                  className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {placementUpdating ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Team Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Members</span>
                  <span className="font-semibold text-on-surface">{members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Fees Due</span>
                  <span className="font-semibold text-on-surface">{totalDue} EGP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Paid</span>
                  <span className="font-semibold text-green-600">{totalPaid} EGP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Fully Paid</span>
                  <span className="font-semibold text-green-600">
                    {fullyPaidCount}/{members.length}
                  </span>
                </div>
                {team.placement_rank && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Placement</span>
                      <span className="font-semibold text-amber-600">#{team.placement_rank}</span>
                    </div>
                    {team.placement_label && (
                      <p className="text-sm text-slate-500 mt-1">{team.placement_label}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteError(null) }}
        title="Delete Team"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsDeleteModalOpen(false); setDeleteError(null) }}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete <strong>{team.team_name}</strong>?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone.
          </p>
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              {deleteError}
            </div>
          )}
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAddMemberModalOpen(false)}
              disabled={isAddingMember}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={isAddingMember}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {isAddingMember && <LoadingSpinner size="sm" />}
              Add Member
            </button>
          </div>
        }
      >
          <div className="space-y-4">
            {addMemberError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
                <span>{addMemberError}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface mb-1">
                Select Student <span className="text-red-500">*</span>
              </label>
              <StudentCombobox
                value={selectedStudent}
                onChange={setSelectedStudent}
                search={studentSearch}
                setSearch={setStudentSearch}
                students={studentResults || []}
                isLoading={isSearchingStudents}
              />
            </div>
          </div>
      </Modal>

      {/* Pay Fee Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false)
          setSelectedMember(null)
          setPayAmount('')
          setPayError(null)
          setSelectedParent(null)
          setParentSearch('')
          setParentResults([])
        }}
        title="Pay Competition Fee"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsPayModalOpen(false)
                setSelectedMember(null)
                setPayAmount('')
                setPayError(null)
                setSelectedParent(null)
                setParentSearch('')
                setParentResults([])
              }}
              disabled={isPaying}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayFee}
              disabled={isPaying}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {isPaying ? 'Processing...' : 'Pay'}
            </button>
          </div>
        }
      >
        {selectedMember && (
          <div className="space-y-4">
            {payError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
                <span>{payError}</span>
              </div>
            )}
            <p className="text-sm text-slate-600">
              Payment for <strong>{selectedMember.student_name}</strong>
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="parent_search" className="text-sm font-medium text-on-surface">
                Parent <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="parent_search"
                  type="text"
                  value={parentSearch}
                  onChange={(e) => {
                    setParentSearch(e.target.value)
                    setSelectedParent(null)
                  }}
                  placeholder="Search parent by name..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
                {isSearchingParents && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
                {!selectedParent && parentResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {parentResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedParent(p)
                          setParentSearch(p.full_name)
                          setParentResults([])
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-medium">{p.full_name}</span>
                        <span className="text-slate-400 ml-2">{p.phone_primary}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedParent && (
                  <div className="mt-1 flex items-center gap-2 px-3 py-1.5 bg-secondary/5 rounded-lg text-sm text-secondary">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">check_circle</span>
                    <span>{selectedParent.full_name} — {selectedParent.phone_primary}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParent(null)
                        setParentSearch('')
                        setParentResults([])
                      }}
                      className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Clear parent selection"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Amount Due</span>
                <span className="font-semibold text-on-surface">{selectedMember.amount_due} EGP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Already Paid</span>
                <span className="font-semibold text-green-600">{selectedMember.amount_paid} EGP</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-600">Remaining</span>
                <span className="font-semibold text-red-600">{selectedMember.amount_due - selectedMember.amount_paid} EGP</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pay_amount" className="text-sm font-medium text-on-surface">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <input
                id="pay_amount"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
                placeholder="Enter amount..."
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              />
              <p className="text-xs text-slate-500">Supports partial payments. Enter any amount greater than 0.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Fee Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false)
          setSelectedMember(null)
          setRefundAmount('')
          setRefundError(null)
        }}
        title="Refund Competition Fee"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 font-body">
            <button
              onClick={() => {
                setIsRefundModalOpen(false)
                setSelectedMember(null)
                setRefundAmount('')
                setRefundError(null)
              }}
              disabled={isRefunding}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRefund}
              disabled={isRefunding}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isRefunding ? 'Processing...' : 'Refund'}
            </button>
          </div>
        }
      >
        {selectedMember && (
          <div className="space-y-4 font-body">
            {refundError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
                <span>{refundError}</span>
              </div>
            )}
            <p className="text-sm text-slate-600">
              Refund for <strong>{selectedMember.student_name}</strong>
            </p>
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Amount Due</span>
                <span className="font-semibold text-on-surface">{selectedMember.amount_due} EGP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Already Paid</span>
                <span className="font-semibold text-green-600">{selectedMember.amount_paid} EGP</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="refund_amount" className="text-sm font-medium text-on-surface">
                Refund Amount <span className="text-red-500">*</span>
              </label>
              <input
                id="refund_amount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
                placeholder="Enter amount..."
                step="0.01"
                min="0.01"
                max={selectedMember.amount_paid}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              />
              <p className="text-xs text-slate-500 font-body">Supports partial refunds. Enter any amount up to {selectedMember.amount_paid} EGP.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Team Modal */}
      <TeamEditModal
        team={team}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditTeam}
      />
    </div>
  )
}
