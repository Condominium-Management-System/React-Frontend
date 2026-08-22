import { useState, useEffect } from 'react'
import { X, HeartHandshake, AlertCircle } from 'lucide-react'
import { createIddirApi } from '../../services/api/iddirApi'
import type { Iddir } from '../../services/types/iddir'
import type { Condo } from '../../services/types/condo'

interface CreateIddirModalProps {
  isOpen: boolean
  condos: Condo[]
  onClose: () => void
  onSuccess: (newIddir: Iddir) => void
}

export const CreateIddirModal = ({
  isOpen,
  condos,
  onClose,
  onSuccess,
}: CreateIddirModalProps) => {
  const [condoId, setCondoId] = useState<string>('')
  const [name, setName] = useState('')
  const [startedDate, setStartedDate] = useState('')
  const [contributionAmount, setContributionAmount] = useState<number | ''>(500)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setCondoId(condos[0]?.id || '')
      setName('')
      // Default to today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0]
      setStartedDate(today)
      setContributionAmount(500)
      setErrorMessage(null)
    }
  }, [isOpen, condos])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!condoId) {
      setErrorMessage('Please select a condominium for this Iddir.')
      return
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Iddir name must be at least 2 characters.')
      return
    }

    if (!startedDate) {
      setErrorMessage('Please select a valid started date.')
      return
    }

    const numAmount = Number(contributionAmount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Contribution amount must be a positive number.')
      return
    }

    try {
      setIsSubmitting(true)
      const created = await createIddirApi(condoId, {
        condoId,
        name: name.trim(),
        startedDate,
        contributionAmount: numAmount,
      })
      onSuccess(created)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create Iddir.'
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
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Add New Iddir</h3>
              <p className="text-xs text-gray-400">
                Register a new community Iddir for a condominium
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
              Select Condominium *
            </label>
            <select
              value={condoId}
              onChange={(e) => setCondoId(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              {condos.length > 0 ? (
                condos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.condoName} ({c.condoCode})
                  </option>
                ))
              ) : (
                <option value="">No Condominiums Available</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Iddir Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunrise Mutual Iddir"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Started Date *
              </label>
              <input
                type="date"
                required
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
              {isSubmitting ? 'Creating Iddir...' : 'Create Iddir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateIddirModal
