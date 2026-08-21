import { Receipt, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { PaymentStatistics } from '../../services/types/payment'

interface PaymentStatsProps {
  statistics: PaymentStatistics | null
  isLoading: boolean
}

export const PaymentStats = ({ statistics, isLoading }: PaymentStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Total Payments */}
      <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Total Payments
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-gray-800" />
          ) : (
            <span className="text-2xl font-black tracking-tight text-gray-100">
              {statistics?.totalPayments ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Card 2: Pending Approvals */}
      <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Pending Approvals
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-gray-800" />
          ) : (
            <span className="text-2xl font-black tracking-tight text-amber-400">
              {statistics?.pendingPayments ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Card 3: Approved Payments */}
      <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Approved Payments
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-gray-800" />
          ) : (
            <span className="text-2xl font-black tracking-tight text-emerald-400">
              {statistics?.approvedPayments ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Card 4: Rejected Payments */}
      <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Rejected Payments
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
            <XCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-gray-800" />
          ) : (
            <span className="text-2xl font-black tracking-tight text-red-400">
              {statistics?.rejectedPayments ?? 0}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentStats
