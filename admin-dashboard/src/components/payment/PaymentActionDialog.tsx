import { useState } from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'
import type { Payment } from '../../services/types/payment'
import {
  approvePaymentApi,
  rejectPaymentApi,
} from '../../services/api/apiClient'

interface PaymentActionDialogProps {
  isOpen: boolean
  mode: 'approve' | 'reject'
  payment: Payment
  onClose: () => void
  onSuccess: () => void
}

export const PaymentActionDialog = ({
  isOpen,
  mode,
  payment,
  onClose,
  onSuccess,
}: PaymentActionDialogProps) => {
  const [adminNotes, setAdminNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const isApprove = mode === 'approve'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      setIsSubmitting(true)
      if (isApprove) {
        await approvePaymentApi(payment.id, adminNotes)
      } else {
        await rejectPaymentApi(payment.id, adminNotes)
      }
      onSuccess()
      onClose()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : `Failed to ${isApprove ? 'approve' : 'reject'} payment.`
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-800 bg-[#0F131C] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                isApprove
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">
                {isApprove ? 'Approve Payment?' : 'Reject Payment?'}
              </h3>
              <p className="text-xs text-gray-400">
                Ref: {payment.referenceNo || payment.transactionRef || payment.id}
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

        <div className="mt-4 text-xs text-gray-300">
          Are you sure you want to {isApprove ? 'approve' : 'reject'} this payment
          {payment.user?.fullName ? (
            <span>
              {' '}for <span className="font-bold text-gray-100">{payment.user.fullName}</span>
            </span>
          ) : null}?
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Admin Note (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add optional notes or justification..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer ${
                isApprove
                  ? 'bg-[#D3AD32] text-gray-950 hover:bg-[#E4C043]'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {isSubmitting
                ? isApprove
                  ? 'Approving...'
                  : 'Rejecting...'
                : isApprove
                ? 'Approve Payment'
                : 'Reject Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentActionDialog
