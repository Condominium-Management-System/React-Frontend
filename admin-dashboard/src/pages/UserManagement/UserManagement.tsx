import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import type { User } from '../../services/types/auth'
import { getUsersApi } from '../../services/api/apiClient'
import RegisterUserModal from '../../components/user/RegisterUserModal'
import EditUserModal from '../../components/user/EditUserModal'
import DeleteUserModal from '../../components/user/DeleteUserModal'

import { useAuth } from '../../context/useAuth'
import { isSuperAdmin } from '../../utils/roleHelpers'

const ITEMS_PER_PAGE = 8

export const UserManagement = () => {
  const { user: authUser } = useAuth()
  const isSuperAdminUser = isSuperAdmin(authUser?.role)

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  const [selectedEditUser, setSelectedEditUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [selectedDeleteUser, setSelectedDeleteUser] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getUsersApi()
      setUsers(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load users.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users based on search, role, status, and condoId scope
  const filteredUsers = useMemo(() => {
    return users.filter((userItem) => {
      // Condo Admin scope filter
      if (!isSuperAdminUser && authUser?.condoId) {
        if (userItem.condoId && userItem.condoId !== authUser.condoId) {
          return false
        }
      }

      const query = searchQuery.toLowerCase()

      const matchesSearch =
        (userItem.fullName || '').toLowerCase().includes(query) ||
        (userItem.email || '').toLowerCase().includes(query) ||
        (userItem.phoneNumber || '').toLowerCase().includes(query)

      const matchesRole =
        selectedRole === 'ALL' || userItem.role === selectedRole

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && userItem.isVerified === true) ||
        (selectedStatus === 'PENDING' && userItem.isVerified === false)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, selectedRole, selectedStatus, isSuperAdminUser, authUser])

  // Calculate pagination parameters
  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const validCurrentPage = Math.min(currentPage, totalPages)

  // Slice paginated items
  const paginatedUsers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredUsers, validCurrentPage])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value)
    setCurrentPage(1)
  }

  const handleOpenEdit = (user: User) => {
    setSelectedEditUser(user)
    setIsEditModalOpen(true)
  }

  const handleOpenDelete = (user: User) => {
    setSelectedDeleteUser(user)
    setIsDeleteModalOpen(true)
  }

  // Format backend role string for display
  const formatRole = (role: string): string => {
    switch (role) {
      case 'resident':
        return 'Resident'
      case 'guard':
        return 'Guard'
      case 'condo_admin':
        return 'Condo Admin'
      case 'super_admin':
        return 'Super Admin'
      default:
        return role ? role.replace(/_/g, ' ') : '—'
    }
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
            Loading users...
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
          Failed to load users
        </h3>
        <p className="mt-1 text-xs text-gray-400">{errorMessage}</p>
        <button
          type="button"
          onClick={fetchUsers}
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
          User Management
        </h1>
      </div>

      {/* 2. System Users Section Header & Register Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-100">
            System Users
          </h2>
          <p className="mt-0.5 text-xs md:text-sm text-gray-400">
            Manage system accounts, access roles, and property assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] focus:outline-none focus:ring-2 focus:ring-[#D3AD32] focus:ring-offset-2 focus:ring-offset-[#090D16] shadow-sm shrink-0 cursor-pointer"
        >
          <UserPlus className="h-4 w-4 stroke-[2.5]" />
          <span>Register New User</span>
        </button>
      </div>

      {/* 3. Search Bar + Filters Row */}
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
            placeholder="Search users by name, email or phone..."
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="w-full sm:w-44 shrink-0">
          <select
            value={selectedRole}
            onChange={handleRoleChange}
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
            onChange={handleStatusChange}
            className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 transition-colors focus:border-[#D3AD32] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* 4. Main Table Container */}
      <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                <th className="py-3.5 px-4 md:px-5">FULL NAME</th>
                <th className="py-3.5 px-4 md:px-5">EMAIL</th>
                <th className="py-3.5 px-4 md:px-5">PHONE</th>
                <th className="py-3.5 px-4 md:px-5">ROLE</th>
                <th className="py-3.5 px-4 md:px-5">ALLOCATED CONDO</th>
                <th className="py-3.5 px-4 md:px-5">STATUS</th>
                <th className="py-3.5 px-4 md:px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs md:text-sm">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-[#131926]"
                  >
                    {/* 1. FULL NAME */}
                    <td className="py-3.5 px-4 md:px-5 font-bold text-gray-100 whitespace-nowrap">
                      {user.fullName}
                    </td>

                    {/* 2. EMAIL */}
                    <td className="py-3.5 px-4 md:px-5 text-gray-300 whitespace-nowrap">
                      {user.email}
                    </td>

                    {/* 3. PHONE */}
                    <td className="py-3.5 px-4 md:px-5 text-gray-400 whitespace-nowrap font-mono">
                      {user.phoneNumber || '—'}
                    </td>

                    {/* 4. ROLE */}
                    <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                      <span className="inline-block rounded-full border border-gray-800 bg-gray-900 px-2.5 py-0.5 text-xs font-semibold text-gray-200">
                        {formatRole(user.role)}
                      </span>
                    </td>

                    {/* 5. ALLOCATED CONDO */}
                    <td className="py-3.5 px-4 md:px-5 font-bold text-[#D3AD32] font-mono whitespace-nowrap">
                      {user.condoCode || 'Not assigned'}
                    </td>

                    {/* 6. STATUS BADGE */}
                    <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          user.isVerified === true
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {user.isVerified === true ? 'Active' : 'Pending'}
                      </span>
                    </td>

                    {/* 7. ACTIONS */}
                    <td className="py-3.5 px-4 md:px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="Edit User"
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-[#D3AD32] cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete User"
                          onClick={() => handleOpenDelete(user)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400 cursor-pointer"
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
                      <UsersIcon className="h-10 w-10 text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-300">
                        No users found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Try adjusting your search terms or role/status filters.
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
            <span className="font-semibold text-gray-200">{totalItems}</span> users
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
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
                className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Modals */}
      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={fetchUsers}
      />

      {selectedEditUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          user={selectedEditUser}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedEditUser(null)
          }}
          onSuccess={fetchUsers}
        />
      )}

      {selectedDeleteUser && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          user={selectedDeleteUser}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedDeleteUser(null)
          }}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  )
}

export default UserManagement
