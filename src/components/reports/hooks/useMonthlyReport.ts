import { useQuery, useMutation } from '@tanstack/react-query'
import { getMonthlyReportData, sendMonthlyReportEmail } from '../../../api/reports/monthly'
import { queryKeys } from '../../../hooks/queryKeys'

export function useMonthlyReportData(date: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.monthlyReport.data(date ?? ''),
    queryFn: () => getMonthlyReportData(date!),
    staleTime: 0,
    enabled: !!date,
    select: (response) => response.data ?? null,
  })
}

export function useSendMonthlyReport() {
  return useMutation({
    mutationFn: ({ date, recipients }: { date: string; recipients: string[] }) =>
      sendMonthlyReportEmail(date, recipients),
  })
}
