import React from 'react'
import { Search, Plus } from 'lucide-react'

interface PropertyFiltersProps {
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedStatusFilter: string
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  isSuper: boolean
  onAddBlock: () => void
  onAddRoom: () => void
}

export const PropertyFilters = ({
  searchQuery,
  onSearchChange,
  selectedStatusFilter,
  onStatusChange,
  isSuper,
  onAddBlock,
  onAddRoom,
}: PropertyFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Left: Search + Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search units by number, block, or type..."
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-44 shrink-0">
          <select
            value={selectedStatusFilter}
            onChange={onStatusChange}
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="free">Free (Vacant)</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Right: Add Actions (CONDO ADMIN ONLY - Super Admin is VIEW-ONLY) */}
      {!isSuper && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddBlock}
            className="flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs font-bold text-gray-200 transition-colors hover:bg-gray-800 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#D3AD32]" />
            <span>Add Block</span>
          </button>

          <button
            type="button"
            onClick={onAddRoom}
            className="flex items-center gap-1.5 rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Unit</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default PropertyFilters
