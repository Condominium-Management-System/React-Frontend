export interface PaymentUser {
  id?: string
  fullName?: string
  email?: string
  phoneNumber?: string
  fan?: string
}

export interface PaymentCondo {
  id?: string
  condoName?: string
  condoCode?: string
  block?: string
  roomNo?: string
}

export interface Payment {
  id: string
  referenceNo?: string
  transactionRef?: string
  paymentType: 'equb' | 'iddir' | 'guard_fee' | 'service_charge' | string
  amount?: number
  serviceFee?: number
  totalAmount: number
  status: 'pending' | 'approved' | 'rejected' | string
  paymentMethod?: string
  paymentMonth?: string | number
  paymentYear?: string | number
  paymentDate?: string
  createdAt?: string
  approvalDate?: string | null
  adminNotes?: string | null
  user?: PaymentUser
  condo?: PaymentCondo
  userId?: string
  condoId?: string
  block?: string
  roomNo?: string
}

export interface PaymentStatistics {
  totalPayments: number
  pendingPayments: number
  approvedPayments: number
  rejectedPayments: number
}

export interface PaymentsQueryParams {
  page?: number
  limit?: number
  search?: string
  paymentType?: string
  status?: string
  paymentMethod?: string
  condoId?: string
  userId?: string
}
