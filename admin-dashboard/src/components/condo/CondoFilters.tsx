import React from 'react'
import { Search } from 'lucide-react'

interface CondoFiltersProps {
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedCity: string
  onCityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  availableCities: string[]
}

export const CondoFilters = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  availableCities,
}: CondoFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search condominiums by name, code or region..."
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
        />
      </div>

      {/* City Filter Dropdown */}
      <div className="w-full sm:w-48 shrink-0">
        <select
          value={selectedCity}
          onChange={onCityChange}
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
  )
}

export default CondoFilters
