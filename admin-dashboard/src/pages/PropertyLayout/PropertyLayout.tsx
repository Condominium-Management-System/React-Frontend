import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../../context/useAuth'
import { isSuperAdmin } from '../../utils/roleHelpers'
import type { Condo } from '../../services/types/condo'
import type { Block, Room } from '../../services/types/property'
import { getCondosApi } from '../../services/api/condoApi'
import { getBlocksApi, getRoomsApi } from '../../services/api/propertyApi'
import PropertyStats from '../../components/property/PropertyStats'
import PropertyFilters from '../../components/property/PropertyFilters'
import RoomTable from '../../components/property/RoomTable'
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

  // Search & Status Filter
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
      <PropertyStats
        totalBlocks={totalBlocks}
        totalRooms={totalRooms}
        freeCount={freeCount}
        occupiedCount={occupiedCount}
        reservedCount={reservedCount}
        maintenanceCount={maintenanceCount}
      />

      {/* 3. Search Bar + Filters + Actions Row */}
      <PropertyFilters
        searchQuery={searchQuery}
        onSearchChange={(e) => {
          setSearchQuery(e.target.value)
          setCurrentPage(1)
        }}
        selectedStatusFilter={selectedStatusFilter}
        onStatusChange={(e) => {
          setSelectedStatusFilter(e.target.value)
          setCurrentPage(1)
        }}
        isSuper={isSuper}
        onAddBlock={() => setIsAddBlockOpen(true)}
        onAddRoom={() => setIsAddRoomOpen(true)}
      />

      {/* 4. Main Units Table Container */}
      <RoomTable
        rooms={paginatedRooms}
        isLoading={isLoading}
        errorMessage={errorMessage}
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndexDisplay={startIndexDisplay}
        endIndexDisplay={endIndexDisplay}
        onPageChange={setCurrentPage}
        onUpdateStatus={(room) => {
          setSelectedUpdateRoom(room)
          setIsUpdateStatusOpen(true)
        }}
        onRetry={fetchPropertyData}
        isSuper={isSuper}
      />

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
