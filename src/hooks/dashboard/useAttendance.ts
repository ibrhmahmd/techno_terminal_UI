import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelSession, addExtraSession } from '../../api/academics'
import { markAttendance } from '../../api/attendance'
import { dashboardKeys } from './useDashboard'
import type { AttendanceEntry } from '../../api/attendance'

export function useMarkAttendance(sessionId: number, groupId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entries: AttendanceEntry[]) => markAttendance(sessionId, entries),
    onSuccess: () => {
      // Force re-fetch the specific group's sessions
      qc.invalidateQueries({ queryKey: dashboardKeys.sessions(groupId) })
    },
  })
}

export function useCancelSession(date: string, groupId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cancelSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dashboardKeys.schedule(date) })
      qc.invalidateQueries({ queryKey: dashboardKeys.sessions(groupId) })
    },
  })
}

export function useAddExtraSession(groupId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addExtraSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dashboardKeys.sessions(groupId) })
    },
  })
}
