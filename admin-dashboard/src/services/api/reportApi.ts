import type {
  Report,
  ReportsQueryParams,
  UpdateReportStatusPayload,
  AddReportResponsePayload,
  ReportResponse,
} from '../types/report'
import { fetchWithAuth } from './httpClient'

// Get All Reports for Admin (GET /api/reports/admin/all)
export const getAdminReportsApi = async (
  params: ReportsQueryParams = {}
): Promise<{ reports: Report[]; total: number; page: number; totalPages: number }> => {
  const query = new URLSearchParams()
  if (params.page) query.append('page', String(params.page))
  if (params.limit) query.append('limit', String(params.limit))
  if (params.search && params.search.trim()) query.append('search', params.search.trim())
  if (params.status && params.status !== 'ALL' && params.status !== 'all') {
    query.append('status', params.status)
  }
  if (params.category && params.category !== 'ALL' && params.category !== 'all') {
    query.append('category', params.category)
  }
  if (params.priority && params.priority !== 'ALL' && params.priority !== 'all') {
    query.append('priority', params.priority)
  }

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const response = await fetchWithAuth(`/api/reports/admin/all${queryString}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to load maintenance reports.')
  }

  const data = json.data || {}
  const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
  const pagination = data.pagination || {}

  return {
    reports: items as Report[],
    total: pagination.total || items.length,
    page: pagination.page || 1,
    totalPages: pagination.totalPages || 1,
  }
}

// Get Report by ID (GET /api/reports/:id)
export const getReportByIdApi = async (id: string): Promise<Report> => {
  const response = await fetchWithAuth(`/api/reports/${id}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to load report details.')
  }

  return (json.data?.report || json.data) as Report
}

// Update Report Status (PUT /api/reports/:id/status)
export const updateReportStatusApi = async (
  id: string,
  payload: UpdateReportStatusPayload
): Promise<Report> => {
  const response = await fetchWithAuth(`/api/reports/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to update report status.')
  }

  return (json.data?.report || json.data) as Report
}

// Add Response to Report (POST /api/reports/:id/response)
export const addReportResponseApi = async (
  id: string,
  payload: AddReportResponsePayload
): Promise<ReportResponse> => {
  const response = await fetchWithAuth(`/api/reports/${id}/response`, {
    method: 'POST',
    body: JSON.stringify({
      message: payload.message.trim(),
      isAdminResponse: payload.isAdminResponse ?? true,
    }),
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to submit response.')
  }

  return (json.data?.response || json.data) as ReportResponse
}
