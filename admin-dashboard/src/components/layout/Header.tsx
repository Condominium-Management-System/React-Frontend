import { useLocation } from 'react-router-dom'
import { Search, Bell, Menu } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

interface HeaderProps {
  title?: string
  onMobileMenuToggle?: () => void
}

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/dashboard':
      return 'Super Admin Dashboard'
    case '/condos':
      return 'Condo Management'
    case '/users':
      return 'User Management'
    case '/payments':
      return 'Payment Management'
    default:
      return 'Super Admin Dashboard'
  }
}

export const Header = ({ title, onMobileMenuToggle }: HeaderProps) => {
  const location = useLocation()
  const { user } = useAuth()
  const displayTitle = title || getPageTitle(location.pathname)

  const displayName = user?.fullName || 'Super Admin'
  const displayRole = user?.role || 'Console Mode'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SA'

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-800/80 bg-[#0F131C] px-4 md:px-6 text-gray-200 select-none">
      {/* Left Area: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 focus:outline-none md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="truncate text-lg md:text-xl font-bold tracking-tight text-gray-100">
          {displayTitle}
        </h2>
      </div>

      {/* Right Area: Search, Notifications & User Display */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search Terminal Field (Visual Only) */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search terminal..."
            readOnly
            className="w-full rounded-lg border border-gray-800 bg-gray-900/80 py-1.5 pl-9 pr-3 text-xs text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32]/50 focus:outline-none"
          />
        </div>

        {/* Notifications Icon (Visual Only) */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 focus:outline-none"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D3AD32] ring-2 ring-[#0F131C]" />
        </button>

        {/* Super Admin User Area */}
        <div className="flex items-center gap-2 border-l border-gray-800 pl-3 md:pl-5">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-semibold text-gray-200">{displayName}</p>
            <p className="text-[10px] text-[#D3AD32] capitalize">{displayRole}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D3AD32]/40 bg-[#D3AD32]/10 font-bold text-[#D3AD32] text-xs shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
