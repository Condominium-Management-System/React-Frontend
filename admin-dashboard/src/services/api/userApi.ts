import type { User } from '../types/auth'
import type { CreateUserPayload, UpdateUserPayload } from '../types/user'
import { fetchWithAuth, getStoredSession } from './httpClient'

// Get Users
// Super Admin: GET /api/admin/users (system-wide) or GET /api/users/:condoId (scoped)
// Condo Admin: GET /api/users/:condoId (scoped to authUser.condoId)
export const getUsersApi = async (condoId?: string): Promise<User[]> => {
  const session = getStoredSession()
  const role = session?.user?.role
  const userCondoId = session?.user?.condoId
  const targetCondoId = condoId || userCondoId

  let endpoint = '/api/admin/users'

  if (role === 'condo_admin') {
    if (!targetCondoId) {
      throw new Error('Your account is not assigned to a condominium.')
    }
    endpoint = `/api/users/${targetCondoId}`
  } else if (role === 'super_admin') {
    if (condoId) {
      endpoint = `/api/users/${condoId}`
    } else {
      endpoint = '/api/admin/users'
    }
  } else {
    endpoint = targetCondoId ? `/api/users/${targetCondoId}` : '/api/admin/users'
  }

  const response = await fetchWithAuth(endpoint, {
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

// Create User (POST /api/auth/register)
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

// Update User (PATCH /api/users/:condoId/:userId)
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

// Update User Role (PATCH /api/users/:condoId/:userId/role)
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

// Delete User (DELETE /api/users/:condoId/:userId)
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
