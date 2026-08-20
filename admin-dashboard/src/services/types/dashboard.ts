export interface DashboardData {
  users: {
    total: number
    verified?: number
    unverified?: number
    residents?: number
    guards?: number
    condoAdmins?: number
    superAdmins?: number
    inEqub?: number
    inIddir?: number
  }
  condos: {
    total: number
    active?: number
  }
  blocks: {
    total: number
  }
  rooms: {
    total: number
    occupied?: number
    free?: number
    reserved?: number
  }
  equbs: {
    total: number
    pending?: number
    active?: number
    completed?: number
    cancelled?: number
    totalMembers?: number
    totalPayouts?: number
  }
  iddirs: {
    total: number
    active?: number
    inactive?: number
    totalMembers?: number
  }
  payments: {
    total: number
    pending?: number
    approved?: number
    rejected?: number
    totalApprovedAmount?: number
    byType?: {
      equb?: number
      iddir?: number
      guardFee?: number
      serviceCharge?: number
    }
  }
  transactions: {
    total: number
    completed?: number
    pending?: number
    failed?: number
    reversed?: number
    totalCompletedVolume?: number
  }
  serviceFees: {
    total?: number
    collected?: number
    pending?: number
    totalCollectedAmount: number
  }
  reports: {
    total: number
    reported?: number
    inProgress?: number
    resolved?: number
  }
  lostAndFound?: {
    total: number
    open?: number
    claimed?: number
  }
}
