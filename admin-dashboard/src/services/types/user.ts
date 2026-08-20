import type { User } from './auth'

export interface CreateUserPayload {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  fan: string
  condoCode: string
}

export interface GetUsersResponse {
  success: boolean
  count?: number
  data: User[]
}
