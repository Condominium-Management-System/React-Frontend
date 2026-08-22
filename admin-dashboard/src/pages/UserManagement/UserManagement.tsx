import { useState, useEffect, useMemo, useCallback } from 'react'
import { UserPlus, AlertCircle, RefreshCw } from 'lucide-react'
import type { User } from '../../services/types/auth'
import { getUsersApi } from '../../services/api/userApi'
import UserFilters from '../../components/user/UserFilters'
import UserTable from '../../components/user/UserTable'
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

      if (!isSuperAdminUser && !authUser?.condoId) {
        setErrorMessage('Your account is not assigned to a condominium.')
        setIsLoading(false)
        return
      }

      const data = await getUsersApi(isSuperAdminUser ? undefined : authUser?.condoId)
      setUsers(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load users.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [isSuperAdminUser, authUser?.condoId])

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
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {/* 4. Main Table Container */}
      <UserTable
        users={paginatedUsers}
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndexDisplay={startIndexDisplay}
        endIndexDisplay={endIndexDisplay}
        onPageChange={setCurrentPage}
        onEditUser={handleOpenEdit}
        onDeleteUser={handleOpenDelete}
        formatRole={formatRole}
      />

      {/* 5. Modals */}
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
