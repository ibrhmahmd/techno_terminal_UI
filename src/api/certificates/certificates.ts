import axios from 'axios'
import type {
  CertificatesListResponse,
  CreateCertificateInput,
  CreateCertificateResponse,
  RevokeCertificateInput,
  RevokeCertificateResponse,
  CertificatesQueryParams,
} from './types'

const CERTS_BASE_URL = import.meta.env.DEV
  ? '/certs-api/api/v1'
  : 'https://techno-future-certs.fastapicloud.dev/api/v1'

export const certsClient = axios.create({
  baseURL: CERTS_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export async function listCertificates(params?: CertificatesQueryParams): Promise<CertificatesListResponse> {
  const response = await certsClient.get<CertificatesListResponse>('/certificates', { params })
  return response.data
}

export async function createCertificate(data: CreateCertificateInput): Promise<CreateCertificateResponse> {
  const response = await certsClient.post<CreateCertificateResponse>('/certificates', data)
  return response.data
}

export async function downloadCertificatePdf(certId: string): Promise<Blob> {
  const response = await certsClient.get(`/certificates/${certId}/pdf`, {
    responseType: 'blob',
  })
  return response.data
}

export async function revokeCertificate(certId: string, data: RevokeCertificateInput): Promise<RevokeCertificateResponse> {
  const response = await certsClient.post<RevokeCertificateResponse>(`/certificates/${certId}/revoke`, data)
  return response.data
}
