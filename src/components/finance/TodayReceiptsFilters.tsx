import { ReportDaySelectorBar } from '../reports/molecules/ReportDaySelectorBar'

interface TodayReceiptsFiltersProps {
  date: string
  onDateChange: (date: string) => void
}

export function TodayReceiptsFilters({ date, onDateChange }: TodayReceiptsFiltersProps) {
  return (
    <div className="space-y-4">
      <ReportDaySelectorBar date={date} onDateChange={onDateChange} />
    </div>
  )
}
