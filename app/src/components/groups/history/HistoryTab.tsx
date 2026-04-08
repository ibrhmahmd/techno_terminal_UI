import { useState } from 'react'
import { Users, Trophy, UserCog, BookOpen } from 'lucide-react'
import type { EnrollmentHistoryDTO, CompetitionParticipationDTO, InstructorAssignmentDTO } from '../../../api/academics'
import { EnrollmentHistoryTable } from './EnrollmentHistoryTable'
import { CompetitionRecords } from './CompetitionRecords'
import { InstructorHistoryTable } from './InstructorHistoryTable'
import { CoursesHistoryTable } from './CoursesHistoryTable'
import { HistoryStats } from './HistoryStats'

type HistorySubTab = 'enrollment' | 'competitions' | 'instructors' | 'courses'

interface HistoryTabProps {
  enrollmentHistory: EnrollmentHistoryDTO[]
  competitions: CompetitionParticipationDTO[]
  instructorHistory: InstructorAssignmentDTO[]
  coursesHistory: { level_number: number; course_name: string; start_date: string; end_date?: string }[]
  isLoading: boolean
  totalEnrollment: number
  onEnrollmentPageChange: (skip: number) => void
  enrollmentSkip: number
  enrollmentLimit: number
}

export function HistoryTab({
  enrollmentHistory,
  competitions,
  instructorHistory,
  coursesHistory,
  isLoading,
  totalEnrollment,
  onEnrollmentPageChange,
  enrollmentSkip,
  enrollmentLimit,
}: HistoryTabProps) {
  const [activeTab, setActiveTab] = useState<HistorySubTab>('enrollment')

  const tabs = [
    { id: 'enrollment' as const, label: 'Enrollment', icon: Users, count: totalEnrollment },
    { id: 'competitions' as const, label: 'Competitions', icon: Trophy, count: competitions.length },
    { id: 'instructors' as const, label: 'Instructors', icon: UserCog, count: instructorHistory.length },
    { id: 'courses' as const, label: 'Courses', icon: BookOpen, count: coursesHistory.length },
  ]

  return (
    <div className="space-y-6">
      <HistoryStats
        totalEnrollments={totalEnrollment}
        totalCompetitions={competitions.length}
        totalInstructorChanges={instructorHistory.length}
        totalCourses={coursesHistory.length}
        isLoading={isLoading}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'enrollment' && (
            <EnrollmentHistoryTable
              data={enrollmentHistory}
              isLoading={isLoading}
              total={totalEnrollment}
              skip={enrollmentSkip}
              limit={enrollmentLimit}
              onPageChange={onEnrollmentPageChange}
            />
          )}
          {activeTab === 'competitions' && (
            <CompetitionRecords data={competitions} isLoading={isLoading} />
          )}
          {activeTab === 'instructors' && (
            <InstructorHistoryTable data={instructorHistory} isLoading={isLoading} />
          )}
          {activeTab === 'courses' && (
            <CoursesHistoryTable data={coursesHistory} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  )
}
