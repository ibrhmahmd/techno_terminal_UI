import { useQuery, useMutation } from '@tanstack/react-query'
import { getDailyReportData, getDailyReportPdf, sendDailyReportEmail } from '../../../api/reports/daily'
import { queryKeys } from '../../../hooks/queryKeys'

export function useDailyReportData(date: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.dailyReport.data(date ?? ''),
    queryFn: () => getDailyReportData(date!),
    staleTime: 0,
    enabled: !!date,
    select: (response) => response.data ?? null,
  })
}

export function useDailyReportPdf() {
  return useMutation({
    mutationFn: (date: string) => getDailyReportPdf(date),
  })
}

export function useSendDailyReport() {
  return useMutation({
    mutationFn: ({ date, recipients }: { date: string; recipients: string[] }) =>
      sendDailyReportEmail(date, recipients),
  })
}
