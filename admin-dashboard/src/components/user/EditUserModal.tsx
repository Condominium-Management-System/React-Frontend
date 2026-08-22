import { useState, useEffect } from 'react'
import { X, Pencil, AlertCircle } from 'lucide-react'
import type { User } from '../../services/types/auth'
import type { UpdateUserPayload } from '../../services/types/user'
import { updateUserApi, updateUserRoleApi } from '../../services/api/userApi'
import { useAuth } from '../../context/useAuth'

interface EditUserModalProps {
  isOpen: boolean
  user: User
  onClose: () => void
  onSuccess: () => void
}

export const EditUserModal = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) => {
  const { user: authUser } = useAuth()
  const [fullName, setFullName] = useState(user.fullName || '')
  const [email, setEmail] = useState(user.email || '')
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '')
  const [fan, setFan] = useState(user.fan || '')
  const [role, setRole] = useState(user.role || 'resident')
  const [isVerified, setIsVerified] = useState<boolean>(user.isVerified ?? true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setFullName(user.fullName || '')
    setEmail(user.email || '')
    setPhoneNumber(user.phoneNumber || '')
    setFan(user.fan || '')
    setRole(user.role || 'resident')
    setIsVerified(user.isVerified ?? true)
  }, [user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    const userId = user.id
    const targetCondoId = user.condoId || authUser?.condoId

    if (!targetCondoId) {
      setErrorMessage('Condominium ID is required to update user.')
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Check if normal fields changed
      const normalChanged =
        fullName.trim() !== (user.fullName || '') ||
        email.trim() !== (user.email || '') ||
        phoneNumber.trim() !== (user.phoneNumber || '') ||
        fan.trim() !== (user.fan || '') ||
        isVerified !== (user.isVerified ?? true)

      if (normalChanged) {
        const payload: UpdateUserPayload = {
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          fan: fan.trim(),
          isVerified,
        }
        await updateUserApi(targetCondoId, userId, payload)
      }

      // 2. Check if role changed
      const roleChanged = role !== user.role

      if (roleChanged) {
        await updateUserRoleApi(targetCondoId, userId, role)
      }

      onSuccess()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update user.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-gray-800 bg-[#0F131C] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Edit User</h3>
              <p className="text-xs text-gray-400">
                Update user information for {user.fullName}
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

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              >
                <option value="resident">Resident</option>
                <option value="guard">Guard</option>
                <option value="condo_admin">Condo Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Verification Status
              </label>
              <select
                value={isVerified ? 'true' : 'false'}
                onChange={(e) => setIsVerified(e.target.value === 'true')}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              >
                <option value="true">Active (Verified)</option>
                <option value="false">Pending (Unverified)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              FAN Number
            </label>
            <input
              type="text"
              maxLength={16}
              value={fan}
              onChange={(e) => setFan(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none font-mono"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal
