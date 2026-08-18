interface UserProfileProps {
  name?: string
  role?: string
  className?: string
}

export const UserProfile = ({
  name = 'Solomon Degefe',
  role = 'Platform Supervisor',
  className = '',
}: UserProfileProps) => {
  return (
    <div className={`flex items-center gap-3 rounded-lg p-2 ${className}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D3AD32]/30 bg-[#D3AD32]/10 font-bold text-[#D3AD32] text-sm">
        SD
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-gray-900" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-gray-100">{name}</h4>
        <p className="truncate text-xs text-gray-400">{role}</p>
      </div>
    </div>
  )
}

export default UserProfile
