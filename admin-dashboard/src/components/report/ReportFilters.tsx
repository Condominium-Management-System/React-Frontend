import { Search, Filter } from 'lucide-react'

interface ReportFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedPriority: string
  onPriorityChange: (priority: string) => void
}

export const ReportFilters = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
}: ReportFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-[#0F131C] p-4 md:flex-row md:items-center md:justify-between select-none">
      {/* Search Input Bar */}
      <div className="relative flex-1 min-w-[200px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full rounded-lg border border-gray-800 bg-gray-900/80 py-2 pl-9 pr-3 text-xs text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32]/50 focus:outline-none"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-gray-400 hidden sm:inline" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-xs font-medium text-gray-300 transition-colors focus:border-[#D3AD32]/50 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-xs font-medium text-gray-300 transition-colors focus:border-[#D3AD32]/50 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="structural">Structural</option>
          <option value="security">Security</option>
          <option value="noise">Noise</option>
          <option value="other">Other</option>
        </select>

        {/* Priority Dropdown */}
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-xs font-medium text-gray-300 transition-colors focus:border-[#D3AD32]/50 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>
    </div>
  )
}

export default ReportFilters
