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
