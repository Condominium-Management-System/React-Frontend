import { Building2, DoorOpen, CheckCircle2, Clock, Wrench } from 'lucide-react'

interface PropertyStatsProps {
  totalBlocks: number
  totalRooms: number
  freeCount: number
  occupiedCount: number
  reservedCount: number
  maintenanceCount: number
}

export const PropertyStats = ({
  totalBlocks,
  totalRooms,
  freeCount,
  occupiedCount,
  reservedCount,
  maintenanceCount,
}: PropertyStatsProps) => {
  return (
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
  )
}

export default PropertyStats
