import { useState } from 'react'
import { X, UserCheck, AlertCircle } from 'lucide-react'
import type { User } from '../../services/types/auth'
import { updateProfileApi } from '../../services/api/apiClient'

interface EditProfileModalProps {
  isOpen: boolean
  user: User
  onClose: () => void
  onSave: (updatedUser: User) => void
}

export const EditProfileModal = ({
  isOpen,
  user,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const [fullName, setFullName] = useState(user.fullName || '')
  const [email, setEmail] = useState(user.email || '')
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '')
  const [fan, setFan] = useState(user.fan || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Form Validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage('Full Name must be at least 3 characters.')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (fan.trim() && !/^\d{16}$/.test(fan.trim())) {
      setErrorMessage('FAN Number must be exactly 16 digits if provided.')
      return
    }

    // Determine changed fields only
    const formData = new FormData()
    let hasChanges = false

    if (fullName.trim() !== (user.fullName || '').trim()) {
      formData.append('fullName', fullName.trim())
      hasChanges = true
    }

    if (email.trim() !== (user.email || '').trim()) {
      formData.append('email', email.trim())
      hasChanges = true
    }

    if (phoneNumber.trim() !== (user.phoneNumber || '').trim()) {
      formData.append('phoneNumber', phoneNumber.trim())
      hasChanges = true
    }

    if (fan.trim() !== (user.fan || '').trim()) {
      formData.append('fan', fan.trim())
      hasChanges = true
    }

    if (!hasChanges) {
      onClose()
      return
    }

    try {
      setIsSubmitting(true)
      const updatedUser = await updateProfileApi(formData)
      onSave(updatedUser)
      onClose()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to update profile.'
      setErrorMessage(message)
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

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-800 bg-[#0F131C] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Edit Profile</h3>
              <p className="text-xs text-gray-400">
                Update your personal identification details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
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
              placeholder="e.g. Abebe Kebede"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. abebe@yekondominium.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. +251911223344"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              FAN Number (16 Digits)
            </label>
            <input
              type="text"
              maxLength={16}
              placeholder="e.g. 1234567890123456"
              value={fan}
              onChange={(e) => setFan(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-400">
                Role (Read-Only)
              </label>
              <input
                type="text"
                disabled
                value={user.role || 'Super Admin'}
                className="mt-1 w-full cursor-not-allowed rounded-xl border border-gray-800/60 bg-gray-950/60 px-3.5 py-2 text-xs text-gray-400 capitalize"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400">
                Condominium (Read-Only)
              </label>
              <input
                type="text"
                disabled
                value={user.condoName || 'Sunrise Condominium'}
                className="mt-1 w-full cursor-not-allowed rounded-xl border border-gray-800/60 bg-gray-950/60 px-3.5 py-2 text-xs text-gray-400"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#D3AD32] px-5 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] disabled:opacity-60"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
