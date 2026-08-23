import { UserCheck, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Calendar, Mail, Phone, Home, Edit2, Trash2 } from 'lucide-react'
import type { IddirMember } from '../../services/types/iddir'

interface IddirMemberTableProps {
  members: IddirMember[]
  isLoading: boolean
  errorMessage: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  startIndexDisplay: number
  endIndexDisplay: number
  onPageChange: (page: number) => void
  onRetry: () => void
  onEditMember: (member: IddirMember) => void
  onDeleteMember: (member: IddirMember) => void
}

export const IddirMemberTable = ({
  members,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  totalItems,
  startIndexDisplay,
  endIndexDisplay,
  onPageChange,
  onRetry,
  onEditMember,
  onDeleteMember,
}: IddirMemberTableProps) => {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden select-none">
      {isLoading ? (
        <div className="flex h-80 w-full items-center justify-center text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              Loading Iddir members...
            </span>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="p-8 text-center text-gray-400">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-200">Unable to load members</h3>
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
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                <th className="py-3.5 px-4 md:px-5">MEMBER NAME</th>
                <th className="py-3.5 px-4 md:px-5">CONTACT</th>
                <th className="py-3.5 px-4 md:px-5">CONDOMINIUM & UNIT</th>
                <th className="py-3.5 px-4 md:px-5">IDDIR FUND</th>
                <th className="py-3.5 px-4 md:px-5">JOINED DATE</th>
                <th className="py-3.5 px-4 md:px-5">STATUS</th>
                <th className="py-3.5 px-4 md:px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs md:text-sm">
              {members.length > 0 ? (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-[#131926]"
                  >
                    <td className="py-3.5 px-4 md:px-5 font-bold text-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <span>{member.user?.fullName || 'Resident Member'}</span>
                          <span className="block text-[10px] text-gray-400 font-normal capitalize">
                            {member.user?.role || 'resident'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-gray-300">
                      <div className="space-y-0.5 text-xs">
                        {member.user?.email && (
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Mail className="h-3 w-3 text-gray-500 shrink-0" />
                            <span>{member.user.email}</span>
                          </div>
                        )}
                        {member.user?.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Phone className="h-3 w-3 text-gray-500 shrink-0" />
                            <span>{member.user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 font-medium text-gray-300">
                      <div>
                        <span>
                          {member.iddir?.condo?.condoName || member.iddir?.condo?.condoCode || '—'}
                        </span>
                        {(member.user?.block || member.user?.roomNo) && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                            <Home className="h-3 w-3 text-gray-500 shrink-0" />
                            <span>
                              {member.user.block ? `Block ${member.user.block}` : ''}{' '}
                              {member.user.roomNo ? `Room ${member.user.roomNo}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 font-semibold text-gray-200">
                      {member.iddir?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-gray-300">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          member.status === 'active'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : member.status === 'suspended'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                            : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {member.status ? member.status.toUpperCase() : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 md:px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEditMember(member)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1 text-xs font-semibold text-gray-300 transition-colors hover:border-gray-700 hover:text-white cursor-pointer"
                          title="Edit Member Status"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMember(member)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 cursor-pointer"
                          title="Remove Member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <UserCheck className="h-10 w-10 text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-300">
                        No Iddir members found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Click "Add Member" above to register resident members into an Iddir.
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
      {!isLoading && !errorMessage && members.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-800 bg-gray-950/40 px-4 md:px-5 py-3.5 text-xs text-gray-400">
          <div>
            Showing <span className="font-semibold text-gray-200">{startIndexDisplay}</span>-
            <span className="font-semibold text-gray-200">{endIndexDisplay}</span> of{' '}
            <span className="font-semibold text-gray-200">{totalItems}</span> members
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

export default IddirMemberTable
