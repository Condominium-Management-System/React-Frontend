import type {
  Payment,
  PaymentStatistics,
  PaymentsQueryParams,
} from '../types/payment'
import { fetchWithAuth } from './httpClient'

// Get Payment Statistics (GET /api/payments/statistics)
export const getPaymentStatisticsApi = async (): Promise<PaymentStatistics> => {
  const response = await fetchWithAuth('/api/payments/statistics', {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Unable to load payment statistics.')
  }

  const stats = json.data || json
  return {
    totalPayments: stats.totalPayments ?? stats.total ?? 0,
    pendingPayments: stats.pendingPayments ?? stats.pending ?? 0,
    approvedPayments: stats.approvedPayments ?? stats.approved ?? 0,
    rejectedPayments: stats.rejectedPayments ?? stats.rejected ?? 0,
  }
}

// Get Payments (GET /api/payments)
export const getPaymentsApi = async (
  params: PaymentsQueryParams = {}
): Promise<{ payments: Payment[]; total: number }> => {
  const query = new URLSearchParams()
  if (params.page) query.append('page', String(params.page))
  if (params.limit) query.append('limit', String(params.limit))
  if (params.search && params.search.trim()) query.append('search', params.search.trim())
  if (params.paymentType && params.paymentType !== 'ALL' && params.paymentType !== 'all') {
    query.append('paymentType', params.paymentType)
  }
  if (params.status && params.status !== 'ALL' && params.status !== 'all') {
    query.append('status', params.status)
  }
  if (
    params.paymentMethod &&
    params.paymentMethod !== 'ALL' &&
    params.paymentMethod !== 'all'
  ) {
    const validMethods = ['cbe', 'telebirr', 'cash', 'bank_transfer', 'others']
    const normalizedMethod = params.paymentMethod.toLowerCase()
    if (validMethods.includes(normalizedMethod)) {
      query.append('paymentMethod', normalizedMethod)
    }
  }
  if (params.condoId && params.condoId !== 'ALL' && params.condoId !== 'all') {
    query.append('condoId', params.condoId)
  }
  if (params.userId) query.append('userId', params.userId)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const response = await fetchWithAuth(`/api/payments${queryString}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to load payments.')
  }

  const rawData = json.data
  let paymentList: Payment[] = []
  let totalCount = 0

  if (Array.isArray(rawData)) {
    paymentList = rawData
    totalCount = json.total || json.count || paymentList.length
  } else if (rawData && typeof rawData === 'object') {
    if (Array.isArray(rawData.payments)) {
      paymentList = rawData.payments
      totalCount = rawData.total || rawData.count || paymentList.length
    } else if (Array.isArray(rawData.data)) {
      paymentList = rawData.data
      totalCount = rawData.total || rawData.count || paymentList.length
    }
  } else if (Array.isArray(json)) {
    paymentList = json
    totalCount = paymentList.length
  }

  return {
    payments: paymentList,
    total: totalCount,
  }
}

// Get Individual Payment (GET /api/payments/:id)
export const getPaymentByIdApi = async (id: string): Promise<Payment> => {
  const response = await fetchWithAuth(`/api/payments/${id}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Unable to load payment details.')
  }

  return (json.data?.payment || json.data || json) as Payment
}

// Approve Payment (PATCH /api/payments/:id/approve)
export const approvePaymentApi = async (
  id: string,
  adminNotes?: string
): Promise<Payment> => {
  const body = adminNotes ? { adminNotes: adminNotes.trim() } : {}
  const response = await fetchWithAuth(`/api/payments/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to approve payment.')
  }

  return (json.data?.payment || json.data || json) as Payment
}

// Reject Payment (PATCH /api/payments/:id/reject)
export const rejectPaymentApi = async (
  id: string,
  adminNotes?: string
): Promise<Payment> => {
  const body = adminNotes ? { adminNotes: adminNotes.trim() } : {}
  const response = await fetchWithAuth(`/api/payments/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to reject payment.')
  }

  return (json.data?.payment || json.data || json) as Payment
}
