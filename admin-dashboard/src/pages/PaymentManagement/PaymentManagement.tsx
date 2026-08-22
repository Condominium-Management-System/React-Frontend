import { useState, useEffect, useMemo, useCallback } from 'react'
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
} from '../../services/api/paymentApi'
import { getCondosApi } from '../../services/api/condoApi'
import PaymentStats from '../../components/payment/PaymentStats'
import PaymentFilters from '../../components/payment/PaymentFilters'
import PaymentTable from '../../components/payment/PaymentTable'
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
      <PaymentStats statistics={statistics} isLoading={isLoadingStats} />

      {/* 3. Search Bar + Filters Row */}
      <PaymentFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
        selectedCondoId={selectedCondoId}
        onCondoChange={handleCondoChange}
        condos={condos}
        isSuperAdmin={isSuperAdmin}
      />

      {/* 4. Main Table Container */}
      <PaymentTable
        payments={paginatedPayments}
        isLoading={isLoadingPayments}
        errorMessage={errorMessage}
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndexDisplay={startIndexDisplay}
        endIndexDisplay={endIndexDisplay}
        onPageChange={setCurrentPage}
        onViewDetails={handleOpenDetails}
        onApprove={handleOpenApprove}
        onReject={handleOpenReject}
        onRetry={handleRefreshAll}
        formatBillingType={formatBillingType}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* 5. Modals */}
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
