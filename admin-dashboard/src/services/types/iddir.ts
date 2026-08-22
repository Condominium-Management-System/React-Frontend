export interface IddirCondo {
  id: string
  condoCode?: string
  condoName?: string
  address?: string
  city?: string
}

export interface IddirCreatedBy {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  role: string
}

export interface IddirCount {
  members?: number
  payments?: number
}

export interface Iddir {
  id: string
  condoId: string
  name: string
  startedDate: string
  contributionAmount: number
  status: 'active' | 'inactive' | string
  noMembers: number
  createdAt?: string
  updatedAt?: string
  condo?: IddirCondo
  createdBy?: IddirCreatedBy
  _count?: IddirCount
}

export interface CreateIddirPayload {
  condoId: string
  name: string
  startedDate: string
  contributionAmount: number
}
