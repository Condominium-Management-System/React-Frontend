import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Search, HeartHandshake } from 'lucide-react'
import type { Iddir } from '../../services/types/iddir'
import type { Condo } from '../../services/types/condo'
import { getCondosApi } from '../../services/api/condoApi'
import { getIddirsApi } from '../../services/api/iddirApi'
import IddirTable from '../../components/iddir/IddirTable'
import CreateIddirModal from '../../components/iddir/CreateIddirModal'
import EditIddirModal from '../../components/iddir/EditIddirModal'
import DeleteIddirModal from '../../components/iddir/DeleteIddirModal'

const ITEMS_PER_PAGE = 8

export const IddirManagement = () => {
  const [iddirs, setIddirs] = useState<Iddir[]>([])
  const [condos, setCondos] = useState<Condo[]>([])
  const [selectedCondoId, setSelectedCondoId] = useState<string>('ALL')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingIddir, setEditingIddir] = useState<Iddir | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingIddir, setDeletingIddir] = useState<Iddir | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Fetch Condos
  const fetchCondos = useCallback(async () => {
    try {
      const data = await getCondosApi()
      setCondos(data)
    } catch {
      // Ignore condo fetch error
    }
  }, [])

  // Fetch Iddirs
  const fetchIddirs = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getIddirsApi(selectedCondoId)
      setIddirs(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load Iddirs.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCondoId])

  useEffect(() => {
    fetchCondos()
  }, [fetchCondos])

  useEffect(() => {
    fetchIddirs()
  }, [fetchIddirs])

  // Filtered Iddirs (Search & Status)
  const filteredIddirs = useMemo(() => {
    return iddirs.filter((iddir) => {
      const query = searchQuery.trim().toLowerCase()

      const matchesSearch =
        !query ||
        iddir.name.toLowerCase().includes(query) ||
        (iddir.condo?.condoName || '').toLowerCase().includes(query) ||
        (iddir.condo?.condoCode || '').toLowerCase().includes(query) ||
        (iddir.createdBy?.fullName || '').toLowerCase().includes(query)

      const matchesStatus =
        selectedStatusFilter === 'ALL' || iddir.status === selectedStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [iddirs, searchQuery, selectedStatusFilter])

  // Pagination calculations
  const totalItems = filteredIddirs.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndexDisplay =
    totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1
  const endIndexDisplay = Math.min(
    validCurrentPage * ITEMS_PER_PAGE,
    totalItems
  )

  const paginatedIddirs = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredIddirs.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredIddirs, validCurrentPage])

  const handleIddirCreated = (newIddir: Iddir) => {
    setIddirs((prev) => [newIddir, ...prev])
    fetchIddirs()
  }

  const handleIddirUpdated = (updatedIddir: Iddir) => {
    setIddirs((prev) =>
      prev.map((item) => (item.id === updatedIddir.id ? { ...item, ...updatedIddir } : item))
    )
    fetchIddirs()
  }

  const handleIddirDeleted = (deletedIddirId: string) => {
    setIddirs((prev) => prev.filter((item) => item.id !== deletedIddirId))
    fetchIddirs()
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100 tracking-tight flex items-center gap-3">
            <HeartHandshake className="h-7 w-7 text-[#D3AD32]" />
            <span>Iddir Management</span>
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-400">
            Manage community Iddir funds, contribution rates, and membership directories across condominiums.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Iddir</span>
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
            placeholder="Search Iddirs by name, condominium, or admin..."
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
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Iddir Directory Table */}
      <IddirTable
        iddirs={paginatedIddirs}
        isLoading={isLoading}
        errorMessage={errorMessage}
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndexDisplay={startIndexDisplay}
        endIndexDisplay={endIndexDisplay}
        onPageChange={setCurrentPage}
        onRetry={fetchIddirs}
        onEditIddir={(iddir) => {
          setEditingIddir(iddir)
          setIsEditModalOpen(true)
        }}
        onDeleteIddir={(iddir) => {
          setDeletingIddir(iddir)
          setIsDeleteModalOpen(true)
        }}
      />

      {/* 4. Modals */}
      <CreateIddirModal
        isOpen={isAddModalOpen}
        condos={condos}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleIddirCreated}
      />

      <EditIddirModal
        isOpen={isEditModalOpen}
        iddir={editingIddir}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingIddir(null)
        }}
        onSuccess={handleIddirUpdated}
      />

      <DeleteIddirModal
        isOpen={isDeleteModalOpen}
        iddir={deletingIddir}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingIddir(null)
        }}
        onSuccess={handleIddirDeleted}
      />
    </div>
  )
}

export default IddirManagement
