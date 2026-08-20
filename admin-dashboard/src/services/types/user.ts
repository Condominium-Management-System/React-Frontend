import type { User } from './auth'

export interface CreateUserPayload {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  fan: string
  condoCode: string
}

export interface UpdateUserPayload {
  fullName?: string
  email?: string
  phoneNumber?: string
  fan?: string
  condoId?: string
  block?: string
  roomNo?: string
  dueDate?: string
  isVerified?: boolean
}

export interface GetUsersResponse {
  success: boolean
  count?: number
  data: User[]
}
