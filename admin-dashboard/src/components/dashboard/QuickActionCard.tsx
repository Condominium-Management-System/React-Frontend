import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  onClick?: () => void
  isPlaceholder?: boolean
}

export const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  isPlaceholder = false,
}: QuickActionCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full flex-col justify-between rounded-xl border border-gray-800/80 bg-[#0F131C] p-5 text-left shadow-sm transition-all duration-200 ${
        isPlaceholder
          ? 'cursor-default opacity-85 hover:border-gray-800'
          : 'hover:-translate-y-0.5 hover:border-[#D3AD32]/50 hover:bg-[#131926] hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32] shadow-sm transition-colors group-hover:border-[#D3AD32]/50 group-hover:bg-[#D3AD32]/20">
          <Icon className="h-5 w-5" />
        </div>
        {isPlaceholder ? (
          <span className="rounded-md border border-gray-800 bg-gray-900/80 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            Coming Soon
          </span>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800/80 text-gray-400 transition-colors group-hover:bg-[#D3AD32] group-hover:text-gray-950">
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-base font-bold text-gray-100 transition-colors group-hover:text-[#D3AD32]">
          {title}
        </h4>
        <p className="mt-1 text-xs text-gray-400 line-clamp-2">{description}</p>
      </div>
    </button>
  )
}

export default QuickActionCard
