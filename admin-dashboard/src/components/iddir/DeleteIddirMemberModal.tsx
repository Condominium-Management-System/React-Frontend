import { useState } from 'react'
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react'
import { deleteIddirMemberApi } from '../../services/api/iddirApi'
import type { IddirMember } from '../../services/types/iddir'

interface DeleteIddirMemberModalProps {
  isOpen: boolean
  member: IddirMember | null
  onClose: () => void
  onSuccess: (deletedMemberId: string) => void
}

export const DeleteIddirMemberModal = ({
  isOpen,
  member,
  onClose,
  onSuccess,
}: DeleteIddirMemberModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen || !member) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setErrorMessage(null)
      const condoId = member.iddir?.condoId || member.user?.condoId
      await deleteIddirMemberApi(condoId, member.id)
      onSuccess(member.id)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove member.'
      setErrorMessage(msg)
    } finally {
      setIsDeleting(false)
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
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0F131C] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Remove Member</h3>
              <p className="text-xs text-red-400">
                Confirm removal of member from Iddir fund
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

        <div className="space-y-3 text-xs md:text-sm text-gray-300">
          <p>
            Are you sure you want to remove <span className="font-bold text-gray-100">{member.user?.fullName || 'this member'}</span> from <span className="font-bold text-gray-100">{member.iddir?.name || 'the Iddir fund'}</span>?
          </p>
          <p className="text-xs text-gray-400">
            Note: Removing a member will set their status to inactive and decrement the active member count for this Iddir. The Iddir fund itself will remain active.
          </p>
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
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? 'Removing...' : 'Confirm Remove'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteIddirMemberModal
