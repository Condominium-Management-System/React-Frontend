import { useState, useEffect, useCallback } from 'react'
import { X, UserPlus, AlertCircle } from 'lucide-react'
import { addIddirMemberApi, getIddirsApi } from '../../services/api/iddirApi'
import { getUsersApi } from '../../services/api/userApi'
import type { Iddir, IddirMember } from '../../services/types/iddir'
import type { Condo } from '../../services/types/condo'
import type { User } from '../../services/types/auth'

interface RegisterIddirMemberModalProps {
  isOpen: boolean
  condos: Condo[]
  onClose: () => void
  onSuccess: (newMember: IddirMember) => void
}

export const RegisterIddirMemberModal = ({
  isOpen,
  condos,
  onClose,
  onSuccess,
}: RegisterIddirMemberModalProps) => {
  const [selectedCondoId, setSelectedCondoId] = useState<string>('')
  const [availableIddirs, setAvailableIddirs] = useState<Iddir[]>([])
  const [availableResidents, setAvailableResidents] = useState<User[]>([])

  const [iddirId, setIddirId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch Iddirs and Resident Users for selected condo
  const loadCondoOptions = useCallback(async (condoId: string) => {
    if (!condoId) {
      setAvailableIddirs([])
      setAvailableResidents([])
      setIddirId('')
      setUserId('')
      return
    }

    try {
      setIsLoadingOptions(true)
      setErrorMessage(null)

      const [iddirsData, usersData] = await Promise.all([
        getIddirsApi(condoId),
        getUsersApi(condoId),
      ])

      // Only active iddirs
      const activeIddirs = iddirsData.filter((i) => i.status === 'active')
      setAvailableIddirs(activeIddirs)
      setIddirId(activeIddirs[0]?.id || '')

      // Only residents
      const residents = usersData.filter((u) => u.role === 'resident')
      setAvailableResidents(residents)
      setUserId(residents[0]?.id || '')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load condominium options.'
      setErrorMessage(msg)
      setAvailableIddirs([])
      setAvailableResidents([])
    } finally {
      setIsLoadingOptions(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
      const initialCondo = condos[0]?.id || ''
      setSelectedCondoId(initialCondo)
      if (initialCondo) {
        loadCondoOptions(initialCondo)
      }
    }
  }, [isOpen, condos, loadCondoOptions])

  if (!isOpen) return null

  const handleCondoChange = (newCondoId: string) => {
    setSelectedCondoId(newCondoId)
    loadCondoOptions(newCondoId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedCondoId) {
      setErrorMessage('Please select a condominium.')
      return
    }

    if (!iddirId) {
      setErrorMessage('Please select an active Iddir.')
      return
    }

    if (!userId) {
      setErrorMessage('Please select a resident user.')
      return
    }

    try {
      setIsSubmitting(true)
      const created = await addIddirMemberApi({
        userId,
        iddirId,
      })
      onSuccess(created)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add user to Iddir.'
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Add Iddir Member</h3>
              <p className="text-xs text-gray-400">
                Register a resident user into a community Iddir
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
          {/* Condominium Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Select Condominium *
            </label>
            <select
              value={selectedCondoId}
              onChange={(e) => handleCondoChange(e.target.value)}
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

          {/* Iddir Fund Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Select Iddir Fund *
            </label>
            <select
              value={iddirId}
              disabled={isLoadingOptions || availableIddirs.length === 0}
              onChange={(e) => setIddirId(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none disabled:opacity-50"
            >
              {availableIddirs.length > 0 ? (
                availableIddirs.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.contributionAmount ? `${i.contributionAmount} ETB/mo` : 'Active'})
                  </option>
                ))
              ) : (
                <option value="">
                  {isLoadingOptions ? 'Loading Iddirs...' : 'No Active Iddirs in this Condo'}
                </option>
              )}
            </select>
          </div>

          {/* Resident User Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Select Resident User *
            </label>
            <select
              value={userId}
              disabled={isLoadingOptions || availableResidents.length === 0}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none disabled:opacity-50"
            >
              {availableResidents.length > 0 ? (
                availableResidents.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email || u.phoneNumber}) {u.block ? `[Blk ${u.block}]` : ''}
                  </option>
                ))
              ) : (
                <option value="">
                  {isLoadingOptions ? 'Loading Residents...' : 'No Resident Users in this Condo'}
                </option>
              )}
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
              disabled={isSubmitting || isLoadingOptions || !iddirId || !userId}
              className="rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 hover:bg-[#E4C043] disabled:opacity-60 cursor-pointer transition-colors"
            >
              {isSubmitting ? 'Adding Member...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterIddirMemberModal
