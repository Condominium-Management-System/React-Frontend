import type { DashboardData } from '../types/dashboard'
import { fetchWithAuth } from './httpClient'

// Get Dashboard (GET /api/admin/dashboard)
export const getDashboardApi = async (): Promise<DashboardData> => {
  const response = await fetchWithAuth('/api/admin/dashboard', {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Unable to load dashboard data.')
  }

  return json.data as DashboardData
}
