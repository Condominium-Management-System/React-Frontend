import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  badgeText?: string
  subtext?: string
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  badgeText,
  subtext,
}: StatCardProps) => {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-800/80 bg-[#0F131C] p-5 shadow-sm transition-colors hover:border-gray-700/80">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          {title}
        </span>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32] shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold tracking-tight text-gray-100 md:text-3xl">
          {value}
        </span>
        {badgeText && (
          <span className="rounded-full border border-[#D3AD32]/30 bg-[#D3AD32]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#D3AD32]">
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800/60 pt-2 font-medium">
          {subtext}
        </div>
      )}
    </div>
  )
}

export default StatCard
