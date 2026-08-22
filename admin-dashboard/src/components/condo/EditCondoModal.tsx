import { useState, useEffect } from 'react'
import { X, Pencil, AlertCircle } from 'lucide-react'
import type { Condo, UpdateCondoPayload } from '../../services/types/condo'
import { updateCondoApi } from '../../services/api/condoApi'

interface EditCondoModalProps {
  isOpen: boolean
  condo: Condo
  onClose: () => void
  onSuccess: () => void
}

export const EditCondoModal = ({
  isOpen,
  condo,
  onClose,
  onSuccess,
}: EditCondoModalProps) => {
  const [condoName, setCondoName] = useState(condo.condoName || '')
  const [address, setAddress] = useState(condo.address || '')
  const [city, setCity] = useState(condo.city || '')
  const [maxAdmins, setMaxAdmins] = useState<number>(condo.maxAdmins || 3)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setCondoName(condo.condoName || '')
    setAddress(condo.address || '')
    setCity(condo.city || '')
    setMaxAdmins(condo.maxAdmins || 3)
  }, [condo])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!condoName.trim() || !address.trim() || !city.trim()) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    const payload: UpdateCondoPayload = {
      condoName: condoName.trim(),
      address: address.trim(),
      city: city.trim(),
      maxAdmins: Number(maxAdmins) || 3,
    }

    try {
      setIsSubmitting(true)
      await updateCondoApi(condo.id, payload)
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update condominium.'
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
              <h3 className="text-lg font-bold text-gray-100">
                Edit Condominium
              </h3>
              <p className="text-xs text-gray-400">
                Update property details for {condo.condoCode}
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
              Condo Name
            </label>
            <input
              type="text"
              required
              value={condoName}
              onChange={(e) => setCondoName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Full Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                City / Region
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Max Admins Allowed
              </label>
              <input
                type="number"
                required
                min="1"
                value={maxAdmins}
                onChange={(e) => setMaxAdmins(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCondoModal
