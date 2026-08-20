import { useState, useEffect, useCallback } from 'react'
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Lock,
  Pencil,
  AlertCircle,
  RefreshCw,
  FileCheck,
  Key,
} from 'lucide-react'
import type { User } from '../../services/types/auth'
import { getProfileApi } from '../../services/api/apiClient'
import { useAuth } from '../../context/useAuth'
import EditProfileModal from '../../components/profile/EditProfileModal'
import ChangePasswordModal from '../../components/profile/ChangePasswordModal'

export const Profile = () => {
  const { setUser: setAuthUser } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  // Fetch user profile on mount
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getProfileApi()
      setProfile(data)
      setAuthUser(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load profile. Please try again.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [setAuthUser])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Callback when profile is updated in modal
  const handleProfileUpdated = (updatedUser: User) => {
    setProfile(updatedUser)
    setAuthUser(updatedUser)
  }

  // Initials calculation
  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'AK'

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Loading profile...
          </span>
        </div>
      </div>
    )
  }

  if (errorMessage || !profile) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0F131C] p-8 text-center text-gray-400 max-w-lg mx-auto mt-10">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-200">Unable to load profile</h3>
        <p className="mt-1 text-xs text-gray-400">
          {errorMessage || 'Please check your connection and try again.'}
        </p>
        <button
          type="button"
          onClick={fetchProfile}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-10">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-100">
          My Profile
        </h1>
        <p className="mt-1 text-xs md:text-sm text-gray-400">
          Manage your personal information and account details.
        </p>
      </div>

      {/* 2. Profile Summary Card */}
      <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#D3AD32]/40 bg-[#D3AD32]/10 text-xl font-black text-[#D3AD32] shadow-md">
              {initials}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-[#0F131C]" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-gray-100">
                  {profile.fullName || 'Abebe Kebede'}
                </h2>
                <span className="rounded-full border border-[#D3AD32]/30 bg-[#D3AD32]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#D3AD32] capitalize">
                  {profile.role || 'Super Admin'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
                <span>{profile.email || 'abebe@yekondominium.com'}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-[#D3AD32]" />
                <span>{profile.condoName || 'Sunrise Condominium'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] shadow-sm shrink-0"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 3. Personal Information Card */}
        <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-[#D3AD32]">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100">
                Personal Information
              </h3>
              <p className="text-[11px] text-gray-400">
                Your primary contact and national details
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="block text-gray-500 font-medium">Full Name</span>
              <p className="mt-0.5 font-semibold text-gray-200">
                {profile.fullName || 'Abebe Kebede'}
              </p>
            </div>

            <div>
              <span className="block text-gray-500 font-medium">Email Address</span>
              <p className="mt-0.5 font-semibold text-gray-200">
                {profile.email || 'abebe@yekondominium.com'}
              </p>
            </div>

            <div>
              <span className="block text-gray-500 font-medium">Phone Number</span>
              <p className="mt-0.5 font-semibold text-gray-200 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-500" />
                <span>{profile.phoneNumber || '+251 91 122 3344'}</span>
              </p>
            </div>

            <div>
              <span className="block text-gray-500 font-medium">FAN Number</span>
              <p className="mt-0.5 font-semibold text-[#D3AD32] font-mono">
                {profile.fan || '1234567890123456'}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Account Information Card */}
        <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-[#D3AD32]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100">
                Account Information
              </h3>
              <p className="text-[11px] text-gray-400">
                Property role and verification parameters
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="block text-gray-500 font-medium">System Role</span>
              <span className="mt-1 inline-block rounded-full border border-gray-800 bg-gray-900 px-2.5 py-0.5 font-bold text-gray-200 capitalize">
                {profile.role || 'Super Admin'}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 font-medium">Verification Status</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <FileCheck className="h-3 w-3" />
                  <span>{profile.isVerified !== false ? 'Verified' : 'Pending Verification'}</span>
                </span>
              </div>
            </div>

            <div>
              <span className="block text-gray-500 font-medium">Assigned Condominium</span>
              <p className="mt-0.5 font-semibold text-gray-200">
                {profile.condoName || 'Sunrise Condominium'}
              </p>
            </div>

            <div>
              <span className="block text-gray-500 font-medium">Condo Code</span>
              <p className="mt-0.5 font-bold text-[#D3AD32] font-mono">
                {profile.condoCode || 'BBA-01'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Security Card */}
      <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-[#D3AD32]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100">Security</h3>
              <p className="text-xs text-gray-400">
                Manage your password and authentication security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Lock className="h-3.5 w-3.5 text-gray-500" />
              <span>••••••••••••</span>
            </div>

            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D3AD32]/40 bg-[#D3AD32]/10 px-4 py-2 text-xs font-bold text-[#D3AD32] transition-colors hover:bg-[#D3AD32]/20"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          user={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdated}
        />
      )}

      {/* 7. Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}
    </div>
  )
}

export default Profile
