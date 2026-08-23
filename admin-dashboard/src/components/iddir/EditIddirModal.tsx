import { useState, useEffect } from 'react'
import { X, Edit2, AlertCircle } from 'lucide-react'
import { updateIddirApi } from '../../services/api/iddirApi'
import type { Iddir } from '../../services/types/iddir'

interface EditIddirModalProps {
  isOpen: boolean
  iddir: Iddir | null
  onClose: () => void
  onSuccess: (updatedIddir: Iddir) => void
}

export const EditIddirModal = ({
  isOpen,
  iddir,
  onClose,
  onSuccess,
}: EditIddirModalProps) => {
  const [name, setName] = useState('')
  const [startedDate, setStartedDate] = useState('')
  const [contributionAmount, setContributionAmount] = useState<number | ''>('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && iddir) {
      setName(iddir.name || '')
      const dateVal = iddir.startedDate ? iddir.startedDate.split('T')[0] : ''
      setStartedDate(dateVal)
      setContributionAmount(iddir.contributionAmount || 0)
      setStatus((iddir.status as 'active' | 'inactive') || 'active')
      setErrorMessage(null)
    }
  }, [isOpen, iddir])

  if (!isOpen || !iddir) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Iddir name must be at least 2 characters.')
      return
    }

    const numAmount = Number(contributionAmount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Contribution amount must be a positive number.')
      return
    }

    try {
      setIsSubmitting(true)
      const updated = await updateIddirApi(iddir.condoId, iddir.id, {
        name: name.trim(),
        startedDate: startedDate || undefined,
        contributionAmount: numAmount,
        status,
      })
      onSuccess(updated)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update Iddir.'
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

      {/* Container */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F131C] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Edit Iddir</h3>
              <p className="text-xs text-gray-400">
                Update Iddir details and active status
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
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Iddir Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Started Date
              </label>
              <input
                type="date"
                value={startedDate}
                onChange={(e) => setStartedDate(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Monthly Amount (ETB) *
              </label>
              <input
                type="number"
                min={1}
                step="any"
                required
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-800/80 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 hover:bg-[#E4C043] disabled:opacity-60 cursor-pointer transition-colors"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditIddirModal
