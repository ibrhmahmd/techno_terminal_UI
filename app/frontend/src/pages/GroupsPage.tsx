import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDailySchedule, type Group } from '../api/academics'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorMessage } from '../components/common/ErrorMessage'

export function GroupsPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadGroups() {
      setIsLoading(true)
      setError(null)
      try {
        // Get groups from daily schedule without date filter to get all groups
        const data = await getDailySchedule()
        setGroups(data.groups)
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

  const handleRowClick = (groupId: number) => {
    navigate(`/groups/${groupId}`)
  }

  return (
    <div className="groups-page">
      <header className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Groups</h1>
            <p className="page-subtitle">Manage classes, schedules, and attendance</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="content-wrapper">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      No groups found
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr
                      key={group.id}
                      onClick={() => handleRowClick(group.id)}
                      className="clickable-row"
                    >
                      <td className="group-name">{group.name}</td>
                      <td>{group.course_name}</td>
                      <td>{group.instructor_name}</td>
                      <td>
                        <span className="student-badge">
                          <span className="material-symbols-outlined">group</span>
                          {group.student_count}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-link"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/groups/${group.id}`)
                          }}
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

      <style>{`
        .groups-page {
          min-height: 100vh;
          background-color: var(--surface);
        }
        .page-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: var(--surface-container-lowest);
          border-bottom: 1px solid rgba(198, 198, 205, 0.15);
          padding: var(--space-6) var(--space-8);
        }
        .page-header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .page-title {
          font-family: var(--font-headline);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
        }
        .page-subtitle {
          font-size: var(--text-sm);
          color: var(--on-surface-variant);
          margin-top: var(--space-2);
        }
        .header-actions {
          display: flex;
          gap: var(--space-3);
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background-color: var(--surface-container-low);
          border-radius: var(--radius-md);
          border: 1px solid var(--outline-variant);
        }
        .search-box .material-symbols-outlined {
          font-size: 1.25rem;
          color: var(--on-surface-variant);
        }
        .search-box input {
          border: none;
          background: transparent;
          font-size: var(--text-sm);
          color: var(--on-surface);
          outline: none;
          min-width: 200px;
        }
        .content-wrapper {
          padding: var(--space-8);
          max-width: 1400px;
          margin: 0 auto;
        }
        .table-container {
          overflow: hidden;
          border-radius: var(--radius-lg);
          background-color: var(--surface-container-lowest);
          border: 1px solid rgba(198, 198, 205, 0.15);
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--text-sm);
        }
        .data-table thead {
          background-color: var(--surface-container-low);
        }
        .data-table th {
          padding: var(--space-4);
          text-align: left;
          font-weight: 600;
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--on-surface-variant);
        }
        .data-table td {
          padding: var(--space-4);
          border-top: 1px solid rgba(198, 198, 205, 0.1);
        }
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .clickable-row:hover {
          background-color: var(--surface-container-low);
        }
        .group-name {
          font-weight: 600;
          color: var(--primary);
        }
        .student-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-3);
          background-color: var(--surface-container-low);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
        }
        .student-badge .material-symbols-outlined {
          font-size: 1rem;
        }
        .action-link {
          padding: var(--space-1) var(--space-3);
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--secondary);
          background: transparent;
          border: 1px solid var(--secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-link:hover {
          background-color: var(--secondary-container);
        }
        .empty-cell {
          text-align: center;
          color: var(--on-surface-variant);
          padding: var(--space-8);
        }
      `}</style>
    </div>
  )
}
