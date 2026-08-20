export interface CondoGpsCoordinates {
  latitude?: number
  longitude?: number
  lat?: number
  lng?: number
}

export interface CondoCount {
  users: number
  blocks: number
  rooms: number
}

export interface Condo {
  id: string
  condoCode: string
  condoName: string
  address: string
  city: string
  gpsCoordinates?: CondoGpsCoordinates
  maxAdmins: number
  blockNumbers?: string[]
  activeStatus: boolean
  customSettings?: {
    language?: string
    paymentGateway?: string
    notificationEnabled?: boolean
  }
  registrationDate?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  _count?: CondoCount
}

export interface CreateCondoPayload {
  condoCode: string
  condoName: string
  address: string
  city: string
  maxAdmins: number
  blockNumbers: string[]
}

export interface UpdateCondoPayload {
  condoName?: string
  address?: string
  city?: string
  maxAdmins?: number
}
