import type {
  Condo,
  CreateCondoPayload,
  UpdateCondoPayload,
} from '../types/condo'
import { fetchWithAuth } from './httpClient'

// Get Condominiums (GET /api/condos)
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

// Create Condominium (POST /api/condos)
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

// Update Condominium (PATCH /api/condos/:id)
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

// Delete Condominium (DELETE /api/condos/:id)
export const deleteCondoApi = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`/api/condos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw new Error(json.message || 'Failed to delete condominium.')
  }
}
