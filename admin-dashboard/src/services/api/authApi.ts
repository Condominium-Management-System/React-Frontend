import type {
  LoginCredentials,
  LoginResponse,
  User,
} from '../types/auth'
import {
  API_BASE_URL,
  fetchWithAuth,
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
} from './httpClient'

// Login
export const loginApi = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  console.log(credentials.email.trim())
  const response = await fetch(`https://backend-a3xi.onrender.com/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  })
  console.log("server reached")
  const json = await response.json()

  if (!response.ok || !json.success) {
    const errorMessage =
      json.message || 'Login failed. Please check your credentials.'
    throw new Error(errorMessage)
  }

  return json as LoginResponse
}

// Logout
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

// Get Profile (GET /api/auth/me)
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

// Update Profile (PATCH /api/auth/me)
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
