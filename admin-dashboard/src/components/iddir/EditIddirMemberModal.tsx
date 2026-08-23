import { useState, useEffect } from 'react'
import { X, Edit2, AlertCircle } from 'lucide-react'
import { updateIddirMemberApi } from '../../services/api/iddirApi'
import type { IddirMember } from '../../services/types/iddir'

interface EditIddirMemberModalProps {
  isOpen: boolean
  member: IddirMember | null
  onClose: () => void
  onSuccess: (updatedMember: IddirMember) => void
}

export const EditIddirMemberModal = ({
  isOpen,
  member,
  onClose,
  onSuccess,
}: EditIddirMemberModalProps) => {
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended'>('active')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && member) {
      setStatus((member.status as 'active' | 'inactive' | 'suspended') || 'active')
      setErrorMessage(null)
    }
  }, [isOpen, member])

  if (!isOpen || !member) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      setIsSubmitting(true)
      const condoId = member.iddir?.condoId || member.user?.condoId
      const updated = await updateIddirMemberApi(condoId, member.id, {
        status,
      })
      onSuccess(updated)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update member status.'
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
              <h3 className="text-lg font-bold text-gray-100">Edit Member Status</h3>
              <p className="text-xs text-gray-400">
                Update membership status for {member.user?.fullName || 'Resident Member'}
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
              Member Name
            </label>
            <input
              type="text"
              disabled
              value={member.user?.fullName || ''}
              className="w-full rounded-xl border border-gray-800 bg-gray-900/50 px-3.5 py-2.5 text-xs md:text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Assigned Iddir Fund
            </label>
            <input
              type="text"
              disabled
              value={member.iddir?.name || ''}
              className="w-full rounded-xl border border-gray-800 bg-gray-900/50 px-3.5 py-2.5 text-xs md:text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Membership Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
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
              {isSubmitting ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditIddirMemberModal
