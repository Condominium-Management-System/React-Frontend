export type ReportStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
export type ReportCategory = 'plumbing' | 'electrical' | 'structural' | 'security' | 'noise' | 'other'
export type ReportPriority = 'low' | 'medium' | 'high' | 'emergency'

export interface ReportUser {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  profilePhoto?: string
  roomNo?: string
  block?: string
}

export interface ReportResponse {
  id: string
  message: string
  isAdminResponse?: boolean
  user?: ReportUser
  createdAt: string
}

export interface Report {
  id: string
  condoId: string
  title: string
  description: string
  category: ReportCategory
  priority: ReportPriority
  status: ReportStatus
  photoUrl?: string | null
  reporterId: string
  reporter?: ReportUser
  assignedToId?: string | null
  assignedTo?: ReportUser | null
  resolvedAt?: string | null
  resolutionNotes?: string | null
  responses?: ReportResponse[]
  createdAt: string
  updatedAt: string
}

export interface ReportsPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ReportsQueryParams {
  status?: ReportStatus
  category?: ReportCategory
  priority?: ReportPriority
  search?: string
  page?: number
  limit?: number
}

export interface UpdateReportStatusPayload {
  status: ReportStatus
  resolutionNotes?: string
}
