import { useState, useMemo } from 'react'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { initialCondosMockData, type Condo } from './condoMockData'
import RegisterCondoModal from '../../components/condo/RegisterCondoModal'

const ITEMS_PER_PAGE = 8

export const CondoManagement = () => {
  const [condos, setCondos] = useState<Condo[]>(initialCondosMockData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  // Compute unique cities list dynamically from current data
  const availableCities = useMemo(() => {
    const citiesSet = new Set(condos.map((c) => c.city))
    return ['All Cities', ...Array.from(citiesSet).sort()]
  }, [condos])

  // Filter condominiums based on search query and city filter
  const filteredCondos = useMemo(() => {
    return condos.filter((condo) => {
      const matchesSearch =
        condo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        condo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        condo.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        condo.admin.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCity =
        selectedCity === 'All Cities' || condo.city === selectedCity

      return matchesSearch && matchesCity
    })
  }, [condos, searchQuery, selectedCity])

  // Calculate pagination parameters
  const totalItems = filteredCondos.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1

  // Keep current page within valid bounds if dataset shrinks
  const validCurrentPage = Math.min(currentPage, totalPages)

  // Slice paginated items
  const paginatedCondos = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredCondos.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCondos, validCurrentPage])

  // Reset pagination when search query or city changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value)
    setCurrentPage(1)
  }

  // Handle register new condo
  const handleRegisterCondo = (newCondo: Condo) => {
    setCondos((prev) => [newCondo, ...prev])
    setCurrentPage(1)
  }

  // Handle frontend-only deletion
  const handleDeleteCondo = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      setCondos((prev) => prev.filter((c) => c.id !== id))
    }
  }

  // Page range numbers
  const startIndexDisplay =
    totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1
  const endIndexDisplay = Math.min(
    validCurrentPage * ITEMS_PER_PAGE,
    totalItems
  )

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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] focus:outline-none focus:ring-2 focus:ring-[#D3AD32] focus:ring-offset-2 focus:ring-offset-[#090D16] shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Register New Condo</span>
        </button>
      </div>

      {/* 3. Search Bar + City Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search condominiums by name, code or region..."
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
          />
        </div>

        {/* City Filter Dropdown */}
        <div className="w-full sm:w-48 shrink-0">
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
          >
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Main Table Container */}
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
              {paginatedCondos.length > 0 ? (
                paginatedCondos.map((condo) => (
                  <tr
                    key={condo.id}
                    className="transition-colors hover:bg-[#131926]"
                  >
                    {/* 1. CONDO CODE (Gold Accent) */}
                    <td className="py-3.5 px-4 md:px-5 font-bold text-[#D3AD32] whitespace-nowrap">
                      {condo.code}
                    </td>

                    {/* 2. CONDO NAME */}
                    <td className="py-3.5 px-4 md:px-5 font-medium text-gray-100 whitespace-nowrap">
                      {condo.name}
                    </td>

                    {/* 3. CITY */}
                    <td className="py-3.5 px-4 md:px-5 text-gray-400 whitespace-nowrap">
                      {condo.city}
                    </td>

                    {/* 4. ADMINS */}
                    <td className="py-3.5 px-4 md:px-5 text-gray-300 whitespace-nowrap">
                      {condo.admin}
                    </td>

                    {/* 5. UNITS */}
                    <td className="py-3.5 px-4 md:px-5 font-semibold text-gray-200 whitespace-nowrap">
                      {condo.units}
                    </td>

                    {/* 6. STATUS BADGE */}
                    <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          condo.status === 'Active'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {condo.status}
                      </span>
                    </td>

                    {/* 7. ACTIONS */}
                    <td className="py-3.5 px-4 md:px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="Edit Condominium"
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-[#D3AD32]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete Condominium"
                          onClick={() => handleDeleteCondo(condo.id, condo.name)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
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

        {/* 5. Pagination Footer */}
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
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-colors ${
                  pageNum === validCurrentPage
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
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Register New Condo Modal */}
      <RegisterCondoModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterCondo}
      />
    </div>
  )
}

export default CondoManagement
