import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { User } from '../../services/types/auth'

interface DeleteUserModalProps {
  isOpen: boolean
  user: User
  onClose: () => void
  onSuccess: () => void
}

export const DeleteUserModal = ({
  isOpen,
  user,
  onClose,
}: DeleteUserModalProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleDelete = () => {
    // Backend DELETE user endpoint pending contract definition
    setErrorMessage('User delete endpoint is pending backend contract definition.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-800 bg-[#0F131C] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Delete User</h3>
              <p className="text-xs text-gray-400">
                Confirm deletion for {user.fullName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-300">
          Are you sure you want to delete{' '}
          <span className="font-bold text-gray-100">{user.fullName}</span>? This
          action cannot be undone.
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-400">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-500 cursor-pointer"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteUserModal
