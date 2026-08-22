import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import type { Condo } from '../../services/types/condo'
import { getCondosApi } from '../../services/api/condoApi'
import CondoFilters from '../../components/condo/CondoFilters'
import CondoTable from '../../components/condo/CondoTable'
import RegisterCondoModal from '../../components/condo/RegisterCondoModal'
import EditCondoModal from '../../components/condo/EditCondoModal'
import DeleteCondoModal from '../../components/condo/DeleteCondoModal'

const ITEMS_PER_PAGE = 8

export const CondoManagement = () => {
  const [condos, setCondos] = useState<Condo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [currentPage, setCurrentPage] = useState(1)

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  const [selectedEditCondo, setSelectedEditCondo] = useState<Condo | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [selectedDeleteCondo, setSelectedDeleteCondo] = useState<Condo | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Fetch condominiums from backend
  const fetchCondos = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getCondosApi()
      setCondos(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load condominiums.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCondos()
  }, [fetchCondos])

  // Compute unique cities list dynamically from loaded condominiums
  const availableCities = useMemo(() => {
    const citiesSet = new Set(
      condos.map((c) => c.city).filter((c): c is string => Boolean(c))
    )
    return ['All Cities', ...Array.from(citiesSet).sort()]
  }, [condos])

  // Filter condominiums based on search query and city filter
  const filteredCondos = useMemo(() => {
    return condos.filter((condo) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        (condo.condoName || '').toLowerCase().includes(query) ||
        (condo.condoCode || '').toLowerCase().includes(query) ||
        (condo.city || '').toLowerCase().includes(query) ||
        (condo.address || '').toLowerCase().includes(query)

      const matchesCity =
        selectedCity === 'All Cities' || condo.city === selectedCity

      return matchesSearch && matchesCity
    })
  }, [condos, searchQuery, selectedCity])

  // Calculate pagination parameters
  const totalItems = filteredCondos.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const validCurrentPage = Math.min(currentPage, totalPages)

  // Slice paginated items
  const paginatedCondos = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredCondos.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCondos, validCurrentPage])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value)
    setCurrentPage(1)
  }

  const handleOpenEdit = (condo: Condo) => {
    setSelectedEditCondo(condo)
    setIsEditModalOpen(true)
  }

  const handleOpenDelete = (condo: Condo) => {
    setSelectedDeleteCondo(condo)
    setIsDeleteModalOpen(true)
  }

  // Page range numbers for display
  const startIndexDisplay =
    totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1
  const endIndexDisplay = Math.min(
    validCurrentPage * ITEMS_PER_PAGE,
    totalItems
  )

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-gray-400 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
            Loading condominiums...
          </span>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0F131C] p-8 text-center text-gray-400 max-w-lg mx-auto mt-10 select-none">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-200">
          Failed to load condominiums
        </h3>
        <p className="mt-1 text-xs text-gray-400">{errorMessage}</p>
        <button
          type="button"
          onClick={fetchCondos}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-100">
          Condominium Management
        </h1>
      </div>

      {/* 2. Registered Condominiums Section Header & Register Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-100">
            Registered Condominiums
          </h2>
          <p className="mt-0.5 text-xs md:text-sm text-gray-400">
            Manage properties, site administrators, and allocated units.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] focus:outline-none focus:ring-2 focus:ring-[#D3AD32] focus:ring-offset-2 focus:ring-offset-[#090D16] shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Register New Condo</span>
        </button>
      </div>

      {/* 3. Search Bar + City Filter Row */}
      <CondoFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        availableCities={availableCities}
      />

      {/* 4. Main Table Container */}
      <CondoTable
        condos={paginatedCondos}
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndexDisplay={startIndexDisplay}
        endIndexDisplay={endIndexDisplay}
        onPageChange={setCurrentPage}
        onEditCondo={handleOpenEdit}
        onDeleteCondo={handleOpenDelete}
      />

      {/* 5. Modals */}
      <RegisterCondoModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={fetchCondos}
      />

      {selectedEditCondo && (
        <EditCondoModal
          isOpen={isEditModalOpen}
          condo={selectedEditCondo}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedEditCondo(null)
          }}
          onSuccess={fetchCondos}
        />
      )}

      {selectedDeleteCondo && (
        <DeleteCondoModal
          isOpen={isDeleteModalOpen}
          condo={selectedDeleteCondo}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedDeleteCondo(null)
          }}
          onSuccess={fetchCondos}
        />
      )}
    </div>
  )
}

export default CondoManagement
