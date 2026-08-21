import { useState } from 'react'
import { X, Building2, AlertCircle } from 'lucide-react'
import { createBlockApi } from '../../services/api/apiClient'
import type { Block } from '../../services/types/property'

interface CreateBlockModalProps {
  isOpen: boolean
  condoId: string
  onClose: () => void
  onSuccess: (newBlock: Block) => void
}

export const CreateBlockModal = ({
  isOpen,
  condoId,
  onClose,
  onSuccess,
}: CreateBlockModalProps) => {
  const [blockNo, setBlockNo] = useState('')
  const [noRooms, setNoRooms] = useState<number>(40)
  const [noFloors, setNoFloors] = useState<number>(5)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!condoId) {
      setErrorMessage('Condominium ID is required to create a block.')
      return
    }

    if (!blockNo.trim()) {
      setErrorMessage('Please provide a block number (e.g. B1).')
      return
    }

    try {
      setIsSubmitting(true)
      const created = await createBlockApi(condoId, {
        condoId,
        blockNo: blockNo.trim(),
        noRooms: Number(noRooms) || 1,
        noFloors: Number(noFloors) || 1,
      })
      onSuccess(created)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create block.'
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
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Add New Block</h3>
              <p className="text-xs text-gray-400">
                Register a new building block for this condominium
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
              Block Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. B1"
              value={blockNo}
              onChange={(e) => setBlockNo(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Number of Rooms *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={noRooms}
                onChange={(e) => setNoRooms(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Number of Floors *
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={noFloors}
                onChange={(e) => setNoFloors(parseInt(e.target.value, 10) || 1)}
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
              {isSubmitting ? 'Creating Block...' : 'Create Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBlockModal
