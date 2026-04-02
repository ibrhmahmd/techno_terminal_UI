import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Modal } from '../components/common/Modal'
import { GroupForm } from '../components/groups/GroupForm'
import { getGroups, createGroup, type Group } from '../api/academics'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export function GroupsPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    async function loadGroups() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getGroups()
        setGroups(data)
      } catch (err) {
        setError('Failed to load groups. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    loadGroups()
  }, [])

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRowClick = (groupId: string) => {
    navigate(`/groups/${groupId}`)
  }

  const handleCreateGroup = async (data: Partial<Omit<Group, 'id'>>) => {
    try {
      const newGroup = await createGroup(data as Omit<Group, 'id'>)
      setGroups(prev => [newGroup, ...prev])
      setIsCreateModalOpen(false)
      setError(null)
    } catch {
      setError('Failed to create group')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Groups" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Groups</h1>
            <p className="text-sm text-on-surface-variant mt-2">Manage classes, schedules, and attendance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
              <span className="material-symbols-outlined text-slate-500">search</span>
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-on-surface min-w-[200px] placeholder-slate-400"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Create Group
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="p-8 max-w-[1400px] mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-center">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Group Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Instructor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      No groups found
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr
                      key={group.id}
                      onClick={() => handleRowClick(group.id)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-semibold text-on-surface">{group.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{group.course_name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{group.instructor_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-on-surface">
                          <span className="material-symbols-outlined text-sm">group</span>
                          {group.student_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/groups/${group.id}`)
                          }}
                          className="px-3 py-1 text-xs font-medium text-secondary border border-secondary rounded hover:bg-secondary-container transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Group"
      >
        <GroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setIsCreateModalOpen(false)}
          mode="create"
        />
      </Modal>
    </div>
  )
}
