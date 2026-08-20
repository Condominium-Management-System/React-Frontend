import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import type {
  Payment,
  PaymentStatistics,
  PaymentsQueryParams,
} from '../../services/types/payment'
import type { Condo } from '../../services/types/condo'
import {
  getPaymentsApi,
  getPaymentStatisticsApi,
  getCondosApi,
} from '../../services/api/apiClient'
import PaymentDetailsModal from '../../components/payment/PaymentDetailsModal'
import PaymentActionDialog from '../../components/payment/PaymentActionDialog'

const ITEMS_PER_PAGE = 8

export const PaymentManagement = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  // Data States
  const [payments, setPayments] = useState<Payment[]>([])
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null)
  const [condos, setCondos] = useState<Condo[]>([])

  // Loading & Error States
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedMethod, setSelectedMethod] = useState('ALL')
  const [selectedCondoId, setSelectedCondoId] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal States
  const [selectedDetailsPayment, setSelectedDetailsPayment] = useState<Payment | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const [selectedActionPayment, setSelectedActionPayment] = useState<Payment | null>(null)
  const [actionDialogMode, setActionDialogMode] = useState<'approve' | 'reject'>('approve')
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)

  // 1. Fetch Statistics from Backend
  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      const stats = await getPaymentStatisticsApi()
      setStatistics(stats)
    } catch {
      // Keep UI functional even if stats fail
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // 2. Fetch Condominiums list for Super Admin dropdown filter
  const fetchCondosList = useCallback(async () => {
    if (!isSuperAdmin) return
    try {
      const data = await getCondosApi()
      setCondos(data)
    } catch {
      // Ignore condo fetch errors in filter
    }
  }, [isSuperAdmin])

  // 3. Fetch Payments list from Backend
  const fetchPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true)
      setErrorMessage(null)

      const params: PaymentsQueryParams = {
        page: 1,
        limit: 100, // Fetch up to 100 for comprehensive search and filtering
        paymentType: selectedType,
        status: selectedStatus,
        paymentMethod: selectedMethod,
        condoId: isSuperAdmin ? selectedCondoId : undefined,
      }

      const response = await getPaymentsApi(params)
      setPayments(response.payments)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load payments.'
      setErrorMessage(msg)
    } finally {
      setIsLoadingPayments(false)
    }
  }, [
    selectedType,
    selectedStatus,
    selectedMethod,
    selectedCondoId,
    isSuperAdmin,
  ])

  useEffect(() => {
    fetchStatistics()
    fetchCondosList()
  }, [fetchStatistics, fetchCondosList])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Refresh handler for both list and statistics
  const handleRefreshAll = () => {
    fetchPayments()
    fetchStatistics()
  }

  // Formatters
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

  // Filter payments based on search, type, status, method, and condo
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // 1. Search Query filter
      const query = searchQuery.trim().toLowerCase()
      let matchesSearch = true
      if (query) {
        const txnId = (
          payment.referenceNo ||
          payment.transactionRef ||
          payment.id ||
          ''
        ).toLowerCase()
        const userName = (payment.user?.fullName || '').toLowerCase()
        const condoName = (
          payment.condo?.condoName ||
          payment.condo?.condoCode ||
          payment.condoId ||
          ''
        ).toLowerCase()
        const typeStr = formatBillingType(payment.paymentType).toLowerCase()
        const amountNum = payment.totalAmount ?? payment.amount ?? 0
        const amountStr = String(amountNum)
        const statusStr = (payment.status || '').toLowerCase()
        const methodStr = (payment.paymentMethod || '').toLowerCase()
        const dateStr = formatDate(payment.paymentDate || payment.createdAt).toLowerCase()

        matchesSearch =
          txnId.includes(query) ||
          userName.includes(query) ||
          condoName.includes(query) ||
          typeStr.includes(query) ||
          amountStr.includes(query) ||
          statusStr.includes(query) ||
          methodStr.includes(query) ||
          dateStr.includes(query)
      }

      // 2. Type filter
      const matchesType =
        selectedType === 'ALL' || payment.paymentType === selectedType

      // 3. Status filter
      const matchesStatus =
        selectedStatus === 'ALL' || payment.status === selectedStatus

      // 4. Method filter
      const matchesMethod =
        selectedMethod === 'ALL' ||
        (payment.paymentMethod || '').toLowerCase() === selectedMethod.toLowerCase()

      // 5. Condo filter
      const matchesCondo =
        !isSuperAdmin ||
        selectedCondoId === 'ALL' ||
        payment.condoId === selectedCondoId ||
        payment.condo?.id === selectedCondoId

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesMethod &&
        matchesCondo
      )
    })
  }, [
    payments,
    searchQuery,
    selectedType,
    selectedStatus,
    selectedMethod,
    selectedCondoId,
    isSuperAdmin,
  ])

  // Pagination calculations
  const totalItems = filteredPayments.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndexDisplay =
    totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1
  const endIndexDisplay = Math.min(
    validCurrentPage * ITEMS_PER_PAGE,
    totalItems
  )

  const paginatedPayments = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredPayments, validCurrentPage])

  // Filter change handlers (Reset page to 1 on filter/search changes)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value)
    setCurrentPage(1)
  }

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMethod(e.target.value)
    setCurrentPage(1)
  }

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCondoId(e.target.value)
    setCurrentPage(1)
  }

  // Modal Triggers
  const handleOpenDetails = (payment: Payment) => {
    setSelectedDetailsPayment(payment)
    setIsDetailsModalOpen(true)
  }

  const handleOpenApprove = (payment: Payment) => {
    setSelectedActionPayment(payment)
    setActionDialogMode('approve')
    setIsActionDialogOpen(true)
  }

  const handleOpenReject = (payment: Payment) => {
    setSelectedActionPayment(payment)
    setActionDialogMode('reject')
    setIsActionDialogOpen(true)
  }

  return (
    <div className="space-y-6 select-none">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-100">
          Payment Tracking & Invoices
        </h1>
        <p className="mt-1 text-xs md:text-sm text-gray-400">
          Monitor incoming dues, monthly maintenance collections, and utilities.
        </p>
      </div>

      {/* 2. Statistics Cards Grid (4 Cards) */}
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
            {isLoadingStats ? (
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
            {isLoadingStats ? (
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
            {isLoadingStats ? (
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
            {isLoadingStats ? (
              <div className="h-7 w-20 animate-pulse rounded bg-gray-800" />
            ) : (
              <span className="text-2xl font-black tracking-tight text-red-400">
                {statistics?.rejectedPayments ?? 0}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Search Bar + Filters Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search payments..."
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
          />
        </div>

        {/* Payment Type Filter */}
        <div className="w-full lg:w-44 shrink-0">
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
          >
            <option value="ALL">Type: All Payments</option>
            <option value="equb">Equb</option>
            <option value="iddir">Iddir</option>
            <option value="guard_fee">Guard Fee</option>
            <option value="service_charge">Service Charge</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-36 shrink-0">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Method Filter */}
        <div className="w-full lg:w-40 shrink-0">
          <select
            value={selectedMethod}
            onChange={handleMethodChange}
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
          >
            <option value="ALL">Method: All</option>
            <option value="cbe">CBE</option>
            <option value="telebirr">Telebirr</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="others">Others</option>
          </select>
        </div>

        {/* Condominium Filter (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="w-full lg:w-48 shrink-0">
            <select
              value={selectedCondoId}
              onChange={handleCondoChange}
              className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="ALL">Condominium: All</option>
              {condos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.condoName} ({c.condoCode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. Main Table Container */}
      <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden">
        {isLoadingPayments ? (
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
              onClick={handleRefreshAll}
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
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment) => (
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
                            onClick={() => handleOpenDetails(payment)}
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
                                onClick={() => handleOpenApprove(payment)}
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                title="Reject Payment"
                                onClick={() => handleOpenReject(payment)}
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

        {/* 5. Pagination Footer */}
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
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  pageNum === validCurrentPage
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
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Modals */}
      {selectedDetailsPayment && (
        <PaymentDetailsModal
          isOpen={isDetailsModalOpen}
          paymentId={selectedDetailsPayment.id}
          initialPayment={selectedDetailsPayment}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedDetailsPayment(null)
          }}
        />
      )}

      {selectedActionPayment && (
        <PaymentActionDialog
          isOpen={isActionDialogOpen}
          mode={actionDialogMode}
          payment={selectedActionPayment}
          onClose={() => {
            setIsActionDialogOpen(false)
            setSelectedActionPayment(null)
          }}
          onSuccess={handleRefreshAll}
        />
      )}
    </div>
  )
}

export default PaymentManagement
