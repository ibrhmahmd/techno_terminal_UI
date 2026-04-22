import { useState } from 'react'
import { EmptyState } from '../common/EmptyState'
import type {
  EnrollmentHistoryDTO,
  InstructorAssignmentDTO,
  GroupLifecycleHistoryDTO,
  CourseAssignmentDTO,
  EnrollmentTransitionDTO,
  GroupLevelAnalyticsDTO,
  GroupEnrollmentAnalyticsDTO,
  CompetitionParticipationDTO,
  GroupCompetitionHistoryResponseDTO,
  TeamPublic,
} from '../../api/academics'
import type { TeamDTO } from '../../api/teams'

interface HistoryTabProps {
  // Enrollment & Instructor
  enrollmentHistory: EnrollmentHistoryDTO[]
  instructorHistory: InstructorAssignmentDTO[]

  // Lifecycle
  lifecycleHistory: GroupLifecycleHistoryDTO | null
  courseHistory: CourseAssignmentDTO[]
  enrollmentTransitions: EnrollmentTransitionDTO[]

  // Analytics
  levelAnalytics: GroupLevelAnalyticsDTO[]
  enrollmentAnalytics: GroupEnrollmentAnalyticsDTO | null

  // Competitions
  competitions: CompetitionParticipationDTO[]
  competitionAnalytics: GroupCompetitionHistoryResponseDTO | null
  teams: TeamPublic[]
  availableTeams: TeamDTO[]

  // Loading states
  isLoadingHistory: boolean
  isLoadingAnalytics: boolean
  isLoadingTeams: boolean
  isLoadingCompetitions: boolean

  // Pagination
  totalEnrollment: number
  onEnrollmentPageChange: (skip: number) => void
  enrollmentSkip: number
  enrollmentLimit: number

  // Actions
  onCompleteLevel: (levelNumber: number) => Promise<void>
  onCancelLevel: (levelNumber: number, reason?: string) => Promise<void>
  onLinkTeam: (teamId: number) => Promise<void>
  onRegisterForCompetition: (competitionId: number, teamId: number, categoryId?: number) => Promise<void>
  onCompleteParticipation: (participationId: number, finalPlacement?: number) => Promise<void>
  onWithdrawFromCompetition: (participationId: number, reason?: string) => Promise<void>
}

type SubTab = 'overview' | 'levels' | 'enrollments' | 'courses' | 'competitions'

export function HistoryTab({
  enrollmentHistory,
  instructorHistory,
  lifecycleHistory,
  courseHistory,
  enrollmentTransitions: _enrollmentTransitions,
  levelAnalytics,
  enrollmentAnalytics,
  competitions,
  competitionAnalytics,
  teams,
  isLoadingHistory,
  isLoadingAnalytics,
  isLoadingTeams: _isLoadingTeams,
  isLoadingCompetitions: _isLoadingCompetitions,
  totalEnrollment,
  onEnrollmentPageChange: _onEnrollmentPageChange,
  enrollmentSkip: _enrollmentSkip,
  enrollmentLimit: _enrollmentLimit,
  onCompleteLevel,
  onCancelLevel,
  onLinkTeam: _onLinkTeam,
  onRegisterForCompetition: _onRegisterForCompetition,
  onCompleteParticipation: _onCompleteParticipation,
  onWithdrawFromCompetition: _onWithdrawFromCompetition,
}: HistoryTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'levels', label: 'Levels', icon: 'layers' },
    { id: 'enrollments', label: 'Enrollments', icon: 'people' },
    { id: 'courses', label: 'Courses', icon: 'school' },
    { id: 'competitions', label: 'Competitions', icon: 'emoji_events' },
  ] as const

  if (isLoadingHistory || isLoadingAnalytics) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-secondary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading history data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSubTab === tab.id
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-slate-600 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                {enrollmentAnalytics?.total_enrollments ?? 0}
              </p>
              <p className="text-xs text-slate-500">Total Enrollments</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {enrollmentAnalytics?.active_enrollments ?? 0}
              </p>
              <p className="text-xs text-slate-500">Active Students</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {lifecycleHistory?.total_levels ?? 0}
              </p>
              <p className="text-xs text-slate-500">Total Levels</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {competitionAnalytics?.total_competitions ?? 0}
              </p>
              <p className="text-xs text-slate-500">Competitions</p>
            </div>
          </div>

          {/* Level Analytics */}
          {levelAnalytics?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Level Performance</h3>
              <div className="space-y-3">
                {levelAnalytics?.map((level) => (
                  <div key={level.level_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-on-surface">Level {level.level_number}</p>
                      <p className="text-sm text-slate-500">
                        {level.student_count} students · {level.sessions_completed}/{level.sessions_total} sessions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-on-surface">{level.completion_rate}%</p>
                      <p className="text-xs text-slate-500">completion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Enrollment History */}
          {enrollmentHistory?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Recent Enrollment Activity</h3>
              <div className="space-y-2">
                {enrollmentHistory?.slice(0, 5).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${
                        enrollment.action === 'enrolled' ? 'text-green-600' :
                        enrollment.action === 'withdrawn' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {enrollment.action === 'enrolled' ? 'person_add' :
                         enrollment.action === 'withdrawn' ? 'person_remove' : 'swap_horiz'}
                      </span>
                      <div>
                        <p className="font-medium text-on-surface">{enrollment.student_name}</p>
                        <p className="text-sm text-slate-500 capitalize">{enrollment.action.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">
                      {new Date(enrollment.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Levels Tab */}
      {activeSubTab === 'levels' && (
        <div className="space-y-6">
          {lifecycleHistory?.levels_timeline ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Level Timeline</h3>
              <div className="space-y-4">
                {lifecycleHistory?.levels_timeline?.map((level) => (
                  <div key={level.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      level.status === 'active' ? 'bg-green-100 text-green-700' :
                      level.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <span className="font-bold">{level.level_number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-on-surface">{level.course_name}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          level.status === 'active' ? 'bg-green-100 text-green-700' :
                          level.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {level.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{level.instructor_name}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(level.start_date).toLocaleDateString()}
                        {level.end_date && ` - ${new Date(level.end_date).toLocaleDateString()}`}
                      </p>
                      <p className="text-sm text-slate-500">{level.enrollment_count} students</p>

                      {/* Level Actions */}
                      {level.status === 'active' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => onCompleteLevel(level.level_number)}
                            className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => onCancelLevel(level.level_number)}
                            className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No level data" message="Level timeline will appear here." icon="layers" />
          )}
        </div>
      )}

      {/* Enrollments Tab */}
      {activeSubTab === 'enrollments' && (
        <div className="space-y-6">
          {/* Enrollment History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-on-surface mb-4">
              Enrollment History ({totalEnrollment} total)
            </h3>
            {enrollmentHistory?.length > 0 ? (
              <div className="space-y-2">
                {enrollmentHistory?.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${
                        enrollment.action === 'enrolled' ? 'text-green-600' :
                        enrollment.action === 'withdrawn' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {enrollment.action === 'enrolled' ? 'person_add' :
                         enrollment.action === 'withdrawn' ? 'person_remove' : 'swap_horiz'}
                      </span>
                      <div>
                        <p className="font-medium text-on-surface">{enrollment.student_name}</p>
                        <p className="text-sm text-slate-500 capitalize">{enrollment.action.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Level {enrollment.level_at_time}</p>
                      <p className="text-sm text-slate-500">{new Date(enrollment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No enrollment history" message="Enrollment records will appear here." icon="people" />
            )}
          </div>

          {/* Instructor History */}
          {instructorHistory?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Instructor Assignments</h3>
              <div className="space-y-2">
                {instructorHistory?.map((instructor) => (
                  <div key={instructor.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">person</span>
                      <div>
                        <p className="font-medium text-on-surface">{instructor.instructor_name}</p>
                        <p className="text-sm text-slate-500 capitalize">{instructor.assignment_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{new Date(instructor.start_date).toLocaleDateString()}</p>
                      {instructor.end_date && (
                        <p className="text-sm text-slate-500">to {new Date(instructor.end_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          {courseHistory?.length > 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Course Assignment History</h3>
              <div className="space-y-3">
                {courseHistory?.map((course, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-on-surface">{course.course_name}</p>
                      <p className="text-sm text-slate-500">
                        Assigned: {new Date(course.assigned_at).toLocaleDateString()}
                      </p>
                      {course.removed_at && (
                        <p className="text-sm text-slate-500">
                          Removed: {new Date(course.removed_at).toLocaleDateString()}
                        </p>
                      )}
                      {course.notes && (
                        <p className="text-sm text-slate-500 mt-1">{course.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No course history" message="Course assignments will appear here." icon="school" />
          )}
        </div>
      )}

      {/* Competitions Tab */}
      {activeSubTab === 'competitions' && (
        <div className="space-y-6">
          {/* Teams */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-on-surface mb-4">Teams ({teams?.length ?? 0})</h3>
            {teams?.length > 0 ? (
              <div className="space-y-2">
                {teams?.map((team) => (
                  <div key={team.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">groups</span>
                      <div>
                        <p className="font-medium text-on-surface">{team.name}</p>
                        <p className="text-sm text-slate-500">{team.competition_name}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{team.members_count} members</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No teams linked" message="Teams linked to this group will appear here." icon="groups" />
            )}
          </div>

          {/* Competition Participation */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-on-surface mb-4">
              Competition Participation ({competitionAnalytics?.total_competitions ?? 0})
            </h3>
            {competitions?.length > 0 ? (
              <div className="space-y-2">
                {competitions?.map((competition) => (
                  <div key={competition.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">emoji_events</span>
                      <div>
                        <p className="font-medium text-on-surface">{competition.competition_name}</p>
                        <p className="text-sm text-slate-500">Level {competition.level_at_time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {competition.result && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          competition.result === 'winner' ? 'bg-yellow-100 text-yellow-700' :
                          competition.result === 'runner_up' ? 'bg-slate-100 text-slate-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {competition.result.replace('_', ' ')}
                        </span>
                      )}
                      <p className="text-sm text-slate-500">
                        {new Date(competition.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No competitions" message="Competition participations will appear here." icon="emoji_events" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryTab
