import React from 'react'
import { Search } from 'lucide-react'
import type { Condo } from '../../services/types/condo'

interface PaymentFiltersProps {
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedType: string
  onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  selectedStatus: string
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  selectedMethod: string
  onMethodChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  selectedCondoId: string
  onCondoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  condos: Condo[]
  isSuperAdmin: boolean
}

export const PaymentFilters = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedMethod,
  onMethodChange,
  selectedCondoId,
  onCondoChange,
  condos,
  isSuperAdmin,
}: PaymentFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search payments..."
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
        />
      </div>

      {/* Payment Type Filter */}
      <div className="w-full lg:w-44 shrink-0">
        <select
          value={selectedType}
          onChange={onTypeChange}
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
        >
          <option value="ALL">Type: All Payments</option>
          <option value="equb">Equb</option>
          <option value="iddir">Iddir</option>
          <option value="guard_fee">Guard Fee</option>
          <option value="service_charge">Service Charge</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="w-full lg:w-36 shrink-0">
        <select
          value={selectedStatus}
          onChange={onStatusChange}
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
        >
          <option value="ALL">Status: All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Method Filter */}
      <div className="w-full lg:w-40 shrink-0">
        <select
          value={selectedMethod}
          onChange={onMethodChange}
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
        >
          <option value="ALL">Method: All</option>
          <option value="cbe">CBE</option>
          <option value="telebirr">Telebirr</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="others">Others</option>
        </select>
      </div>

      {/* Condominium Filter (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="w-full lg:w-48 shrink-0">
          <select
            value={selectedCondoId}
            onChange={onCondoChange}
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
          >
            <option value="ALL">Condominium: All</option>
            {condos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.condoName} ({c.condoCode})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default PaymentFilters
