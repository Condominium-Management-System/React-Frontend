import { Pencil, Trash2, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Condo } from '../../services/types/condo'

interface CondoTableProps {
  condos: Condo[]
  currentPage: number
  totalPages: number
  totalItems: number
  startIndexDisplay: number
  endIndexDisplay: number
  onPageChange: (page: number) => void
  onEditCondo: (condo: Condo) => void
  onDeleteCondo: (condo: Condo) => void
}

export const CondoTable = ({
  condos,
  currentPage,
  totalPages,
  totalItems,
  startIndexDisplay,
  endIndexDisplay,
  onPageChange,
  onEditCondo,
  onDeleteCondo,
}: CondoTableProps) => {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              <th className="py-3.5 px-4 md:px-5">CONDO CODE</th>
              <th className="py-3.5 px-4 md:px-5">CONDO NAME</th>
              <th className="py-3.5 px-4 md:px-5">CITY</th>
              <th className="py-3.5 px-4 md:px-5">ADMINS</th>
              <th className="py-3.5 px-4 md:px-5">UNITS</th>
              <th className="py-3.5 px-4 md:px-5">STATUS</th>
              <th className="py-3.5 px-4 md:px-5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-xs md:text-sm">
            {condos.length > 0 ? (
              condos.map((condo) => (
                <tr
                  key={condo.id}
                  className="transition-colors hover:bg-[#131926]"
                >
                  {/* 1. CONDO CODE */}
                  <td className="py-3.5 px-4 md:px-5 font-bold text-[#D3AD32] whitespace-nowrap">
                    {condo.condoCode}
                  </td>

                  {/* 2. CONDO NAME */}
                  <td className="py-3.5 px-4 md:px-5 font-medium text-gray-100 whitespace-nowrap">
                    {condo.condoName}
                  </td>

                  {/* 3. CITY */}
                  <td className="py-3.5 px-4 md:px-5 text-gray-400 whitespace-nowrap">
                    {condo.city}
                  </td>

                  {/* 4. ADMINS */}
                  <td className="py-3.5 px-4 md:px-5 text-gray-300 font-semibold whitespace-nowrap">
                    {condo._count?.users ?? 0}
                  </td>

                  {/* 5. UNITS */}
                  <td className="py-3.5 px-4 md:px-5 font-semibold text-gray-200 whitespace-nowrap">
                    {condo._count?.blocks ?? 0} Blocks ({condo.maxAdmins} Max Admins)
                  </td>

                  {/* 6. STATUS BADGE */}
                  <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        condo.activeStatus
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {condo.activeStatus ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* 7. ACTIONS */}
                  <td className="py-3.5 px-4 md:px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Edit Condominium"
                        onClick={() => onEditCondo(condo)}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-[#D3AD32] cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete Condominium"
                        onClick={() => onDeleteCondo(condo)}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* Empty State */
              <tr>
                <td
                  colSpan={7}
                  className="py-12 px-4 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Building2 className="h-10 w-10 text-gray-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-300">
                      No condominiums found
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Try adjusting your search terms or city filter.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-800 bg-gray-950/40 px-4 md:px-5 py-3.5 text-xs text-gray-400">
        <div>
          Showing <span className="font-semibold text-gray-200">{startIndexDisplay}</span>-
          <span className="font-semibold text-gray-200">{endIndexDisplay}</span> of{' '}
          <span className="font-semibold text-gray-200">{totalItems}</span> condominiums
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
    </div>
  )
}

export default CondoTable
