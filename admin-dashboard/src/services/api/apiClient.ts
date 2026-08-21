import type {
  AuthSession,
  LoginCredentials,
  LoginResponse,
  User,
} from '../types/auth'
import type { DashboardData } from '../types/dashboard'
import type {
  Condo,
  CreateCondoPayload,
  UpdateCondoPayload,
} from '../types/condo'
import type { CreateUserPayload, UpdateUserPayload } from '../types/user'
import type {
  Payment,
  PaymentStatistics,
  PaymentsQueryParams,
} from '../types/payment'
import type {
  Block,
  Room,
  CreateBlockPayload,
  CreateRoomPayload,
  BlockStatistics,
  RoomStatus,
} from '../types/property'

const STORAGE_KEY = 'homeaxis_auth_session'

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '')
  }
  return 'https://backend-a3xi.onrender.com'
}

export const API_BASE_URL = getApiBaseUrl()

// Session Storage Helpers
export const getStoredSession = (): AuthSession | null => {
  try {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) return JSON.parse(local) as AuthSession

    const session = sessionStorage.getItem(STORAGE_KEY)
    if (session) return JSON.parse(session) as AuthSession
  } catch {
    // Ignore storage parse errors
  }
  return null
}

export const saveStoredSession = (session: AuthSession): void => {
  const data = JSON.stringify(session)
  if (session.rememberMe) {
    localStorage.setItem(STORAGE_KEY, data)
    sessionStorage.removeItem(STORAGE_KEY)
  } else {
    sessionStorage.setItem(STORAGE_KEY, data)
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const clearStoredSession = (): void => {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

// 1. Login Endpoint
export const loginApi = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    const errorMessage =
      json.message || 'Login failed. Please check your credentials.'
    throw new Error(errorMessage)
  }

  return json as LoginResponse
}

// 2. Refresh Token Endpoint
export const refreshTokenApi = async (
  refreshToken: string
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  const json = await response.json()

  if (!response.ok || !json.success || !json.data?.accessToken) {
    throw new Error(json.message || 'Failed to refresh authentication token.')
  }

  const newAccessToken = json.data.accessToken as string

  // Update session in storage if present
  const currentSession = getStoredSession()
  if (currentSession) {
    currentSession.accessToken = newAccessToken
    saveStoredSession(currentSession)
  }

  return newAccessToken
}

// 3. Logout Endpoint
export const logoutApi = async (): Promise<void> => {
  const session = getStoredSession()
  if (!session) {
    clearStoredSession()
    return
  }

  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
  } catch {
    // Ignore network errors on logout - session clears locally regardless
  } finally {
    clearStoredSession()
  }
}

// Prevent concurrent duplicate refresh attempts
let refreshingPromise: Promise<string> | null = null

// 4. Authenticated API Request Wrapper with Auto-Refresh
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const session = getStoredSession()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.accessToken}`)
  }

  let response = await fetch(url, { ...options, headers })

  // Handle 401 Unauthorized -> Attempt Token Refresh
  if (response.status === 401 && session?.refreshToken) {
    try {
      if (!refreshingPromise) {
        refreshingPromise = refreshTokenApi(session.refreshToken).finally(
          () => {
            refreshingPromise = null
          }
        )
      }

      const newAccessToken = await refreshingPromise
      headers.set('Authorization', `Bearer ${newAccessToken}`)

      // Retry original request with new token
      response = await fetch(url, { ...options, headers })
    } catch (refreshErr) {
      clearStoredSession()
      window.location.href = '/login'
      throw refreshErr
    }
  }

  return response
}

// 5. Get Profile Endpoint (GET /api/auth/me)
export const getProfileApi = async (): Promise<User> => {
  const response = await fetchWithAuth('/api/auth/me', {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Unable to load profile.')
  }

  return (json.data?.user || json.data) as User
}

// 6. Update Profile Endpoint (PATCH /api/auth/me)
export const updateProfileApi = async (formData: FormData): Promise<User> => {
  const response = await fetchWithAuth('/api/auth/me', {
    method: 'PATCH',
    body: formData,
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Unable to update profile.')
  }

  const updatedUser = (json.data?.user || json.data) as User

  // Update session in storage if present
  const currentSession = getStoredSession()
  if (currentSession) {
    currentSession.user = {
      ...currentSession.user,
      ...updatedUser,
    }
    saveStoredSession(currentSession)
  }

  return updatedUser
}

// 7. Get Dashboard Endpoint (GET /api/admin/dashboard)
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

// 8. Get Condominiums Endpoint (GET /api/condos)
export const getCondosApi = async (): Promise<Condo[]> => {
  const response = await fetchWithAuth('/api/condos', {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to load condominiums.')
  }

  const condoList = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : []

  return condoList as Condo[]
}

// 9. Create Condominium Endpoint (POST /api/condos)
export const createCondoApi = async (
  payload: CreateCondoPayload
): Promise<Condo> => {
  const response = await fetchWithAuth('/api/condos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to create condominium.')
  }

  return (json.data || json) as Condo
}

// 10. Update Condominium Endpoint (PATCH /api/condos/:id)
export const updateCondoApi = async (
  id: string,
  payload: UpdateCondoPayload
): Promise<Condo> => {
  const response = await fetchWithAuth(`/api/condos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to update condominium.')
  }

  return (json.data || json) as Condo
}

// 11. Delete Condominium Endpoint (DELETE /api/condos/:id)
export const deleteCondoApi = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`/api/condos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw new Error(json.message || 'Failed to delete condominium.')
  }
}

// 12. Get Users Endpoint (GET /api/users)
export const getUsersApi = async (): Promise<User[]> => {
  const response = await fetchWithAuth('/api/users', {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to load users.')
  }

  const userList = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : []

  return userList as User[]
}

// 13. Create User Endpoint (POST /api/auth/register)
export const createUserApi = async (
  payload: CreateUserPayload
): Promise<User> => {
  const response = await fetchWithAuth('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to create user.')
  }

  return (json.data?.user || json.data || json) as User
}

// 14. Update User Endpoint (PATCH /api/users/:condoId/:userId)
export const updateUserApi = async (
  condoId: string,
  userId: string,
  payload: UpdateUserPayload
): Promise<User> => {
  const response = await fetchWithAuth(`/api/users/${condoId}/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to update user information.')
  }

  return (json.data?.user || json.data || json) as User
}

// 15. Update User Role Endpoint (PATCH /api/users/:condoId/:userId/role)
export const updateUserRoleApi = async (
  condoId: string,
  userId: string,
  role: string
): Promise<User> => {
  const response = await fetchWithAuth(`/api/users/${condoId}/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to update user role.')
  }

  return (json.data?.user || json.data || json) as User
}

// 16. Delete User Endpoint (DELETE /api/users/:condoId/:userId)
export const deleteUserApi = async (
  condoId: string,
  userId: string
): Promise<void> => {
  const response = await fetchWithAuth(`/api/users/${condoId}/${userId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw new Error(json.message || 'Failed to delete user.')
  }
}

// 17. Get Payment Statistics (GET /api/payments/statistics)
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

// 18. Get Payments Endpoint (GET /api/payments)
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

// 19. Get Individual Payment Endpoint (GET /api/payments/:id)
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

// 20. Approve Payment Endpoint (PATCH /api/payments/:id/approve)
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

// 21. Reject Payment Endpoint (PATCH /api/payments/:id/reject)
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

// 22. Create Block Endpoint (POST /api/blocks/:condoId/blocks)
export const createBlockApi = async (
  condoId: string,
  payload: CreateBlockPayload
): Promise<Block> => {
  const body = {
    condoId,
    blockNo: payload.blockNo,
    noRooms: Number(payload.noRooms) || 1,
    noFloors: Number(payload.noFloors) || 1,
  }
  const response = await fetchWithAuth(`/api/blocks/${condoId}/blocks`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to create block.')
  }

  return (json.data?.block || json.data || json) as Block
}

// 23. Get Block Statistics Endpoint (GET /api/blocks/:condoId/blocks/:blockId/statistics)
export const getBlockStatisticsApi = async (
  condoId: string,
  blockId: string
): Promise<BlockStatistics> => {
  const response = await fetchWithAuth(
    `/api/blocks/${condoId}/blocks/${blockId}/statistics`,
    {
      method: 'GET',
    }
  )

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Unable to load block statistics.')
  }

  const stats = json.data || json
  return {
    blockId,
    totalRooms: stats.totalRooms ?? stats.total ?? 0,
    occupiedRooms: stats.occupiedRooms ?? stats.occupied ?? 0,
    freeRooms: stats.freeRooms ?? stats.free ?? 0,
    reservedRooms: stats.reservedRooms ?? stats.reserved ?? 0,
  }
}

// 24. Create Room Endpoint (POST /api/rooms/:condoId)
export const createRoomApi = async (
  condoId: string,
  payload: CreateRoomPayload
): Promise<Room> => {
  const body = {
    ...payload,
    condoId,
  }
  const response = await fetchWithAuth(`/api/rooms/${condoId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to create unit/room.')
  }

  return (json.data?.room || json.data || json) as Room
}

// 25. Update Room Status Endpoint (PATCH /api/rooms/:condoId/:roomId/status)
export const updateRoomStatusApi = async (
  condoId: string,
  roomId: string,
  status: RoomStatus
): Promise<Room> => {
  const response = await fetchWithAuth(`/api/rooms/${condoId}/${roomId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to update unit status.')
  }

  return (json.data?.room || json.data || json) as Room
}

// 26. Get Blocks Endpoint (GET /api/blocks/:condoId/blocks)
export const getBlocksApi = async (condoId: string): Promise<Block[]> => {
  const response = await fetchWithAuth(`/api/blocks/${condoId}/blocks`, {
    method: 'GET',
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    return []
  }

  const list = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : []

  return list as Block[]
}

// 27. Get Rooms Endpoint (GET /api/rooms/:condoId)
export const getRoomsApi = async (
  condoId: string,
  blockId?: string
): Promise<Room[]> => {
  const queryString = blockId ? `?blockId=${blockId}` : ''
  const response = await fetchWithAuth(`/api/rooms/${condoId}${queryString}`, {
    method: 'GET',
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    return []
  }

  const list = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : []

  return list as Room[]
}

