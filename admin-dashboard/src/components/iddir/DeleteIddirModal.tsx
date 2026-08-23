import { useState } from 'react'
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react'
import { deleteIddirApi } from '../../services/api/iddirApi'
import type { Iddir } from '../../services/types/iddir'

interface DeleteIddirModalProps {
  isOpen: boolean
  iddir: Iddir | null
  onClose: () => void
  onSuccess: (deletedIddirId: string) => void
}

export const DeleteIddirModal = ({
  isOpen,
  iddir,
  onClose,
  onSuccess,
}: DeleteIddirModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen || !iddir) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setErrorMessage(null)
      await deleteIddirApi(iddir.condoId, iddir.id)
      onSuccess(iddir.id)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete Iddir.'
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
              <h3 className="text-lg font-bold text-gray-100">Delete Iddir</h3>
              <p className="text-xs text-red-400">
                Confirm deletion of community Iddir fund
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
            Are you sure you want to delete <span className="font-bold text-gray-100">{iddir.name}</span>?
          </p>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400 text-xs leading-relaxed space-y-1">
            <p className="font-semibold uppercase tracking-wider text-[10px]">Warning:</p>
            <p>
              Deleting this Iddir will automatically remove all associated resident members ({iddir._count?.members ?? iddir.noMembers ?? 0} members) from the Iddir. This action cannot be undone.
            </p>
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
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteIddirModal
