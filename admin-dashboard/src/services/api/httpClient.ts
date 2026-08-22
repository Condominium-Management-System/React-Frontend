import type { AuthSession } from '../types/auth'

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

// Refresh Token Endpoint
const refreshTokenApi = async (
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

// Prevent concurrent duplicate refresh attempts
let refreshingPromise: Promise<string> | null = null

// Authenticated API Request Wrapper with Auto-Refresh
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
