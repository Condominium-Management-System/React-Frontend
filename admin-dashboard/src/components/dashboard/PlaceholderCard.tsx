import { Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface PlaceholderCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  message: string
  actionLabel?: string
  className?: string
}

export const PlaceholderCard = ({
  title,
  description,
  icon: Icon = Info,
  message,
  actionLabel,
  className = '',
}: PlaceholderCardProps) => {
  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-gray-800/80 bg-[#0F131C] p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100">{title}</h3>
            {description && <p className="text-xs text-gray-400">{description}</p>}
          </div>
        </div>
        <span className="rounded-full border border-gray-800 bg-gray-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">
          Coming Soon
        </span>
      </div>

      <div className="my-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-800 bg-gray-950/40 p-6 text-center">
        <Icon className="h-8 w-8 text-gray-600 mb-2" />
        <p className="text-sm font-medium text-gray-400 max-w-sm">{message}</p>
      </div>

      {actionLabel && (
        <div className="border-t border-gray-800/80 pt-3 text-right">
          <span className="text-xs font-semibold text-gray-500">{actionLabel}</span>
        </div>
      )}
    </div>
  )
}

export default PlaceholderCard
