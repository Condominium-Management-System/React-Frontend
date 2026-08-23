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

export interface IddirMemberUser {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  role: string
  condoId?: string
  condoCode?: string
  block?: string
  roomNo?: string
  profilePhoto?: string
  isInIddir?: boolean
}

export interface IddirMemberIddirCondo {
  id: string
  condoCode?: string
  condoName?: string
}

export interface IddirMemberIddir {
  id: string
  name: string
  condoId: string
  status: string
  contributionAmount?: number
  startedDate?: string
  noMembers?: number
  condo?: IddirMemberIddirCondo
}

export interface IddirMember {
  id: string
  userId: string
  iddirId: string
  status: 'active' | 'inactive' | 'suspended' | string
  joinedAt: string
  leftAt?: string | null
  totalPaid?: number
  user?: IddirMemberUser
  iddir?: IddirMemberIddir
}

export interface AddIddirMemberPayload {
  userId: string
  iddirId: string
}
