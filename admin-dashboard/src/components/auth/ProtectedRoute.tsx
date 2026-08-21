import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { canAccessWebConsole } from '../../utils/roleHelpers'
import { ShieldAlert, LogOut } from 'lucide-react'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090D16] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Loading Console...
          </span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 1. Block residents or non-console roles from accessing web application
  if (!canAccessWebConsole(user?.role)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090D16] p-4 text-gray-100 select-none">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0F131C] p-8 text-center shadow-2xl space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Access Denied</h2>
            <p className="mt-1 text-xs text-gray-400">
              The web management console is restricted to administrators. Your account role ({user?.role || 'user'}) does not have permission to access this console.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-500 cursor-pointer w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Return to Login</span>
          </button>
        </div>
      </div>
    )
  }

  // 2. Specific role restriction check (e.g., Super Admin only routes)
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
