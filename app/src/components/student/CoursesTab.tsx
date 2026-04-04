import { BookOpen, Calendar, Award, Clock, GraduationCap } from 'lucide-react'
import type { CourseRecord } from '../../api/crm/types'
import { EmptyState } from '../common/EmptyState'

interface CoursesTabProps {
  courses: CourseRecord[]
}

export function CoursesTab({ courses }: CoursesTabProps) {
  // Separate courses by status
  const inProgressCourses = courses.filter(c => c.status === 'in_progress')
  const completedCourses = courses.filter(c => c.status === 'completed')
  const droppedCourses = courses.filter(c => c.status === 'dropped')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Award className="w-5 h-5 text-blue-600" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'dropped':
        return <GraduationCap className="w-5 h-5 text-slate-400" />
      default:
        return <BookOpen className="w-5 h-5 text-slate-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'in_progress':
        return 'bg-amber-100 text-amber-700'
      case 'dropped':
        return 'bg-slate-100 text-slate-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const renderCourseCard = (course: CourseRecord) => (
    <div key={course.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getStatusIcon(course.status)}
          <div>
            <p className="font-semibold text-on-surface">{course.course_name}</p>
            {course.level && (
              <p className="text-sm text-slate-500">Level {course.level}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {course.start_date}
                {course.end_date && ` - ${course.end_date}`}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
            {course.status === 'in_progress' && <Clock className="w-3 h-3" />}
            {course.status === 'completed' && <Award className="w-3 h-3" />}
            {course.status.replace('_', ' ')}
          </span>
          {course.final_grade && (
            <p className="text-sm font-medium text-on-surface mt-2">
              Grade: {course.final_grade}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No course records"
        message="This student has not been enrolled in any courses yet."
        icon="inbox"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Course History</h2>
          <p className="text-sm text-slate-500 mt-1">
            View all courses this student has taken or is currently taking
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Total: <span className="font-medium text-on-surface">{courses.length}</span> courses
        </div>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-amber-50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-on-surface">In Progress</h3>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                {inProgressCourses.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {inProgressCourses.map(renderCourseCard)}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-blue-50">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-on-surface">Completed</h3>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {completedCourses.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {completedCourses.map(renderCourseCard)}
          </div>
        </div>
      )}

      {/* Dropped Courses */}
      {droppedCourses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-on-surface">Dropped</h3>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                {droppedCourses.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {droppedCourses.map(renderCourseCard)}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursesTab
