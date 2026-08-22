import { useState } from 'react'
import { X, Building2, AlertCircle } from 'lucide-react'
import type { CreateCondoPayload } from '../../services/types/condo'
import { createCondoApi } from '../../services/api/condoApi'

interface RegisterCondoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const RegisterCondoModal = ({
  isOpen,
  onClose,
  onSuccess,
}: RegisterCondoModalProps) => {
  const [condoCode, setCondoCode] = useState('')
  const [condoName, setCondoName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Addis Ababa')
  const [maxAdmins, setMaxAdmins] = useState<number>(3)
  const [blocksInput, setBlocksInput] = useState('A, B, C')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!condoCode.trim() || !condoName.trim() || !address.trim() || !city.trim()) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    const blocksArray = blocksInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean)

    const payload: CreateCondoPayload = {
      condoCode: condoCode.trim().toUpperCase(),
      condoName: condoName.trim(),
      address: address.trim(),
      city: city.trim(),
      maxAdmins: Number(maxAdmins) || 3,
      blockNumbers: blocksArray.length > 0 ? blocksArray : ['A', 'B'],
    }

    try {
      setIsSubmitting(true)
      await createCondoApi(payload)
      // Reset form
      setCondoCode('')
      setCondoName('')
      setAddress('')
      setCity('Addis Ababa')
      setMaxAdmins(3)
      setBlocksInput('A, B, C')

      onSuccess()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register condominium.'
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
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">
                Register New Condominium
              </h3>
              <p className="text-xs text-gray-400">
                Add a new property to the management network
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Condo Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. YK-001"
                value={condoCode}
                onChange={(e) => setCondoCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                City / Region
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Addis Ababa"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Condo Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Yeka Condominium"
              value={condoName}
              onChange={(e) => setCondoName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Full Address
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Addis Ababa, Yeka Sub-City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Max Admins Allowed
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="3"
                value={maxAdmins}
                onChange={(e) => setMaxAdmins(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Block Numbers (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. A, B, C"
                value={blocksInput}
                onChange={(e) => setBlocksInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none font-mono"
              />
            </div>
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
              {isSubmitting ? 'Registering...' : 'Register Condo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterCondoModal
