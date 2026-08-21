import React from 'react'
import { Search } from 'lucide-react'

interface UserFiltersProps {
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedRole: string
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  selectedStatus: string
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const UserFilters = ({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
}: UserFiltersProps) => {
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
          placeholder="Search users by name, email or phone..."
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
        />
      </div>

      {/* Role Filter Dropdown */}
      <div className="w-full sm:w-44 shrink-0">
        <select
          value={selectedRole}
          onChange={onRoleChange}
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="resident">Resident</option>
          <option value="guard">Guard</option>
          <option value="condo_admin">Condo Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Status Filter Dropdown */}
      <div className="w-full sm:w-40 shrink-0">
        <select
          value={selectedStatus}
          onChange={onStatusChange}
          className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
    </div>
  )
}

export default UserFilters
