import { Eye, AlertCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Report, ReportStatus, ReportPriority } from '../../services/types/report'

interface ReportTableProps {
  reports: Report[]
  isLoading: boolean
  errorMessage: string | null
  onViewDetails: (report: Report) => void
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

const getStatusBadge = (status: ReportStatus) => {
  switch (status) {
    case 'reported':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'assigned':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30'
    case 'in_progress':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    case 'resolved':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    case 'closed':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }
}

const getPriorityBadge = (priority: ReportPriority) => {
  switch (priority) {
    case 'emergency':
      return 'bg-red-500/15 text-red-400 border-red-500/40 font-bold'
    case 'high':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    case 'medium':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    case 'low':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export const ReportTable = ({
  reports,
  isLoading,
  errorMessage,
  onViewDetails,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: ReportTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0F131C] p-8 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Loading reports...
          </span>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0F131C] p-12 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-gray-600" />
          <p className="text-sm font-semibold text-gray-300">No maintenance reports found</p>
          <p className="text-xs text-gray-500 max-w-sm">
            There are currently no reports matching your query criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-[#0F131C] overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="border-b border-gray-800 bg-gray-900/60 font-semibold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Report Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Reporter</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {reports.map((report) => (
              <tr key={report.id} className="transition-colors hover:bg-gray-800/40">
                {/* Title & Short Description */}
                <td className="px-5 py-4 max-w-xs">
                  <p className="font-semibold text-gray-100 truncate">{report.title}</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{report.description}</p>
                </td>

                {/* Category */}
                <td className="px-5 py-4">
                  <span className="inline-block rounded-md bg-gray-800 px-2.5 py-1 text-[11px] font-medium text-gray-300 capitalize">
                    {report.category}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase ${getPriorityBadge(
                      report.priority
                    )}`}
                  >
                    {report.priority}
                  </span>
                </td>

                {/* Reporter */}
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-200">{report.reporter?.fullName || 'Resident'}</p>
                  <p className="text-[10px] text-gray-500">
                    {report.reporter?.block ? `Blk ${report.reporter.block}` : ''}
                    {report.reporter?.roomNo ? ` / Room ${report.reporter.roomNo}` : ''}
                  </p>
                </td>

                {/* Status Badge */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${getStatusBadge(
                      report.status
                    )}`}
                  >
                    {report.status.replace('_', ' ')}
                  </span>
                </td>

                {/* Date */}
                <td className="px-5 py-4 text-gray-400">{formatDate(report.createdAt)}</td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onViewDetails(report)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:border-[#D3AD32] hover:text-[#D3AD32] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-800/80 bg-gray-900/40 px-5 py-3 text-xs text-gray-400">
          <div>
            Showing page <span className="font-bold text-gray-200">{currentPage}</span> of{' '}
            <span className="font-bold text-gray-200">{totalPages}</span> ({totalItems} items)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportTable
