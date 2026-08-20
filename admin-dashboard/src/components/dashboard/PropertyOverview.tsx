import { Boxes, DoorClosed, CheckCircle2, Home, Lock } from 'lucide-react'

interface PropertyOverviewProps {
  blocksTotal: number | string
  roomsTotal: number | string
  roomsOccupied?: number | string
  roomsFree?: number | string
  roomsReserved?: number | string
}

export const PropertyOverview = ({
  blocksTotal,
  roomsTotal,
  roomsOccupied = '—',
  roomsFree = '—',
  roomsReserved = '—',
}: PropertyOverviewProps) => {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-gray-100 tracking-tight">
            Property Overview
          </h3>
          <p className="text-xs text-gray-400">
            Infrastructure summary for blocks and room allocations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Blocks Card */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-800/60 bg-gray-900/50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Blocks
            </span>
            <p className="text-2xl font-black text-gray-100 mt-0.5">
              {blocksTotal}
            </p>
          </div>
        </div>

        {/* Total Rooms & Status Breakdown Card */}
        <div className="flex flex-col justify-between rounded-xl border border-gray-800/60 bg-gray-900/50 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
                <DoorClosed className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Total Rooms
                </span>
                <p className="text-2xl font-extrabold text-gray-100 leading-none mt-0.5">
                  {roomsTotal}
                </p>
              </div>
            </div>
          </div>

          {/* Status Breakdown Badges */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800/60 text-xs">
            <div className="flex flex-col items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-center">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Occupied</span>
              </div>
              <span className="mt-1 text-sm font-bold text-gray-100">
                {roomsOccupied}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 p-2 text-center">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400">
                <Home className="h-3 w-3" />
                <span>Free</span>
              </div>
              <span className="mt-1 text-sm font-bold text-gray-100">
                {roomsFree}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-[#D3AD32]/30 bg-[#D3AD32]/10 p-2 text-center">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#D3AD32]">
                <Lock className="h-3 w-3" />
                <span>Reserved</span>
              </div>
              <span className="mt-1 text-sm font-bold text-gray-100">
                {roomsReserved}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyOverview
