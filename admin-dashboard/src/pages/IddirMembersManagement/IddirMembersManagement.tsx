import { useState, useEffect, useMemo, useCallback } from 'react'
import { UserPlus, Search, UserCheck } from 'lucide-react'
import type { IddirMember } from '../../services/types/iddir'
import type { Condo } from '../../services/types/condo'
import { getCondosApi } from '../../services/api/condoApi'
import { getIddirMembersApi } from '../../services/api/iddirApi'
import IddirMemberTable from '../../components/iddir/IddirMemberTable'
import RegisterIddirMemberModal from '../../components/iddir/RegisterIddirMemberModal'

const ITEMS_PER_PAGE = 8

export const IddirMembersManagement = () => {
  const [members, setMembers] = useState<IddirMember[]>([])
  const [condos, setCondos] = useState<Condo[]>([])
  const [selectedCondoId, setSelectedCondoId] = useState<string>('ALL')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Fetch Condos
  const fetchCondos = useCallback(async () => {
    try {
      const data = await getCondosApi()
      setCondos(data)
    } catch {
      // Ignore condo fetch error
    }
  }, [])

  // Fetch Members
  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getIddirMembersApi(selectedCondoId)
      setMembers(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load Iddir members.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCondoId])

  useEffect(() => {
    fetchCondos()
  }, [fetchCondos])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Filtered Members (Search & Status)
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = searchQuery.trim().toLowerCase()

      const matchesSearch =
        !query ||
        (member.user?.fullName || '').toLowerCase().includes(query) ||
        (member.user?.email || '').toLowerCase().includes(query) ||
        (member.user?.phoneNumber || '').toLowerCase().includes(query) ||
        (member.iddir?.name || '').toLowerCase().includes(query) ||
        (member.iddir?.condo?.condoName || '').toLowerCase().includes(query) ||
        (member.iddir?.condo?.condoCode || '').toLowerCase().includes(query)

      const matchesStatus =
        selectedStatusFilter === 'ALL' || member.status === selectedStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [members, searchQuery, selectedStatusFilter])

  // Pagination calculations
  const totalItems = filteredMembers.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndexDisplay =
    totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1
  const endIndexDisplay = Math.min(
    validCurrentPage * ITEMS_PER_PAGE,
    totalItems
  )

  const paginatedMembers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredMembers, validCurrentPage])

  const handleMemberCreated = (newMember: IddirMember) => {
    setMembers((prev) => [newMember, ...prev])
    fetchMembers()
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100 tracking-tight flex items-center gap-3">
            <UserCheck className="h-7 w-7 text-emerald-400" />
            <span>Iddir Members Management</span>
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-400">
            View, audit, and register resident memberships for community Iddir funds across condominiums.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search members by name, email, phone, or Iddir fund..."
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Condominium Filter Dropdown */}
          <div className="w-full sm:w-56 shrink-0">
            <select
              value={selectedCondoId}
              onChange={(e) => {
                setSelectedCondoId(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="ALL">All Condominiums</option>
              {condos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.condoName} ({c.condoCode})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-36 shrink-0">
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Members Table */}
      <IddirMemberTable
        members={paginatedMembers}
        isLoading={isLoading}
        errorMessage={errorMessage}
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndexDisplay={startIndexDisplay}
        endIndexDisplay={endIndexDisplay}
        onPageChange={setCurrentPage}
        onRetry={fetchMembers}
      />

      {/* 4. Add Member Modal */}
      <RegisterIddirMemberModal
        isOpen={isAddModalOpen}
        condos={condos}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMemberCreated}
      />
    </div>
  )
}

export default IddirMembersManagement
