import { HeartHandshake, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Calendar, Users, DollarSign } from 'lucide-react'
import type { Iddir } from '../../services/types/iddir'

interface IddirTableProps {
  iddirs: Iddir[]
  isLoading: boolean
  errorMessage: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  startIndexDisplay: number
  endIndexDisplay: number
  onPageChange: (page: number) => void
  onRetry: () => void
}

export const IddirTable = ({
  iddirs,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  totalItems,
  startIndexDisplay,
  endIndexDisplay,
  onPageChange,
  onRetry,
}: IddirTableProps) => {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden select-none">
      {isLoading ? (
        <div className="flex h-80 w-full items-center justify-center text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              Loading Iddir records...
            </span>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="p-8 text-center text-gray-400">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-200">Unable to load Iddirs</h3>
          <p className="mt-1 text-xs text-gray-400">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 hover:bg-[#E4C043] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                <th className="py-3.5 px-4 md:px-5">IDDIR NAME</th>
                <th className="py-3.5 px-4 md:px-5">CONDOMINIUM</th>
                <th className="py-3.5 px-4 md:px-5">STARTED DATE</th>
                <th className="py-3.5 px-4 md:px-5">MONTHLY CONTRIBUTION</th>
                <th className="py-3.5 px-4 md:px-5">MEMBERS</th>
                <th className="py-3.5 px-4 md:px-5">STATUS</th>
                <th className="py-3.5 px-4 md:px-5">CREATED BY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs md:text-sm">
              {iddirs.length > 0 ? (
                iddirs.map((iddir) => (
                  <tr
                    key={iddir.id}
                    className="transition-colors hover:bg-[#131926]"
                  >
                    <td className="py-3.5 px-4 md:px-5 font-bold text-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D3AD32]/20 bg-[#D3AD32]/10 text-[#D3AD32]">
                          <HeartHandshake className="h-4 w-4" />
                        </div>
                        <span>{iddir.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 font-medium text-gray-300">
                      {iddir.condo?.condoName || iddir.condo?.condoCode || '—'}
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-gray-300">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>
                          {iddir.startedDate
                            ? new Date(iddir.startedDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 font-semibold text-gray-200">
                      <div className="flex items-center gap-1 text-[#D3AD32]">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{iddir.contributionAmount ? iddir.contributionAmount.toLocaleString() : '0'} ETB</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-semibold text-gray-200">
                          {iddir._count?.members ?? iddir.noMembers ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          iddir.status === 'active'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {iddir.status ? iddir.status.toUpperCase() : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-gray-400">
                      {iddir.createdBy?.fullName || 'System Admin'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <HeartHandshake className="h-10 w-10 text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-300">
                        No Iddirs found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Click "Add Iddir" above to create a new community Iddir.
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
      {!isLoading && !errorMessage && iddirs.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-800 bg-gray-950/40 px-4 md:px-5 py-3.5 text-xs text-gray-400">
          <div>
            Showing <span className="font-semibold text-gray-200">{startIndexDisplay}</span>-
            <span className="font-semibold text-gray-200">{endIndexDisplay}</span> of{' '}
            <span className="font-semibold text-gray-200">{totalItems}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

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

export default IddirTable
