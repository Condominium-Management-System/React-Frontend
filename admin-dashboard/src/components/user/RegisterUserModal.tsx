import { useState } from 'react'
import { X, UserPlus, AlertCircle } from 'lucide-react'
import type { CreateUserPayload } from '../../services/types/user'
import { createUserApi } from '../../services/api/apiClient'

interface RegisterUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const RegisterUserModal = ({
  isOpen,
  onClose,
  onSuccess,
}: RegisterUserModalProps) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [fan, setFan] = useState('')
  const [condoCode, setCondoCode] = useState('YEKONDO-001')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phoneNumber.trim() ||
      !fan.trim() ||
      !condoCode.trim()
    ) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (fan.trim().length !== 16 || !/^\d{16}$/.test(fan.trim())) {
      setErrorMessage('FAN Number must be exactly 16 digits.')
      return
    }

    const payload: CreateUserPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      phoneNumber: phoneNumber.trim(),
      fan: fan.trim(),
      condoCode: condoCode.trim().toUpperCase(),
    }

    try {
      setIsSubmitting(true)
      await createUserApi(payload)
      // Reset form
      setFullName('')
      setEmail('')
      setPassword('')
      setPhoneNumber('')
      setFan('')
      setCondoCode('YEKONDO-001')

      onSuccess()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register user.'
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
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">
                Register New User
              </h3>
              <p className="text-xs text-gray-400">
                Add a new user to the condominium management network
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
              placeholder="e.g. Abebe Kebede"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
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
                placeholder="e.g. abebe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 0912345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Condo Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. YEKONDO-001"
                value={condoCode}
                onChange={(e) => setCondoCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              FAN Number (16 Digits)
            </label>
            <input
              type="text"
              required
              maxLength={16}
              placeholder="e.g. 1234567890123456"
              value={fan}
              onChange={(e) => setFan(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none font-mono"
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
              {isSubmitting ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterUserModal
