import type {
  Block,
  Room,
  CreateBlockPayload,
  CreateRoomPayload,
  RoomStatus,
} from '../types/property'
import { fetchWithAuth } from './httpClient'

// Get Blocks (GET /api/blocks/:condoId/blocks)
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

// Create Block (POST /api/blocks/:condoId/blocks)
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


// Get Rooms (GET /api/rooms/:condoId)
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

// Create Room (POST /api/rooms/:condoId)
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

// Update Room Status (PATCH /api/rooms/:condoId/:roomId/status)
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
