import type {
  Iddir,
  CreateIddirPayload,
  IddirMember,
  AddIddirMemberPayload,
} from '../types/iddir'
import { fetchWithAuth } from './httpClient'

// Get All Iddirs (GET /api/iddirs or GET /api/iddirs/:condoId/iddirs)
export const getIddirsApi = async (condoId?: string): Promise<Iddir[]> => {
  const endpoint = condoId && condoId !== 'ALL' ? `/api/iddirs/${condoId}/iddirs` : '/api/iddirs'
  const response = await fetchWithAuth(endpoint, {
    method: 'GET',
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch Iddirs.')
  }

  const list = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : []

  return list as Iddir[]
}

// Create Iddir (POST /api/iddirs/:condoId/iddirs)
export const createIddirApi = async (
  condoId: string,
  payload: CreateIddirPayload
): Promise<Iddir> => {
  const response = await fetchWithAuth(`/api/iddirs/${condoId}/iddirs`, {
    method: 'POST',
    body: JSON.stringify({
      condoId,
      name: payload.name,
      startedDate: payload.startedDate,
      contributionAmount: Number(payload.contributionAmount) || 0,
    }),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to create Iddir.')
  }

  return (json.data?.iddir || json.data || json) as Iddir
}

// Get Iddir Members (GET /api/iddir-members or GET /api/iddir-members/:condoId)
export const getIddirMembersApi = async (
  condoId?: string,
  iddirId?: string
): Promise<IddirMember[]> => {
  let endpoint = '/api/iddir-members'

  if (condoId && condoId !== 'ALL') {
    if (iddirId) {
      endpoint = `/api/iddir-members/${condoId}/iddir/${iddirId}`
    } else {
      endpoint = `/api/iddir-members/${condoId}`
    }
  }

  const response = await fetchWithAuth(endpoint, {
    method: 'GET',
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch Iddir members.')
  }

  const list = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : []

  return list as IddirMember[]
}

// Add Iddir Member (POST /api/iddir-members)
export const addIddirMemberApi = async (
  payload: AddIddirMemberPayload
): Promise<IddirMember> => {
  const response = await fetchWithAuth('/api/iddir-members', {
    method: 'POST',
    body: JSON.stringify({
      userId: payload.userId,
      iddirId: payload.iddirId,
    }),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || 'Failed to add user to Iddir.')
  }

  return (json.data?.member || json.data || json) as IddirMember
}
