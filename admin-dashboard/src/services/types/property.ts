export type RoomStatus = 'free' | 'occupied' | 'reserved' | 'maintenance'

export interface Block {
  id: string
  condoId: string
  condoName?: string
  condoCode?: string
  blockNo?: string
  blockName?: string
  blockNumber?: string
  noRooms?: number
  noFloors?: number
  totalFloors?: number
  description?: string
  createdAt?: string
  updatedAt?: string
  _count?: {
    rooms?: number
  }
}

export interface Room {
  id: string
  condoId: string
  condoName?: string
  condoCode?: string
  blockId: string
  roomNumber: string
  floor?: number
  roomType?: string
  status: RoomStatus
  block?: Block
  createdAt?: string
  updatedAt?: string
}

export interface CreateBlockPayload {
  condoId?: string
  blockNo: string
  noRooms: number
  noFloors: number
}

export interface CreateRoomPayload {
  blockId: string
  roomNumber: string
  floor?: number
  roomType?: string
  status?: RoomStatus
}

export interface BlockStatistics {
  blockId: string
  totalRooms: number
  occupiedRooms: number
  freeRooms: number
  reservedRooms: number
}
