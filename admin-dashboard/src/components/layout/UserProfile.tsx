import { useAuth } from '../../context/useAuth'

interface UserProfileProps {
  name?: string
  role?: string
  className?: string
}

export const UserProfile = ({
  name,
  role,
  className = '',
}: UserProfileProps) => {
  const { user } = useAuth()

  const displayName = name || user?.fullName || 'Solomon Degefe'
  const displayRole = role || user?.role || 'Platform Supervisor'

  // Generate initials dynamically (e.g. "Solomon Degefe" -> "SD")
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SD'

  return (
    <div className={`flex items-center gap-3 rounded-lg p-2 ${className}`}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D3AD32]/30 bg-[#D3AD32]/10 font-bold text-[#D3AD32] text-sm">
        {initials}
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-gray-900" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-gray-100">
          {displayName}
        </h4>
        <p className="truncate text-xs text-gray-400 capitalize">
          {displayRole}
        </p>
      </div>
    </div>
  )
}

export default UserProfile
