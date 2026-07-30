export interface CertificateDTO {
  id: number
  cert_id: string
  student_name: string
  course_name: string
  course_track: string
  level: string
  issue_date: string
  branch: string
  instructor: string | null
  director: string | null
  custom_color: string | null
  revoked_at: string | null
  revoked_reason: string | null
  created_at: string
}

export interface CertificatesListResponse {
  success: boolean
  data: CertificateDTO[]
  total: number
  skip: number
  limit: number
}

export interface CreateCertificateInput {
  student_name: string
  course_track: string
  level: string
  issue_date: string
  branch: string
  instructor?: string
  director?: string
  custom_color?: string
}

export interface CreateCertificateResponse {
  success: boolean
  data: CertificateDTO
  message: string
}

export interface RevokeCertificateInput {
  reason: string
}

export interface RevokeCertificateResponse {
  success: boolean
  data: {
    id: number
    cert_id: string
    revoked_at: string
    revoked_reason: string
  }
  message: string
}

export interface CertificatesQueryParams {
  page?: number
  page_size?: number
  search?: string
  track?: string
  include_revoked?: boolean
}
