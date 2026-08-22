import { useState, useEffect, useCallback } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import type { Report } from '../../services/types/report'
import { getAdminReportsApi } from '../../services/api/reportApi'
import ReportFilters from '../../components/report/ReportFilters'
import ReportTable from '../../components/report/ReportTable'
import ReportDetailsModal from '../../components/report/ReportDetailsModal'

const ITEMS_PER_PAGE = 10

export const Reports = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Selected Report for Details Modal
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)

      const response = await getAdminReportsApi({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      })

      setReports(response.reports)
      setTotalItems(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load maintenance reports.'
      setErrorMessage(msg)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter, categoryFilter, priorityFilter])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category)
    setCurrentPage(1)
  }

  const handlePriorityChange = (priority: string) => {
    setPriorityFilter(priority)
    setCurrentPage(1)
  }

  const handleViewDetails = (report: Report) => {
    setSelectedReportId(report.id)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedReportId(null)
  }

  return (
    <div className="space-y-6">
      {/* Action Header & Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between select-none">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#D3AD32]" />
            <h1 className="text-xl font-bold text-gray-100 tracking-tight">Maintenance Reports</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Review resident maintenance requests, assign tasks, update statuses, and log responses.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-gray-700 hover:bg-gray-800 hover:text-[#D3AD32] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Bar */}
      <ReportFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={statusFilter}
        onStatusChange={handleStatusChange}
        selectedCategory={categoryFilter}
        onCategoryChange={handleCategoryChange}
        selectedPriority={priorityFilter}
        onPriorityChange={handlePriorityChange}
      />

      {/* Reports Table */}
      <ReportTable
        reports={reports}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onViewDetails={handleViewDetails}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      {/* Report Details & Activity Modal */}
      <ReportDetailsModal
        isOpen={isDetailsModalOpen}
        reportId={selectedReportId}
        onClose={handleCloseDetailsModal}
        onReportUpdated={loadReports}
      />
    </div>
  )
}

export default Reports
