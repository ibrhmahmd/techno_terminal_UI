import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { useTeam, useTeamMembers, useTeamPayments, useTeamPlacement } from '../hooks/teams'
import { isTeamDeleted } from '../api/teams'
import type { TeamMemberRosterDTO } from '../api/teams'

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teamId = id || ''

  // Team data
  const {
    team,
    isLoading: teamLoading,
    error: teamError,
    restore,
    remove,
  } = useTeam(teamId)

  // Members data
  const {
    members,
    isLoading: membersLoading,
    add: addMember,
    remove: removeMember,
  } = useTeamMembers(teamId)

  // Payments
  const { pay, isPaying } = useTeamPayments(teamId)

  // Placement
  const { update: updatePlacement, isUpdating: placementUpdating } = useTeamPlacement(teamId)

  // Modal states
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [addMemberError, setAddMemberError] = useState<string | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMemberRosterDTO | null>(null)

  // Placement form state
  const [placementRank, setPlacementRank] = useState('')
  const [placementLabel, setPlacementLabel] = useState('')

  const isLoading = teamLoading || membersLoading
  const isDeleted = team ? isTeamDeleted(team) : false

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleRestore = async () => {
    try {
      await restore()
      setIsRestoreModalOpen(false)
    } catch {
      // Error handled by hook
    }
  }

  const handleDelete = async () => {
    try {
      await remove()
      setIsDeleteModalOpen(false)
      navigate('/competitions')
    } catch {
      // Error handled by hook
    }
  }

  const handlePayFee = async (member: TeamMemberRosterDTO) => {
    try {
      await pay({ student_id: member.student_id })
      setIsPayModalOpen(false)
      setSelectedMember(null)
    } catch {
      // Error handled by hook
    }
  }

  const handleUpdatePlacement = async () => {
    const rank = parseInt(placementRank, 10)
    if (isNaN(rank)) return

    try {
      await updatePlacement({
        placement_rank: rank,
        placement_label: placementLabel || undefined,
      })
    } catch {
      // Error handled by hook
    }
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
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">error</span>
          <p className="text-slate-500">Team not found</p>
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
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{team.team_name}</h1>
              {isDeleted && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Deleted
                </span>
              )}
              {team.placement_rank && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Rank #{team.placement_rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isDeleted ? (
                <button
                  onClick={() => setIsRestoreModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">restore</span>
                  Restore
                </button>
              ) : (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete
                </button>
              )}
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

        {isDeleted && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600">warning</span>
              <div>
                <h3 className="font-medium text-red-900">This team has been deleted</h3>
                <p className="text-sm text-red-600 mt-2">
                  You can restore this team to make it active again.
                </p>
              </div>
            </div>
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
                  <span className="material-symbols-outlined text-slate-400">category</span>
                  <span>{team.category}</span>
                </div>
                {team.subcategory && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400">label</span>
                    <span>{team.subcategory}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400">payments</span>
                  <span>{team.fee} EGP fee</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400">schedule</span>
                  <span>Created {formatDate(team.created_at)}</span>
                </div>
              </div>
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
                  {!isDeleted && (
                    <button
                      onClick={() => { setNewStudentId(''); setAddMemberError(null); setIsAddMemberModalOpen(true) }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Member
                    </button>
                  )}
                </div>
              </div>

              {members.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No members yet</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.team_member_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary">person</span>
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{member.student_name}</p>
                          <p className="text-sm text-slate-500">Share: {member.member_share} EGP</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isDeleted && (
                          <button
                            onClick={async () => { if (confirm('Remove this member from the team?')) { try { await removeMember(member.student_id) } catch { /* handled by hook */ } } }}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove member"
                          >
                            <span className="material-symbols-outlined text-sm">person_remove</span>
                          </button>
                        )}
                        {member.fee_paid ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Paid
                          </span>
                        ) : (
                          <>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                              Pending
                            </span>
                            {!isDeleted && (
                              <button
                                onClick={() => {
                                  setSelectedMember(member)
                                  setIsPayModalOpen(true)
                                }}
                                className="px-3 py-1 text-xs font-medium text-white bg-secondary rounded hover:bg-secondary/90 transition-colors"
                              >
                                Pay
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Placement */}
            {!isDeleted && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">Competition Placement</h2>
                <div className="flex items-end gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rank</label>
                    <input
                      type="number"
                      value={placementRank}
                      onChange={(e) => setPlacementRank(e.target.value)}
                      placeholder={team.placement_rank?.toString() || '1'}
                      className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Label (optional)</label>
                    <input
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Team Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Fee</span>
                  <span className="font-semibold text-on-surface">{team.fee} EGP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Members</span>
                  <span className="font-semibold text-on-surface">{members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Paid Members</span>
                  <span className="font-semibold text-green-600">
                    {members.filter(m => m.fee_paid).length}
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

      {/* Restore Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Team"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRestoreModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRestore}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Restore
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to restore this team? It will become active again.
        </p>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Team"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
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
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this team? This action can be reversed by restoring the team later.
        </p>
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
              onClick={async () => {
                const sid = parseInt(newStudentId, 10)
                if (isNaN(sid) || sid <= 0) { setAddMemberError('Valid student ID required'); return }
                setIsAddingMember(true)
                setAddMemberError(null)
                try {
                  await addMember({ student_id: sid })
                  setIsAddMemberModalOpen(false)
                  setNewStudentId('')
                } catch {
                  setAddMemberError('Failed to add member')
                } finally {
                  setIsAddingMember(false)
                }
              }}
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
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{addMemberError}</span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new_student_id" className="text-sm font-medium text-on-surface">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              id="new_student_id"
              type="number"
              value={newStudentId}
              onChange={(e) => setNewStudentId(e.target.value)}
              placeholder="Enter student ID..."
              disabled={isAddingMember}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
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
        }}
        title="Pay Competition Fee"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsPayModalOpen(false)
                setSelectedMember(null)
              }}
              disabled={isPaying}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedMember && handlePayFee(selectedMember)}
              disabled={isPaying}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {isPaying ? 'Processing...' : 'Pay Fee'}
            </button>
          </div>
        }
      >
        {selectedMember && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Pay competition fee for <strong>{selectedMember.student_name}</strong>?
            </p>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Amount</span>
                <span className="font-semibold text-on-surface">{selectedMember.member_share} EGP</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
