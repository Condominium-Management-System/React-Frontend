import { DoorOpen, Edit2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import type { Room } from '../../services/types/property'

interface RoomTableProps {
  rooms: Room[]
  isLoading: boolean
  errorMessage: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  startIndexDisplay: number
  endIndexDisplay: number
  onPageChange: (page: number) => void
  onUpdateStatus: (room: Room) => void
  onRetry: () => void
  isSuper: boolean
}

export const RoomTable = ({
  rooms,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  totalItems,
  startIndexDisplay,
  endIndexDisplay,
  onPageChange,
  onUpdateStatus,
  onRetry,
  isSuper,
}: RoomTableProps) => {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="flex h-80 w-full items-center justify-center text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              Loading units and property layout...
            </span>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="p-8 text-center text-gray-400">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-200">Unable to load units</h3>
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
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                <th className="py-3.5 px-4 md:px-5">UNIT NUMBER</th>
                {isSuper && <th className="py-3.5 px-4 md:px-5">CONDOMINIUM</th>}
                <th className="py-3.5 px-4 md:px-5">BLOCK</th>
                <th className="py-3.5 px-4 md:px-5">FLOOR</th>
                <th className="py-3.5 px-4 md:px-5">TYPE</th>
                <th className="py-3.5 px-4 md:px-5">STATUS</th>
                {!isSuper && <th className="py-3.5 px-4 md:px-5 text-right">ACTIONS</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs md:text-sm">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="transition-colors hover:bg-[#131926]"
                  >
                    <td className="py-3.5 px-4 md:px-5 font-bold font-mono text-gray-100">
                      Unit {room.roomNumber}
                    </td>
                    {isSuper && (
                      <td className="py-3.5 px-4 md:px-5 font-medium text-gray-300">
                        {room.condoName || room.condoCode || '—'}
                      </td>
                    )}
                    <td className="py-3.5 px-4 md:px-5 font-medium text-gray-200">
                      {room.block?.blockNo || room.block?.blockName || room.block?.blockNumber || 'Block A'}
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-gray-300">
                      Floor {room.floor || 1}
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-gray-300 capitalize">
                      {room.roomType || 'residential'}
                    </td>
                    <td className="py-3.5 px-4 md:px-5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          room.status === 'free'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : room.status === 'occupied'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                            : room.status === 'reserved'
                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {room.status ? room.status.toUpperCase() : 'FREE'}
                      </span>
                    </td>
                    {!isSuper && (
                      <td className="py-3.5 px-4 md:px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(room)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1 text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Status</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isSuper ? 6 : 6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <DoorOpen className="h-10 w-10 text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-300">
                        No units registered
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {isSuper
                          ? 'No apartment units found for the selected condominium.'
                          : 'Click "Add Unit" above to register apartment units for this condominium.'}
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
            <span className="font-semibold text-gray-200">{totalItems}</span> units
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

export default RoomTable
