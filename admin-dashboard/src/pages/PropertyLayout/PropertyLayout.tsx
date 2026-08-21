import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Building2,
  DoorOpen,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { isSuperAdmin } from '../../utils/roleHelpers'
import type { Condo } from '../../services/types/condo'
import type { Block, Room } from '../../services/types/property'
import {
  getCondosApi,
  getBlocksApi,
  getRoomsApi,
} from '../../services/api/apiClient'
import CreateBlockModal from '../../components/property/CreateBlockModal'
import CreateRoomModal from '../../components/property/CreateRoomModal'
import UpdateRoomStatusModal from '../../components/property/UpdateRoomStatusModal'

const ITEMS_PER_PAGE = 8

export const PropertyLayout = () => {
  const { user } = useAuth()
  const isSuper = isSuperAdmin(user?.role)

  // Condos List state (Super Admin)
  const [condos, setCondos] = useState<Condo[]>([])
  const [selectedCondoId, setSelectedCondoId] = useState<string>(
    isSuper ? 'ALL' : user?.condoId || ''
  )

  // Property Layout Data
  const [blocks, setBlocks] = useState<Block[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Search & Status Filter (Block filter removed per specification)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Modals (Condo Admin Only)
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false)
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [selectedUpdateRoom, setSelectedUpdateRoom] = useState<Room | null>(null)
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)

  // 1. Fetch Condos for Super Admin dropdown
  const fetchCondos = useCallback(async () => {
    if (!isSuper) return
    try {
      const data = await getCondosApi()
      setCondos(data)
    } catch {
      // Ignore condo dropdown fetch errors
    }
  }, [isSuper])

  // Effective Condo ID for Condo Admin
  const condoAdminCondoId = user?.condoId || ''

  // 2. Fetch Blocks & Rooms
  const fetchPropertyData = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)

      if (isSuper && selectedCondoId === 'ALL') {
        // Super Admin: All Condominiums selected
        let condoList = condos
        if (condoList.length === 0) {
          condoList = await getCondosApi()
          setCondos(condoList)
        }

        if (condoList.length === 0) {
          setBlocks([])
          setRooms([])
          return
        }

        const blocksNested = await Promise.all(
          condoList.map(async (c) => {
            try {
              const bList = await getBlocksApi(c.id)
              return bList.map((b) => ({
                ...b,
                condoName: c.condoName,
                condoCode: c.condoCode,
              }))
            } catch {
              return []
            }
          })
        )

        const roomsNested = await Promise.all(
          condoList.map(async (c) => {
            try {
              const rList = await getRoomsApi(c.id)
              return rList.map((r) => ({
                ...r,
                condoName: c.condoName,
                condoCode: c.condoCode,
              }))
            } catch {
              return []
            }
          })
        )

        setBlocks(blocksNested.flat())
        setRooms(roomsNested.flat())
      } else {
        // Single condo selected (Super Admin selected condo or Condo Admin own condo)
        const targetId = isSuper ? selectedCondoId : condoAdminCondoId
        if (!targetId) {
          setIsLoading(false)
          return
        }

        const condoObj = condos.find((c) => c.id === targetId)
        const [blocksData, roomsData] = await Promise.all([
          getBlocksApi(targetId),
          getRoomsApi(targetId),
        ])

        const mappedBlocks = blocksData.map((b) => ({
          ...b,
          condoName: condoObj?.condoName || user?.condoCode,
          condoCode: condoObj?.condoCode || user?.condoCode,
        }))

        const mappedRooms = roomsData.map((r) => ({
          ...r,
          condoName: condoObj?.condoName || user?.condoCode,
          condoCode: condoObj?.condoCode || user?.condoCode,
        }))

        setBlocks(mappedBlocks)
        setRooms(mappedRooms)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load property data.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [isSuper, selectedCondoId, condos, condoAdminCondoId, user?.condoCode])

  useEffect(() => {
    fetchCondos()
  }, [fetchCondos])

  useEffect(() => {
    fetchPropertyData()
  }, [fetchPropertyData])

  // Summary Metrics
  const totalBlocks = blocks.length
  const totalRooms = rooms.length
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length
  const freeCount = rooms.filter((r) => r.status === 'free').length
  const reservedCount = rooms.filter((r) => r.status === 'reserved').length
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance').length

  // Filtered Rooms List (Search & Status Filter)
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const query = searchQuery.trim().toLowerCase()

      const blockLabel = (
        room.block?.blockNo ||
        room.block?.blockName ||
        room.block?.blockNumber ||
        ''
      ).toLowerCase()

      const matchesSearch =
        !query ||
        room.roomNumber.toLowerCase().includes(query) ||
        blockLabel.includes(query) ||
        (room.roomType || '').toLowerCase().includes(query) ||
        (room.status || '').toLowerCase().includes(query) ||
        (room.condoName || '').toLowerCase().includes(query) ||
        (room.condoCode || '').toLowerCase().includes(query)

      const matchesStatus =
        selectedStatusFilter === 'ALL' || room.status === selectedStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [rooms, searchQuery, selectedStatusFilter])

  // Pagination calculations
  const totalItems = filteredRooms.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndexDisplay =
    totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1
  const endIndexDisplay = Math.min(
    validCurrentPage * ITEMS_PER_PAGE,
    totalItems
  )

  const paginatedRooms = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredRooms.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredRooms, validCurrentPage])

  // Handlers
  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCondoId(e.target.value)
    setCurrentPage(1)
  }

  const handleBlockCreated = (newBlock: Block) => {
    setBlocks((prev) => [...prev, newBlock])
    fetchPropertyData()
  }

  const handleRoomCreated = (newRoom: Room) => {
    setRooms((prev) => [...prev, newRoom])
    fetchPropertyData()
  }

  const handleRoomUpdated = (updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r))
    )
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100 tracking-tight">
            Property Layout & Units
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-400">
            {isSuper
              ? 'View condominium blocks, floor levels, and unit occupancy across properties.'
              : 'Manage condominium blocks, floor levels, and unit occupancy status.'}
          </p>
        </div>

        {/* Super Admin Condominium Selector with "All Condominiums" option */}
        {isSuper && (
          <div className="w-full sm:w-64 shrink-0">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Select Condominium
            </label>
            <select
              value={selectedCondoId}
              onChange={handleCondoChange}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="ALL">All Condominiums</option>
              {condos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.condoName} ({c.condoCode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Statistics Grid (5 Cards) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {/* Total Blocks */}
        <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Blocks
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-100">{totalBlocks}</span>
          </div>
        </div>

        {/* Total Units */}
        <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Units
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300">
              <DoorOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-100">{totalRooms}</span>
          </div>
        </div>

        {/* Free Units */}
        <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Free (Vacant)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-400">{freeCount}</span>
          </div>
        </div>

        {/* Occupied Units */}
        <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Occupied
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-400">{occupiedCount}</span>
          </div>
        </div>

        {/* Maintenance / Reserved */}
        <div className="rounded-xl border border-gray-800 bg-[#0F131C] p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Reserved / Maint.
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-400">
              {reservedCount + maintenanceCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar + Filters + Actions Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search + Status Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search units by number, block, or type..."
              className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 pl-9 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-gray-800 bg-[#0F131C] py-2.5 px-3 text-xs md:text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="free">Free (Vacant)</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Right: Add Actions (CONDO ADMIN ONLY - Super Admin is VIEW-ONLY) */}
        {!isSuper && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddBlockOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs font-bold text-gray-200 transition-colors hover:bg-gray-800 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#D3AD32]" />
              <span>Add Block</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddRoomOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Unit</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Units Table Container */}
      <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-80 w-full items-center justify-center text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
                Loading units and property layout...
              </span>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center text-gray-400">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-200">Unable to load units</h3>
            <p className="mt-1 text-xs text-gray-400">{errorMessage}</p>
            <button
              type="button"
              onClick={fetchPropertyData}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 hover:bg-[#E4C043] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  <th className="py-3.5 px-4 md:px-5">UNIT NUMBER</th>
                  {isSuper && <th className="py-3.5 px-4 md:px-5">CONDOMINIUM</th>}
                  <th className="py-3.5 px-4 md:px-5">BLOCK</th>
                  <th className="py-3.5 px-4 md:px-5">FLOOR</th>
                  <th className="py-3.5 px-4 md:px-5">TYPE</th>
                  <th className="py-3.5 px-4 md:px-5">STATUS</th>
                  {!isSuper && <th className="py-3.5 px-4 md:px-5 text-right">ACTIONS</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs md:text-sm">
                {paginatedRooms.length > 0 ? (
                  paginatedRooms.map((room) => (
                    <tr
                      key={room.id}
                      className="transition-colors hover:bg-[#131926]"
                    >
                      <td className="py-3.5 px-4 md:px-5 font-bold font-mono text-gray-100">
                        Unit {room.roomNumber}
                      </td>
                      {isSuper && (
                        <td className="py-3.5 px-4 md:px-5 font-medium text-gray-300">
                          {room.condoName || room.condoCode || '—'}
                        </td>
                      )}
                      <td className="py-3.5 px-4 md:px-5 font-medium text-gray-200">
                        {room.block?.blockNo || room.block?.blockName || room.block?.blockNumber || 'Block A'}
                      </td>
                      <td className="py-3.5 px-4 md:px-5 text-gray-300">
                        Floor {room.floor || 1}
                      </td>
                      <td className="py-3.5 px-4 md:px-5 text-gray-300 capitalize">
                        {room.roomType || 'residential'}
                      </td>
                      <td className="py-3.5 px-4 md:px-5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                            room.status === 'free'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : room.status === 'occupied'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              : room.status === 'reserved'
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                          }`}
                        >
                          {room.status ? room.status.toUpperCase() : 'FREE'}
                        </span>
                      </td>
                      {!isSuper && (
                        <td className="py-3.5 px-4 md:px-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUpdateRoom(room)
                              setIsUpdateStatusOpen(true)
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1 text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Status</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isSuper ? 6 : 6} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <DoorOpen className="h-10 w-10 text-gray-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-300">
                          No units registered
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {isSuper
                            ? 'No apartment units found for the selected condominium.'
                            : 'Click "Add Unit" above to register apartment units for this condominium.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-800 bg-gray-950/40 px-4 md:px-5 py-3.5 text-xs text-gray-400">
          <div>
            Showing <span className="font-semibold text-gray-200">{startIndexDisplay}</span>-
            <span className="font-semibold text-gray-200">{endIndexDisplay}</span> of{' '}
            <span className="font-semibold text-gray-200">{totalItems}</span> units
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  pageNum === validCurrentPage
                    ? 'bg-[#D3AD32] text-gray-950 font-bold'
                    : 'border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals (Condo Admin Only) */}
      {!isSuper && (
        <>
          <CreateBlockModal
            isOpen={isAddBlockOpen}
            condoId={condoAdminCondoId}
            onClose={() => setIsAddBlockOpen(false)}
            onSuccess={handleBlockCreated}
          />

          <CreateRoomModal
            isOpen={isAddRoomOpen}
            condoId={condoAdminCondoId}
            blocks={blocks}
            onClose={() => setIsAddRoomOpen(false)}
            onSuccess={handleRoomCreated}
          />

          {selectedUpdateRoom && (
            <UpdateRoomStatusModal
              isOpen={isUpdateStatusOpen}
              condoId={condoAdminCondoId}
              room={selectedUpdateRoom}
              onClose={() => {
                setIsUpdateStatusOpen(false)
                setSelectedUpdateRoom(null)
              }}
              onSuccess={handleRoomUpdated}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PropertyLayout
