import { Eye, Check, X, Receipt, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import type { Payment } from '../../services/types/payment'

interface PaymentTableProps {
  payments: Payment[]
  isLoading: boolean
  errorMessage: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  startIndexDisplay: number
  endIndexDisplay: number
  onPageChange: (page: number) => void
  onViewDetails: (payment: Payment) => void
  onApprove: (payment: Payment) => void
  onReject: (payment: Payment) => void
  onRetry: () => void
  formatBillingType: (type?: string) => string
  formatCurrency: (val?: number) => string
  formatDate: (dateStr?: string) => string
}

export const PaymentTable = ({
  payments,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  totalItems,
  startIndexDisplay,
  endIndexDisplay,
  onPageChange,
  onViewDetails,
  onApprove,
  onReject,
  onRetry,
  formatBillingType,
  formatCurrency,
  formatDate,
}: PaymentTableProps) => {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="flex h-96 w-full items-center justify-center text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              Loading payments...
            </span>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="p-8 text-center text-gray-400">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-200">Unable to load payments</h3>
          <p className="mt-1 text-xs text-gray-400">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                <th className="py-3.5 px-4 md:px-5">TRANSACTION ID</th>
                <th className="py-3.5 px-4 md:px-5">USER</th>
                <th className="py-3.5 px-4 md:px-5">CONDOMINIUM</th>
                <th className="py-3.5 px-4 md:px-5">BILLING TYPE</th>
                <th className="py-3.5 px-4 md:px-5">AMOUNT</th>
                <th className="py-3.5 px-4 md:px-5">STATUS</th>
                <th className="py-3.5 px-4 md:px-5">DATE</th>
                <th className="py-3.5 px-4 md:px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs md:text-sm">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition-colors hover:bg-[#131926]"
                  >
                    {/* 1. TRANSACTION ID */}
                    <td className="py-3.5 px-4 md:px-5 font-bold font-mono text-gray-100 whitespace-nowrap">
                      {payment.referenceNo || payment.transactionRef || payment.id.slice(0, 8)}
                    </td>

                    {/* 2. USER */}
                    <td className="py-3.5 px-4 md:px-5 font-medium text-gray-200 whitespace-nowrap">
                      {payment.user?.fullName || '—'}
                    </td>

                    {/* 3. CONDOMINIUM */}
                    <td className="py-3.5 px-4 md:px-5 text-gray-300 whitespace-nowrap">
                      {payment.condo?.condoName || payment.condo?.condoCode || payment.condoId || '—'}
                    </td>

                    {/* 4. BILLING TYPE */}
                    <td className="py-3.5 px-4 md:px-5 text-gray-300 whitespace-nowrap">
                      {formatBillingType(payment.paymentType)}
                    </td>

                    {/* 5. AMOUNT */}
                    <td className="py-3.5 px-4 md:px-5 font-bold text-[#D3AD32] whitespace-nowrap">
                      {formatCurrency(payment.totalAmount || payment.amount)}
                    </td>

                    {/* 6. STATUS BADGE */}
                    <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
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
                    </td>

                    {/* 7. DATE */}
                    <td className="py-3.5 px-4 md:px-5 text-gray-400 whitespace-nowrap">
                      {formatDate(payment.paymentDate || payment.createdAt)}
                    </td>

                    {/* 8. ACTIONS */}
                    <td className="py-3.5 px-4 md:px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* Details Action */}
                        <button
                          type="button"
                          title="View Payment Details"
                          onClick={() => onViewDetails(payment)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1 text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </button>

                        {/* Approve & Reject Actions (Pending Only) */}
                        {payment.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              title="Approve Payment"
                              onClick={() => onApprove(payment)}
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              title="Reject Payment"
                              onClick={() => onReject(payment)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty State */
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 px-4 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="h-10 w-10 text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-300">
                        No payments found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Try adjusting your search terms or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !errorMessage && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-800 bg-gray-950/40 px-4 md:px-5 py-3.5 text-xs text-gray-400">
          <div>
            Showing <span className="font-semibold text-gray-200">{startIndexDisplay}</span>-
            <span className="font-semibold text-gray-200">{endIndexDisplay}</span> of{' '}
            <span className="font-semibold text-gray-200">{totalItems}</span> payments
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  pageNum === currentPage
                    ? 'bg-[#D3AD32] text-gray-950 font-bold'
                    : 'border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Button */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentTable
