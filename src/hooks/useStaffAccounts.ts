import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStaffAccounts, createEmployeeAccount } from '../api/hr/staff-accounts'
import type { CreateEmployeeAccountRequest } from '../api/hr/types'

export const staffAccountKeys = {
  all: ['staff', 'accounts'] as const,
}

export function useStaffAccounts() {
  return useQuery({
    queryKey: staffAccountKeys.all,
    queryFn: async () => {
      const response = await getStaffAccounts()
      return response.data
    },
  })
}

export function useCreateEmployeeAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: number; data: CreateEmployeeAccountRequest }) => {
      const response = await createEmployeeAccount(employeeId, data)
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffAccountKeys.all })
    },
  })
}
