import { useState, useEffect, useCallback } from 'react'
import { X, DoorOpen, AlertCircle } from 'lucide-react'
import { createRoomApi, getBlocksApi } from '../../services/api/propertyApi'
import type { Block, Room, RoomStatus } from '../../services/types/property'
import type { Condo } from '../../services/types/condo'

interface CreateRoomModalProps {
  isOpen: boolean
  condoId: string
  condos?: Condo[]
  blocks: Block[]
  selectedBlockId?: string
  onClose: () => void
  onSuccess: (newRoom: Room) => void
}

export const CreateRoomModal = ({
  isOpen,
  condoId,
  condos = [],
  blocks: initialBlocks,
  selectedBlockId,
  onClose,
  onSuccess,
}: CreateRoomModalProps) => {
  const isCondoSelectorNeeded = !condoId || condoId === 'ALL'

  const [selectedCondoId, setSelectedCondoId] = useState<string>('')
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>(initialBlocks)
  const [blockId, setBlockId] = useState<string>('')
  const [roomNumber, setRoomNumber] = useState('')
  const [floor, setFloor] = useState<number>(1)
  const [roomType, setRoomType] = useState('residential')
  const [status, setStatus] = useState<RoomStatus>('free')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch blocks for selected condo if Super Admin changes condo in modal
  const fetchBlocksForCondo = useCallback(async (targetCondoId: string) => {
    if (!targetCondoId) {
      setAvailableBlocks([])
      setBlockId('')
      return
    }
    try {
      const fetchedBlocks = await getBlocksApi(targetCondoId)
      setAvailableBlocks(fetchedBlocks)
      setBlockId(fetchedBlocks[0]?.id || '')
    } catch {
      setAvailableBlocks([])
      setBlockId('')
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setRoomNumber('')
      setFloor(1)
      setRoomType('residential')
      setStatus('free')
      setErrorMessage(null)

      if (isCondoSelectorNeeded) {
        const initialCondoId = condos[0]?.id || ''
        setSelectedCondoId(initialCondoId)
        fetchBlocksForCondo(initialCondoId)
      } else {
        setSelectedCondoId(condoId)
        setAvailableBlocks(initialBlocks)
        setBlockId(selectedBlockId || (initialBlocks[0] ? initialBlocks[0].id : ''))
      }
    }
  }, [isOpen, condoId, isCondoSelectorNeeded, condos, initialBlocks, selectedBlockId, fetchBlocksForCondo])

  if (!isOpen) return null

  const handleCondoChangeInModal = (newCondoId: string) => {
    setSelectedCondoId(newCondoId)
    fetchBlocksForCondo(newCondoId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const targetCondoId = isCondoSelectorNeeded ? selectedCondoId : condoId

    if (!targetCondoId) {
      setErrorMessage('Please select a condominium for this unit.')
      return
    }

    const targetBlockId = blockId || selectedBlockId || (availableBlocks[0] ? availableBlocks[0].id : '')

    if (!targetBlockId) {
      setErrorMessage('Please select a block for this unit.')
      return
    }

    if (!roomNumber.trim()) {
      setErrorMessage('Please provide a unit/room number (e.g. 101).')
      return
    }

    try {
      setIsSubmitting(true)
      const created = await createRoomApi(targetCondoId, {
        blockId: targetBlockId,
        roomNumber: roomNumber.trim(),
        floor: Number(floor) || 1,
        roomType,
        status,
      })
      onSuccess(created)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create unit/room.'
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
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Add New Unit / Room</h3>
              <p className="text-xs text-gray-400">
                Register an apartment unit or room in a block
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
          {/* Condominium Selector for Super Admin when ALL is selected */}
          {isCondoSelectorNeeded && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Select Condominium *
              </label>
              <select
                value={selectedCondoId}
                onChange={(e) => handleCondoChangeInModal(e.target.value)}
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
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Select Block *
            </label>
            <select
              value={blockId}
              onChange={(e) => setBlockId(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              {availableBlocks.length > 0 ? (
                availableBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.blockNo || b.blockName || b.blockNumber || 'Block'} {b.condoName ? `(${b.condoName})` : ''}
                  </option>
                ))
              ) : (
                <option value="">No Blocks Available</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Floor
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Unit Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="office">Office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RoomStatus)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
              >
                <option value="free">Free (Vacant)</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
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
              {isSubmitting ? 'Creating Unit...' : 'Create Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRoomModal
