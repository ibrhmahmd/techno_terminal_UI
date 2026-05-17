import { BookOpen, Calendar } from 'lucide-react'

interface CourseHistoryItem {
  level_number: number
  course_name: string
  start_date: string
  end_date?: string
}

interface CoursesHistoryTableProps {
  data: CourseHistoryItem[]
  isLoading: boolean
}

export function CoursesHistoryTable({ data, isLoading }: CoursesHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-secondary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading courses history...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="font-medium">No courses history</p>
        <p className="text-sm mt-1">This group hasn't had any courses yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((course, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-900">{course.course_name}</h4>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 rounded">
                Level {course.level_number}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(course.start_date).toLocaleDateString()} 
                {course.end_date && ` - ${new Date(course.end_date).toLocaleDateString()}`}
                {!course.end_date && ' - Present'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
