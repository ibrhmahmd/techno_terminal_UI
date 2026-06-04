import { useQuery, useMutation } from '@tanstack/react-query'
import { getWeeklyReportData, sendWeeklyReportEmail } from '../../../api/reports/weekly'
import { queryKeys } from '../../../hooks/queryKeys'

export function useWeeklyReportData(date: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.weeklyReport.data(date ?? ''),
    queryFn: () => getWeeklyReportData(date!),
    staleTime: 0,
    enabled: !!date,
    select: (response) => response.data ?? null,
  })
}

export function useSendWeeklyReport() {
  return useMutation({
    mutationFn: ({ date, recipients }: { date: string; recipients: string[] }) =>
      sendWeeklyReportEmail(date, recipients),
  })
}
