import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listCertificates,
  createCertificate,
  downloadCertificatePdf,
  revokeCertificate,
} from '../api/certificates'
import { queryKeys } from './queryKeys'
import type {
  CertificatesQueryParams,
  CreateCertificateInput,
  RevokeCertificateInput,
} from '../api/certificates/types'

export function useCertificatesList(params?: CertificatesQueryParams) {
  return useQuery({
    queryKey: queryKeys.certificates.list(params as Record<string, unknown> | undefined),
    queryFn: () => listCertificates(params),
    staleTime: 60_000,
    gcTime: 300_000,
  })
}

export function useCreateCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCertificateInput) => createCertificate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.certificates.all })
    },
  })
}

export function useDownloadCertificatePdf() {
  return useMutation({
    mutationFn: (certId: string) => downloadCertificatePdf(certId),
  })
}

export function useRevokeCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ certId, data }: { certId: string; data: RevokeCertificateInput }) =>
      revokeCertificate(certId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.certificates.all })
    },
  })
}
