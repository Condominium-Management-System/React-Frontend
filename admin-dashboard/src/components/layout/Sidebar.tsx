import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  User,
  LogOut,
  X,
} from 'lucide-react'
import UserProfile from './UserProfile'
import { useAuth } from '../../context/useAuth'
import { isSuperAdmin } from '../../utils/roleHelpers'

interface SidebarProps {
  onNavClick?: () => void
  onCloseMobile?: () => void
  isMobile?: boolean
}

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Condo Management',
    path: '/condos',
    icon: Building2,
    superAdminOnly: true,
  },
  {
    name: 'User Management',
    path: '/users',
    icon: Users,
  },
  {
    name: 'Payment Management',
    path: '/payments',
    icon: CreditCard,
  },
  {
    name: 'My Profile',
    path: '/profile',
    icon: User,
  },
]

export const Sidebar = ({
  onNavClick,
  onCloseMobile,
  isMobile = false,
}: SidebarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const isSuper = isSuperAdmin(user?.role)
  const visibleNavItems = navItems.filter((item) => {
    if (item.superAdminOnly) {
      return isSuper
    }
    return true
  })

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-800/80 bg-[#0F131C] text-gray-200 select-none">
      {/* Branding Section */}
      <div className="flex items-center justify-between border-b border-gray-800/80 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32] shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-none tracking-wider text-gray-100">
              HOME<span className="text-[#D3AD32]">AXIS</span>
            </h1>
            <span className="mt-1 block font-semibold text-[10px] tracking-widest text-[#D3AD32]/80 uppercase">
              {isSuper ? 'SUPER CONSOLE' : 'ADMIN CONSOLE'}
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200 focus:outline-none"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        <div className="px-3 pb-2 font-semibold text-[11px] tracking-wider text-gray-500 uppercase">
          Navigation
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'border-l-4 border-[#D3AD32] bg-[#D3AD32]/10 text-[#D3AD32] shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive ? 'text-[#D3AD32]' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Profile & Logout Section */}
      <div className="border-t border-gray-800/80 p-4 space-y-3">
        <UserProfile />

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900/60 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-gray-700 hover:bg-gray-800 hover:text-[#D3AD32] focus:outline-none cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout Console</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
