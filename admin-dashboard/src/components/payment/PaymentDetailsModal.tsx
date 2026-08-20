import { useState, useEffect } from 'react'
import { X, Receipt, AlertCircle } from 'lucide-react'
import type { Payment } from '../../services/types/payment'
import { getPaymentByIdApi } from '../../services/api/apiClient'

interface PaymentDetailsModalProps {
  isOpen: boolean
  paymentId: string
  initialPayment?: Payment
  onClose: () => void
}

export const PaymentDetailsModal = ({
  isOpen,
  paymentId,
  initialPayment,
  onClose,
}: PaymentDetailsModalProps) => {
  const [payment, setPayment] = useState<Payment | null>(initialPayment || null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !paymentId) return

    const fetchDetails = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const data = await getPaymentByIdApi(paymentId)
        setPayment(data)
      } catch (err) {
        // Fallback to initial payment object if individual fetch is restricted/fails
        if (initialPayment) {
          setPayment(initialPayment)
        } else {
          const msg = err instanceof Error ? err.message : 'Failed to load payment details.'
          setErrorMessage(msg)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [isOpen, paymentId, initialPayment])

  if (!isOpen) return null

  // Helper formatters
  const formatBillingType = (type?: string) => {
    switch (type) {
      case 'equb':
        return 'Equb'
      case 'iddir':
        return 'Iddir'
      case 'guard_fee':
        return 'Guard Fee'
      case 'service_charge':
        return 'Service Charge'
      default:
        return type ? type.replace(/_/g, ' ') : '—'
    }
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'ETB 0'
    return `ETB ${val.toLocaleString('en-US')}`
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-[#0F131C] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">
                Payment Details
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                {payment?.referenceNo || payment?.transactionRef || paymentId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-48 w-full items-center justify-center text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
              <span className="text-xs">Loading payment details...</span>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : payment ? (
          <div className="mt-5 space-y-5 text-xs text-gray-300">
            {/* 1. Transaction Summary */}
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    payment.status === 'approved'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : payment.status === 'rejected'
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {payment.status ? payment.status.toUpperCase() : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction Reference:</span>
                <span className="font-mono text-gray-100">
                  {payment.referenceNo || payment.transactionRef || '—'}
                </span>
              </div>
            </div>

            {/* 2. User Information */}
            <div>
              <h4 className="font-bold text-gray-200 border-b border-gray-800 pb-1 mb-2">
                USER INFORMATION
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block">Full Name:</span>
                  <span className="text-gray-100 font-semibold">
                    {payment.user?.fullName || '—'}
                  </span>
                </div>
                {payment.user?.email && (
                  <div>
                    <span className="text-gray-400 block">Email:</span>
                    <span className="text-gray-200">{payment.user.email}</span>
                  </div>
                )}
                {payment.user?.phoneNumber && (
                  <div>
                    <span className="text-gray-400 block">Phone:</span>
                    <span className="text-gray-200 font-mono">
                      {payment.user.phoneNumber}
                    </span>
                  </div>
                )}
                {payment.user?.fan && (
                  <div>
                    <span className="text-gray-400 block">FAN:</span>
                    <span className="text-gray-200 font-mono">
                      {payment.user.fan}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Condominium Information */}
            <div>
              <h4 className="font-bold text-gray-200 border-b border-gray-800 pb-1 mb-2">
                CONDOMINIUM INFORMATION
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block">Condominium:</span>
                  <span className="text-gray-100 font-semibold">
                    {payment.condo?.condoName || payment.condoId || '—'}
                  </span>
                </div>
                {payment.condo?.condoCode && (
                  <div>
                    <span className="text-gray-400 block">Condo Code:</span>
                    <span className="text-[#D3AD32] font-mono font-bold">
                      {payment.condo.condoCode}
                    </span>
                  </div>
                )}
                {(payment.condo?.block || payment.block) && (
                  <div>
                    <span className="text-gray-400 block">Block:</span>
                    <span className="text-gray-200">
                      {payment.condo?.block || payment.block}
                    </span>
                  </div>
                )}
                {(payment.condo?.roomNo || payment.roomNo) && (
                  <div>
                    <span className="text-gray-400 block">Room:</span>
                    <span className="text-gray-200">
                      {payment.condo?.roomNo || payment.roomNo}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Payment Information */}
            <div>
              <h4 className="font-bold text-gray-200 border-b border-gray-800 pb-1 mb-2">
                PAYMENT INFORMATION
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block">Payment Type:</span>
                  <span className="text-gray-200">
                    {formatBillingType(payment.paymentType)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Amount:</span>
                  <span className="text-[#D3AD32] font-bold text-sm">
                    {formatCurrency(payment.totalAmount || payment.amount)}
                  </span>
                </div>
                {payment.serviceFee !== undefined && payment.serviceFee > 0 && (
                  <div>
                    <span className="text-gray-400 block">Service Fee:</span>
                    <span className="text-gray-200">
                      {formatCurrency(payment.serviceFee)}
                    </span>
                  </div>
                )}
                {payment.paymentMethod && (
                  <div>
                    <span className="text-gray-400 block">Payment Method:</span>
                    <span className="text-gray-200">
                      {payment.paymentMethod}
                    </span>
                  </div>
                )}
                {(payment.paymentMonth || payment.paymentYear) && (
                  <div>
                    <span className="text-gray-400 block">Billing Period:</span>
                    <span className="text-gray-200">
                      {payment.paymentMonth} {payment.paymentYear}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block">Payment Date:</span>
                  <span className="text-gray-200">
                    {formatDate(payment.paymentDate || payment.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Admin Notes / Info if present */}
            {(payment.approvalDate || payment.adminNotes) && (
              <div>
                <h4 className="font-bold text-gray-200 border-b border-gray-800 pb-1 mb-2">
                  ADMINISTRATION RECORD
                </h4>
                <div className="space-y-1">
                  {payment.approvalDate && (
                    <div>
                      <span className="text-gray-400">Action Date: </span>
                      <span className="text-gray-200">
                        {formatDate(payment.approvalDate)}
                      </span>
                    </div>
                  )}
                  {payment.adminNotes && (
                    <div>
                      <span className="text-gray-400 block">Admin Notes:</span>
                      <p className="mt-0.5 rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-gray-300">
                        {payment.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-gray-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetailsModal
